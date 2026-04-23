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
  'バッグ類',
  'ヨガウェア',
  'ヨガ用具',
  'スポーツ・レジャー',
  '機能性ウェア',
  '軍手と手袋',
  '雑貨類',
  'アニメ類'
];

// 获取所有分类
app.get('/api/categories', async (c) => {
  return c.json({ categories });
});

/**
 * 数据版本号（cache-busting）
 * --------------------------
 * 所有读接口让前端带上 ?v=<version>，写操作后我们自增该值，
 * 旧 URL 不再被任何新请求使用，CDN/浏览器里的旧缓存自然失效。
 * 前端用 /api/products/version 拉当前版本，很快（no-store）。
 */
async function getProductsVersion(env: Bindings): Promise<string> {
  const row = await env.DB.prepare(
    "SELECT value FROM app_meta WHERE key = 'products_version'"
  ).first<{ value: string }>();
  return row?.value ?? '1';
}

async function bumpProductsVersion(env: Bindings): Promise<void> {
  // SQLite 没有原生原子 int++，这里用一次 read → write。
  // 并发写时即使偶发相等也无害：版本只需保证「写操作后严格大于之前观察过的值」。
  const current = await getProductsVersion(env);
  const next = String((parseInt(current, 10) || 0) + 1);
  await env.DB.prepare(
    "UPDATE app_meta SET value = ? WHERE key = 'products_version'"
  ).bind(next).run();
}

// 极简端点：前端启动/写操作后 invalidate 时读取
app.get('/api/products/version', async (c) => {
  const version = await getProductsVersion(c.env);
  return new Response(JSON.stringify({ version }), {
    headers: {
      'Content-Type': 'application/json',
      // 必须永远最新：既不走 CDN 也不走浏览器缓存
      'Cache-Control': 'no-store',
    },
  });
});

// 获取所有商品（支持分页和搜索）
// 缓存策略：依赖 Cache-Control + stale-while-revalidate，不再手写 Cache API。
// URL 里的 v 会让旧版本自动成为不同的缓存键。
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
        display_order: product.display_order,
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

    // 有 ?v= 的请求：把缓存交给 Cloudflare 的 Cache-Control + SWR。
    // 版本变更 → URL 变 → 新缓存键，旧缓存自然失效。
    // 没有 ?v= 的请求（例如直接 curl）退化为短缓存，避免脏数据长时间滞留。
    const hasVersion = new URL(c.req.url).searchParams.has('v');
    const cacheControl = hasVersion
      // 版本化 URL：内容不可变，可长期缓存
      ? 'public, max-age=60, s-maxage=31536000, immutable'
      // 非版本化 URL：只短缓存，降低脏缓存窗口
      : 'public, max-age=0, s-maxage=30, stale-while-revalidate=120';

    return new Response(JSON.stringify(responseData), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': cacheControl,
      },
    });
  } catch (error: any) {
    console.error('Error fetching products:', error);
    return c.json({ error: error.message }, 500);
  }
});

// 获取单个商品
app.get('/api/products/:id', async (c) => {
  const id = c.req.param('id');

  try {
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

    const hasVersion = new URL(c.req.url).searchParams.has('v');
    const cacheControl = hasVersion
      ? 'public, max-age=60, s-maxage=31536000, immutable'
      : 'public, max-age=0, s-maxage=30, stale-while-revalidate=120';

    return new Response(JSON.stringify({ product: productData }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': cacheControl,
      },
    });
  } catch (error: any) {
    console.error('Error fetching product:', error);
    return c.json({ error: error.message }, 500);
  }
});

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
    
    await bumpProductsVersion(c.env);

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
    
    await bumpProductsVersion(c.env);

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
    
    await bumpProductsVersion(c.env);

    return c.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error: any) {
    return c.json({ error: error.message }, 500);
  }
});

