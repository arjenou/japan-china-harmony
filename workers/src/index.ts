import { Hono } from 'hono';
import { cors } from 'hono/cors';

type Bindings = {
  DB: D1Database;
  BUCKET: R2Bucket;
  ALLOWED_ORIGINS: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// CORS 中间件
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// 分类列表（日语）
const categories = [
  'ヨガウェア',
  'ヨガ用具',
  'スポーツ・レジャー',
  '機能性ウェア',
  'バッグ類',
  '軍手と手袋',
  '雑貨類',
  'アニメ類'
];

// 获取所有分类
app.get('/api/categories', async (c) => {
  return c.json({ categories });
});

// 获取所有商品（支持分页和搜索）
app.get('/api/products', async (c) => {
  const category = c.req.query('category');
  const search = c.req.query('search');
  const page = parseInt(c.req.query('page') || '1');
  const pageSize = parseInt(c.req.query('pageSize') || '12');
  
  try {
    // 构建查询条件
    let whereConditions: string[] = [];
    const params: any[] = [];
    
    if (category && category !== '全て') {
      whereConditions.push('category = ?');
      params.push(category);
    }
    
    if (search) {
      whereConditions.push('name LIKE ?');
      params.push(`%${search}%`);
    }
    
    const whereClause = whereConditions.length > 0 
      ? ' WHERE ' + whereConditions.join(' AND ')
      : '';
    
    // 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM products${whereClause}`;
    const countResult = await c.env.DB.prepare(countQuery).bind(...params).first();
    const total = (countResult as any)?.total || 0;
    
    // 计算偏移量
    const offset = (page - 1) * pageSize;
    
    // 获取分页数据
    const query = `SELECT * FROM products${whereClause} ORDER BY created_at DESC LIMIT ? OFFSET ?`;
    const { results } = await c.env.DB.prepare(query)
      .bind(...params, pageSize, offset)
      .all();
    
    // 获取每个商品的图片
    for (const product of results) {
      const images = await c.env.DB.prepare(
        'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order'
      ).bind(product.id).all();
      
      (product as any).images = images.results.map((img: any) => img.image_url);
    }
    
    return c.json({ 
      products: results,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 获取单个商品
app.get('/api/products/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const product = await c.env.DB.prepare(
      'SELECT * FROM products WHERE id = ?'
    ).bind(id).first();
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    const images = await c.env.DB.prepare(
      'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY display_order'
    ).bind(id).all();
    
    (product as any).images = images.results.map((img: any) => img.image_url);
    
    return c.json({ product });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 创建商品
app.post('/api/products', async (c) => {
  try {
    const formData = await c.req.formData();
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const features = formData.get('features') as string;
    const folder = formData.get('folder') as string || name.replace(/[^a-zA-Z0-9]/g, '_');
    
    if (!name || !category) {
      return c.json({ error: 'Name and category are required' }, 400);
    }
    
    // 上传图片到 R2
    const images: string[] = [];
    const files = formData.getAll('images') as File[];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (file && file.size > 0) {
        const fileName = `${folder}/${Date.now()}_${i}_${file.name}`;
        const arrayBuffer = await file.arrayBuffer();
        
        await c.env.BUCKET.put(fileName, arrayBuffer, {
          httpMetadata: {
            contentType: file.type,
          },
        });
        
        images.push(fileName);
      }
    }
    
    if (images.length === 0) {
      return c.json({ error: 'At least one image is required' }, 400);
    }
    
    // 插入商品
    const result = await c.env.DB.prepare(
      'INSERT INTO products (name, category, folder, image, features) VALUES (?, ?, ?, ?, ?)'
    ).bind(name, category, folder, images[0], features).run();
    
    const productId = result.meta.last_row_id;
    
    // 插入图片
    for (let i = 0; i < images.length; i++) {
      await c.env.DB.prepare(
        'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)'
      ).bind(productId, images[i], i).run();
    }
    
    return c.json({ 
      success: true, 
      productId,
      message: 'Product created successfully' 
    }, 201);
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 更新商品
app.put('/api/products/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    const formData = await c.req.formData();
    const name = formData.get('name') as string;
    const category = formData.get('category') as string;
    const features = formData.get('features') as string;
    
    if (!name || !category) {
      return c.json({ error: 'Name and category are required' }, 400);
    }
    
    // 更新商品信息
    await c.env.DB.prepare(
      'UPDATE products SET name = ?, category = ?, features = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(name, category, features, id).run();
    
    // 处理新上传的图片
    const files = formData.getAll('images') as File[];
    if (files.length > 0 && files[0].size > 0) {
      const product = await c.env.DB.prepare('SELECT folder FROM products WHERE id = ?').bind(id).first();
      const folder = (product as any)?.folder || 'default';
      
      // 获取当前图片数量
      const { results } = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM product_images WHERE product_id = ?'
      ).bind(id).all();
      
      let displayOrder = (results[0] as any)?.count || 0;
      
      for (const file of files) {
        if (file && file.size > 0) {
          const fileName = `${folder}/${Date.now()}_${displayOrder}_${file.name}`;
          const arrayBuffer = await file.arrayBuffer();
          
          await c.env.BUCKET.put(fileName, arrayBuffer, {
            httpMetadata: {
              contentType: file.type,
            },
          });
          
          await c.env.DB.prepare(
            'INSERT INTO product_images (product_id, image_url, display_order) VALUES (?, ?, ?)'
          ).bind(id, fileName, displayOrder).run();
          
          displayOrder++;
        }
      }
    }
    
    return c.json({ 
      success: true, 
      message: 'Product updated successfully' 
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 删除商品
app.delete('/api/products/:id', async (c) => {
  const id = c.req.param('id');
  
  try {
    // 获取商品图片
    const images = await c.env.DB.prepare(
      'SELECT image_url FROM product_images WHERE product_id = ?'
    ).bind(id).all();
    
    // 删除 R2 中的图片
    for (const img of images.results) {
      await c.env.BUCKET.delete((img as any).image_url);
    }
    
    // 删除数据库记录
    await c.env.DB.prepare('DELETE FROM product_images WHERE product_id = ?').bind(id).run();
    await c.env.DB.prepare('DELETE FROM products WHERE id = ?').bind(id).run();
    
    return c.json({ 
      success: true, 
      message: 'Product deleted successfully' 
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 删除单张图片
app.delete('/api/products/:id/images/:imageUrl', async (c) => {
  const id = c.req.param('id');
  const imageUrl = decodeURIComponent(c.req.param('imageUrl'));
  
  try {
    // 删除 R2 中的图片
    await c.env.BUCKET.delete(imageUrl);
    
    // 删除数据库记录
    await c.env.DB.prepare(
      'DELETE FROM product_images WHERE product_id = ? AND image_url = ?'
    ).bind(id, imageUrl).run();
    
    return c.json({ 
      success: true, 
      message: 'Image deleted successfully' 
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 获取图片
app.get('/api/images/:key{.+}', async (c) => {
  const key = c.req.param('key');
  
  try {
    const object = await c.env.BUCKET.get(key);
    
    if (!object) {
      return c.json({ error: 'Image not found' }, 404);
    }
    
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    headers.set('cache-control', 'public, max-age=31536000');
    
    return new Response(object.body, { headers });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default app;

