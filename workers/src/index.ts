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
  allowHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma'],
  exposeHeaders: ['X-Cache'],
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

// 获取所有商品（支持分页和搜索，带缓存）
app.get('/api/products', async (c) => {
  const category = c.req.query('category');
  const search = c.req.query('search');
  const page = parseInt(c.req.query('page') || '1');
  const pageSize = parseInt(c.req.query('pageSize') || '12');
  const timestamp = c.req.query('_t'); // 缓存破坏参数
  
  // 生成缓存键（不包含时间戳参数）
  const url = new URL(c.req.url);
  url.searchParams.delete('_t'); // 移除时间戳参数以生成一致的缓存键
  const cacheKey = url.toString();
  const cache = caches.default;
  
  // 如果有时间戳参数，跳过缓存（强制刷新）
  let response = null;
  if (!timestamp) {
    // 尝试从缓存获取
    response = await cache.match(cacheKey);
    
    if (response) {
      // 添加缓存命中标记
      const newResponse = new Response(response.body, response);
      newResponse.headers.set('X-Cache', 'HIT');
      return newResponse;
    }
  }
  
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
    
    const responseData = { 
      products: results,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
    
    // 创建响应并设置缓存头
    response = new Response(JSON.stringify(responseData), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300, s-maxage=600', // 客户端5分钟，CDN10分钟
        'X-Cache': 'MISS',
      },
    });
    
    // 只在没有时间戳时存入缓存
    if (!timestamp) {
      c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
    }
    
    return response;
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 获取单个商品（带缓存）
app.get('/api/products/:id', async (c) => {
  const id = c.req.param('id');
  
  // 生成缓存键
  const cacheKey = new URL(c.req.url);
  const cache = caches.default;
  
  // 尝试从缓存获取
  let response = await cache.match(cacheKey.toString());
  
  if (response) {
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('X-Cache', 'HIT');
    return newResponse;
  }
  
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
    
    // 创建响应并设置缓存头
    response = new Response(JSON.stringify({ product }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=600, s-maxage=1800', // 客户端10分钟，CDN30分钟
        'X-Cache': 'MISS',
      },
    });
    
    // 存入缓存
    c.executionCtx.waitUntil(cache.put(cacheKey.toString(), response.clone()));
    
    return response;
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 辅助函数：清除商品相关缓存
async function clearProductsCache(c: any) {
  const cache = caches.default;
  const baseUrl = new URL(c.req.url).origin;
  
  // 清除商品列表缓存（所有可能的分页和过滤组合）
  const keys = [
    `${baseUrl}/api/products`,
    `${baseUrl}/api/products?page=1`,
    `${baseUrl}/api/products?page=1&pageSize=12`,
  ];
  
  // 清除所有分类的缓存（日文分类）
  for (const category of categories) {
    keys.push(`${baseUrl}/api/products?category=${encodeURIComponent(category)}`);
    keys.push(`${baseUrl}/api/products?category=${encodeURIComponent(category)}&page=1`);
    keys.push(`${baseUrl}/api/products?category=${encodeURIComponent(category)}&page=1&pageSize=12`);
  }
  
  // 也清除中文分类（Admin页面使用的）
  const chineseCategories = [
    '瑜伽服', '瑜伽器具', '运动休闲类', '功能性服装', 
    '包类', '軍手と手袋', '雑貨類', 'アニメ類'
  ];
  
  for (const category of chineseCategories) {
    keys.push(`${baseUrl}/api/products?category=${encodeURIComponent(category)}`);
    keys.push(`${baseUrl}/api/products?category=${encodeURIComponent(category)}&page=1`);
    keys.push(`${baseUrl}/api/products?category=${encodeURIComponent(category)}&page=1&pageSize=12`);
  }
  
  // 批量删除缓存
  await Promise.all(keys.map(key => cache.delete(key)));
  
  // 额外的安全措施：尝试删除所有可能的URL变体
  console.log(`Cleared ${keys.length} cache keys`);
}

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
    const files = formData.getAll('images');
    
    for (let i = 0; i < files.length; i++) {
      const item = files[i];
      if (typeof item !== 'string' && item) {
        const file = item as File;
        if (file.size > 0) {
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
    
    // 清除缓存
    c.executionCtx.waitUntil(clearProductsCache(c));
    
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
    const files = formData.getAll('images');
    const firstFile = files[0];
    if (files.length > 0 && typeof firstFile !== 'string' && firstFile && (firstFile as File).size > 0) {
      const product = await c.env.DB.prepare('SELECT folder FROM products WHERE id = ?').bind(id).first();
      const folder = (product as any)?.folder || 'default';
      
      // 获取当前图片数量
      const { results } = await c.env.DB.prepare(
        'SELECT COUNT(*) as count FROM product_images WHERE product_id = ?'
      ).bind(id).all();
      
      let displayOrder = (results[0] as any)?.count || 0;
      
      for (const item of files) {
        if (typeof item !== 'string' && item) {
          const file = item as File;
          if (file.size > 0) {
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
    }
    
    // 清除缓存
    const cache = caches.default;
    const baseUrl = new URL(c.req.url).origin;
    c.executionCtx.waitUntil(
      Promise.all([
        clearProductsCache(c),
        cache.delete(`${baseUrl}/api/products/${id}`)
      ])
    );
    
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
    
    // 清除缓存
    const cache = caches.default;
    const baseUrl = new URL(c.req.url).origin;
    c.executionCtx.waitUntil(
      Promise.all([
        clearProductsCache(c),
        cache.delete(`${baseUrl}/api/products/${id}`)
      ])
    );
    
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

// 获取图片（强缓存，永不过期）
app.get('/api/images/:key{.+}', async (c) => {
  const key = c.req.param('key');
  
  // 使用 Cloudflare Cache API
  const cacheKey = new URL(c.req.url);
  const cache = caches.default;
  
  // 尝试从缓存获取
  let response = await cache.match(cacheKey.toString());
  
  if (response) {
    return response;
  }
  
  try {
    const object = await c.env.BUCKET.get(key);
    
    if (!object) {
      return c.json({ error: 'Image not found' }, 404);
    }
    
    const headers = new Headers();
    object.writeHttpMetadata(headers);
    headers.set('etag', object.httpEtag);
    // 图片缓存1年（immutable表示永不改变）
    headers.set('cache-control', 'public, max-age=31536000, immutable');
    headers.set('X-Cache', 'MISS');
    
    response = new Response(object.body, { headers });
    
    // 存入缓存
    c.executionCtx.waitUntil(cache.put(cacheKey.toString(), response.clone()));
    
    return response;
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

export default app;