// 更新产品显示顺序（支持分类内排序）
app.put('/api/products/:id/order', async (c) => {
  const id = c.req.param('id');
  
  try {
    const { display_order, category } = await c.req.json();
    
    if (typeof display_order !== 'number') {
      return c.json({ error: 'display_order must be a number' }, 400);
    }
    
    // 获取当前产品信息
    const product = await c.env.DB.prepare('SELECT * FROM products WHERE id = ?').bind(id).first();
    
    if (!product) {
      return c.json({ error: 'Product not found' }, 404);
    }
    
    // 如果指定了分类，在该分类内重新排序
    if (category) {
      // 获取该分类下的所有产品，按当前display_order排序
      const { results } = await c.env.DB.prepare(
        'SELECT id, display_order FROM products WHERE category = ? ORDER BY display_order ASC, created_at DESC'
      ).bind(category).all();
      
      const categoryProducts = results as any[];
      
      // 找到当前产品在列表中的位置
      const currentIndex = categoryProducts.findIndex(p => p.id === parseInt(id));
      
      if (currentIndex === -1) {
        return c.json({ error: 'Product not found in category' }, 404);
      }
      
      // 移除当前产品
      const [currentProduct] = categoryProducts.splice(currentIndex, 1);
      
      // 插入到新位置（display_order - 1，因为数组从0开始）
      const newIndex = Math.max(0, Math.min(display_order - 1, categoryProducts.length));
      categoryProducts.splice(newIndex, 0, currentProduct);
      
      // 批量更新所有产品的display_order
      const statements = categoryProducts.map((p, idx) => {
        return c.env.DB.prepare(
          'UPDATE products SET display_order = ? WHERE id = ?'
        ).bind(idx + 1, p.id);
      });
      
      await c.env.DB.batch(statements);
    } else {
      // 全局排序（不推荐使用，但保留向后兼容）
      await c.env.DB.prepare(
        'UPDATE products SET display_order = ? WHERE id = ?'
      ).bind(display_order, id).run();
    }
    
    await bumpProductsVersion(c.env);

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
    
    await bumpProductsVersion(c.env);

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
    
    await bumpProductsVersion(c.env);

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
    
    await bumpProductsVersion(c.env);

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
  const rawKey = c.req.param('key');
  // 处理 URL 编码的路径（含中文/日文、空格等），确保与 R2 中的原始对象键一致
  const key = (() => {
    try {
      // decodeURIComponent 不会改变已是纯 ASCII 的键，但会把 %E5%.. 还原为原始字符
      return decodeURIComponent(rawKey);
    } catch {
      return rawKey;
    }
  })();
  
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

// 发送联系表单邮件
app.post('/api/contact', async (c) => {
  try {
    const body = await c.req.json();
    const { name, email, company, message } = body;
    
    if (!name || !email || !message) {
      return c.json({ error: 'Name, email, and message are required' }, 400);
    }
    
    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return c.json({ error: 'Invalid email format' }, 400);
    }
    
    // 使用 MailChannels 发送邮件
    const recipientEmail = 'eikoyang@mono-grp.com.cn';
    
    // 发送给管理员的邮件内容
    const adminEmailContent = `
      <h2>新的联系表单提交</h2>
      <p><strong>姓名：</strong>${name}</p>
      <p><strong>邮箱：</strong>${email}</p>
      <p><strong>公司：</strong>${company || '未提供'}</p>
      <p><strong>消息：</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>此邮件来自英物国際貿易网站联系表单</small></p>
    `;
    
    // 发送给用户的自动回复邮件内容
    const autoReplyContent = `
      <h2>感谢您的咨询</h2>
      <p>尊敬的${name}，</p>
      <p>我们已经收到您的咨询信息，我们会尽快与您联系。</p>
      <p>以下是您提交的信息：</p>
      <p><strong>公司：</strong>${company || '未提供'}</p>
      <p><strong>消息：</strong></p>
      <p>${message.replace(/\n/g, '<br>')}</p>
      <hr>
      <p>上海英物国際貿易有限公司<br>
      Office I, 15/F, Huamin Hanjun Tower, 726 Yan'an West Road,<br>
      Changning District, Shanghai, China 〒200050</p>
      <p>如有紧急事宜，请直接致电我们。</p>
    `;
    
    try {
      // 发送邮件给管理员
      const adminEmailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: recipientEmail, name: '英物国際貿易' }],
              dkim_domain: 'mono-grp.com.cn',
              dkim_selector: 'mailchannels',
            },
          ],
          from: {
            email: 'noreply@yingwu-website.workers.dev',
            name: '英物国際貿易网站',
          },
          reply_to: {
            email: email,
            name: name,
          },
          subject: `新的联系表单 - ${name}`,
          content: [
            {
              type: 'text/html',
              value: adminEmailContent,
            },
          ],
        }),
      });
      
      if (!adminEmailResponse.ok) {
        console.error('Failed to send admin email:', await adminEmailResponse.text());
      }
      
      // 发送自动回复给用户
      const userEmailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: [{ email: email, name: name }],
            },
          ],
          from: {
            email: 'noreply@yingwu-website.workers.dev',
            name: '上海英物国際貿易有限公司',
          },
          subject: '感谢您的咨询 - 上海英物国際貿易',
          content: [
            {
              type: 'text/html',
              value: autoReplyContent,
            },
          ],
        }),
      });
      
      if (!userEmailResponse.ok) {
        console.error('Failed to send auto-reply email:', await userEmailResponse.text());
      }
      
      return c.json({ 
        success: true, 
        message: 'Email sent successfully' 
      });
    } catch (emailError: any) {
      console.error('Email sending error:', emailError);
      return c.json({ 
        error: 'Failed to send email', 
        details: emailError.message 
      }, 500);
    }
  } catch (error: any) {
    console.error('Contact form error:', error);
    return c.json({ error: error.message }, 500);
  }
});

export default app;

