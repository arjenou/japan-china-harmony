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
  
  // 生成缓存键
  const cacheKey = new URL(c.req.url).toString();
  const cache = caches.default;
  
  // 尝试从缓存获取
  let response = await cache.match(cacheKey);
  
  if (response) {
    // 添加缓存命中标记
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('X-Cache', 'HIT');
    return newResponse;
  }
  
  try {
    // 构建查询条件
    let whereConditions: string[] = [];
    const params: any[] = [];
    
    if (category && category !== '全て') {
      whereConditions.push('p.category = ?');
      params.push(category);
    }
    
    if (search) {
      whereConditions.push('p.name LIKE ?');
      params.push(`%${search}%`);
    }
    
    const whereClause = whereConditions.length > 0 
      ? ' WHERE ' + whereConditions.join(' AND ')
      : '';
    
    // 获取总数
    const countQuery = `SELECT COUNT(*) as total FROM products p${whereClause}`;
    const countResult = await c.env.DB.prepare(countQuery).bind(...params).first();
    const total = (countResult as any)?.total || 0;
    
    // 计算偏移量
    const offset = (page - 1) * pageSize;
    
    // 优化：使用JOIN一次性获取产品和主图（只获取第一张图片）
    // 使用子查询获取每个产品的第一张图片
    const query = `
      SELECT 
        p.*,
        (SELECT pi.image_url 
         FROM product_images pi 
         WHERE pi.product_id = p.id 
         ORDER BY pi.display_order 
         LIMIT 1) as main_image,
        (SELECT GROUP_CONCAT(pi2.image_url)
         FROM product_images pi2
         WHERE pi2.product_id = p.id
         ORDER BY pi2.display_order) as all_images
      FROM products p
      ${whereClause}
      ORDER BY p.display_order ASC, p.created_at DESC 
      LIMIT ? OFFSET ?
    `;
    
    const { results } = await c.env.DB.prepare(query)
      .bind(...params, pageSize, offset)
      .all();
    
    // 处理结果：列表接口只返回主图
    const products = results.map((product: any) => {
      const images = product.all_images ? product.all_images.split(',') : [];
      return {
        id: product.id,
        name: product.name,
        image: product.main_image || (images[0] || ''),
        category: product.category,
        folder: product.folder,
        features: product.features,
        created_at: product.created_at,
        // 列表接口只返回主图，减少数据传输
        images: [product.main_image || (images[0] || '')],
      };
    });
    
    const responseData = { 
      products,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize)
    };
    
    // 创建响应并设置优化的缓存头
    // 使用 stale-while-revalidate 策略：过期后继续使用缓存，同时在后台更新
    response = new Response(JSON.stringify(responseData), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=3600', // CDN缓存30分钟，过期后1小时内可继续使用
        'X-Cache': 'MISS',
      },
    });
    
    // 存入缓存
    c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
    
    return response;
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 获取单个商品（带缓存）
app.get('/api/products/:id', async (c) => {
  const id = c.req.param('id');
  
  // 生成缓存键
  const cacheKey = new URL(c.req.url).toString();
  const cache = caches.default;
  
  // 尝试从缓存获取
  let response = await cache.match(cacheKey);
  
  if (response) {
    const newResponse = new Response(response.body, response);
    newResponse.headers.set('X-Cache', 'HIT');
    return newResponse;
  }
  
  try {
    // 优化：使用JOIN一次性获取产品和所有图片
    const query = `
      SELECT 
        p.*,
        GROUP_CONCAT(pi.image_url ORDER BY pi.display_order) as all_images
      FROM products p
      LEFT JOIN product_images pi ON p.id = pi.product_id
      WHERE p.id = ?
      GROUP BY p.id
    `;
    
    const product = await c.env.DB.prepare(query).bind(id).first();
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    // 解析图片列表
    const allImages = (product as any).all_images;
    const productData: any = {
      id: product.id,
      name: product.name,
      image: product.image,
      category: product.category,
      folder: product.folder,
      features: product.features,
      created_at: product.created_at,
      images: allImages ? String(allImages).split(',') : [],
    };
    
    // 创建响应并设置优化的缓存头
    // 产品详情页缓存时间更长，因为访问频率较低但内容更稳定
    response = new Response(JSON.stringify({ product: productData }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200', // CDN缓存1小时，过期后2小时内可继续使用
        'X-Cache': 'MISS',
      },
    });
    
    // 存入缓存
    c.executionCtx.waitUntil(cache.put(cacheKey, response.clone()));
    
    return response;
  } catch (error: any) {
    console.error('Error fetching product:', error);
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
  
  // 清除多个页面的缓存（最多前10页）
  for (let page = 1; page <= 10; page++) {
    keys.push(`${baseUrl}/api/products?page=${page}`);
    keys.push(`${baseUrl}/api/products?page=${page}&pageSize=12`);
    keys.push(`${baseUrl}/api/products?page=${page}&pageSize=9`);
    keys.push(`${baseUrl}/api/products?page=${page}&pageSize=20`);
  }
  
  // 清除所有分类的缓存（日文分类）
  for (const category of categories) {
    keys.push(`${baseUrl}/api/products?category=${encodeURIComponent(category)}`);
    for (let page = 1; page <= 5; page++) {
      keys.push(`${baseUrl}/api/products?category=${encodeURIComponent(category)}&page=${page}`);
      keys.push(`${baseUrl}/api/products?category=${encodeURIComponent(category)}&page=${page}&pageSize=12`);
      keys.push(`${baseUrl}/api/products?category=${encodeURIComponent(category)}&page=${page}&pageSize=9`);
    }
  }
  
  // 也清除中文分类（Admin页面使用的）
  const chineseCategories = [
    '瑜伽服', '瑜伽器具', '运动休闲类', '功能性服装', 
    '包类', '軍手と手袋', '雑貨類', 'アニメ類'
  ];
  
  for (const category of chineseCategories) {
    keys.push(`${baseUrl}/api/products?category=${encodeURIComponent(category)}`);
    for (let page = 1; page <= 5; page++) {
      keys.push(`${baseUrl}/api/products?category=${encodeURIComponent(category)}&page=${page}`);
      keys.push(`${baseUrl}/api/products?category=${encodeURIComponent(category)}&page=${page}&pageSize=12`);
    }
  }
  
  // 批量删除缓存
  await Promise.all(keys.map(key => cache.delete(key)));
  
  console.log(`Cleared ${keys.length} cache keys`);
}

// 图片文件大小限制（5MB）
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

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
          // 验证文件大小
          if (file.size > MAX_IMAGE_SIZE) {
            return c.json({ 
              error: `图片 "${file.name}" 太大。文件大小: ${(file.size / 1024 / 1024).toFixed(2)}MB，最大允许: ${MAX_IMAGE_SIZE / 1024 / 1024}MB` 
            }, 400);
          }
          
          // 验证文件类型
          if (!file.type.startsWith('image/')) {
            return c.json({ error: `文件 "${file.name}" 不是有效的图片格式` }, 400);
          }
          
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
            // 验证文件大小
            if (file.size > MAX_IMAGE_SIZE) {
              return c.json({ 
                error: `图片 "${file.name}" 太大。文件大小: ${(file.size / 1024 / 1024).toFixed(2)}MB，最大允许: ${MAX_IMAGE_SIZE / 1024 / 1024}MB` 
              }, 400);
            }
            
            // 验证文件类型
            if (!file.type.startsWith('image/')) {
              return c.json({ error: `文件 "${file.name}" 不是有效的图片格式` }, 400);
            }
            
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

// 更新产品显示顺序
app.put('/api/products/:id/order', async (c) => {
  const id = c.req.param('id');
  
  try {
    const { display_order } = await c.req.json();
    
    if (typeof display_order !== 'number') {
      return c.json({ error: 'display_order must be a number' }, 400);
    }
    
    // 更新产品顺序
    await c.env.DB.prepare(
      'UPDATE products SET display_order = ? WHERE id = ?'
    ).bind(display_order, id).run();
    
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
      message: 'Product order updated successfully' 
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 批量更新产品顺序
app.put('/api/products/reorder', async (c) => {
  try {
    const { products } = await c.req.json();
    
    if (!Array.isArray(products)) {
      return c.json({ error: 'products must be an array' }, 400);
    }
    
    // 使用事务批量更新
    const statements = products.map((product: { id: number, display_order: number }) => {
      return c.env.DB.prepare(
        'UPDATE products SET display_order = ? WHERE id = ?'
      ).bind(product.display_order, product.id);
    });
    
    await c.env.DB.batch(statements);
    
    // 清除所有产品缓存
    c.executionCtx.waitUntil(clearProductsCache(c));
    
    return c.json({ 
      success: true, 
      message: 'Products order updated successfully' 
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
    
    // 清除相关缓存
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
      message: 'Image deleted successfully' 
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 更新图片顺序
app.put('/api/products/:id/images/reorder', async (c) => {
  const id = c.req.param('id');
  
  try {
    const body = await c.req.json();
    const { images } = body; // 期望是一个图片URL数组，按新的顺序排列
    
    if (!Array.isArray(images) || images.length === 0) {
      return c.json({ error: 'Images array is required' }, 400);
    }
    
    // 更新每个图片的 display_order
    for (let i = 0; i < images.length; i++) {
      await c.env.DB.prepare(
        'UPDATE product_images SET display_order = ? WHERE product_id = ? AND image_url = ?'
      ).bind(i, id, images[i]).run();
    }
    
    // 更新商品的主图为第一张图片
    await c.env.DB.prepare(
      'UPDATE products SET image = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
    ).bind(images[0], id).run();
    
    // 清除相关缓存
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
      message: 'Image order updated successfully' 
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

