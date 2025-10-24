# Yingwu 商品管理后台 - Cloudflare Workers

这是一个基于 Cloudflare Workers、D1 数据库和 R2 存储的商品管理后台系统。

## 功能特性

- ✅ 商品管理（创建、读取、更新、删除）
- ✅ 多图片上传支持
- ✅ 8个商品分类管理
- ✅ 图片云存储（R2）
- ✅ RESTful API
- ✅ 响应式管理界面

## 技术栈

- **Cloudflare Workers**: 无服务器计算平台
- **D1 Database**: Cloudflare 的 SQLite 数据库
- **R2 Storage**: 对象存储服务（用于图片）
- **Hono**: 轻量级 Web 框架

## 部署步骤

### 1. 安装依赖

在 `workers` 目录下运行：

```bash
cd workers
npm install
```

### 2. 登录 Cloudflare

```bash
npx wrangler login
```

### 3. 创建 D1 数据库

```bash
npx wrangler d1 create yingwu_products
```

复制输出中的 `database_id`，替换 `wrangler.toml` 中的 `your-database-id`。

### 4. 创建 R2 存储桶

```bash
npx wrangler r2 bucket create yingwu-images
npx wrangler r2 bucket create yingwu-images-preview
```

### 5. 初始化数据库

```bash
npm run db:init
```

如果已经部署到生产环境，使用：

```bash
npm run db:migrate
```

### 6. 本地开发

```bash
npm run dev
```

Workers 将在本地运行，访问 `http://localhost:8787`

### 7. 部署到生产环境

```bash
npm run deploy
```

部署成功后，你的 API 将可以通过 `https://yingwu.wangyunjie1101.workers.dev` 访问。

## API 文档

### 基础 URL

```
https://yingwu.wangyunjie1101.workers.dev
```

### 端点列表

#### 1. 获取所有分类

```http
GET /api/categories
```

响应：
```json
{
  "categories": ["瑜伽服", "瑜伽器具", "运动休闲类", ...]
}
```

#### 2. 获取商品列表

```http
GET /api/products?category={category}
```

参数：
- `category` (可选): 按分类筛选

响应：
```json
{
  "products": [
    {
      "id": 1,
      "name": "商品名称",
      "category": "包类",
      "folder": "product_folder",
      "image": "main_image.jpg",
      "features": "特征描述",
      "images": ["image1.jpg", "image2.jpg"],
      "created_at": "2024-10-24T00:00:00.000Z",
      "updated_at": "2024-10-24T00:00:00.000Z"
    }
  ]
}
```

#### 3. 获取单个商品

```http
GET /api/products/:id
```

#### 4. 创建商品

```http
POST /api/products
Content-Type: multipart/form-data
```

表单字段：
- `name` (必需): 商品名称
- `category` (必需): 商品分类
- `features` (可选): 商品特征（多行）
- `folder` (可选): 文件夹名称
- `images` (必需): 图片文件（可多个）

#### 5. 更新商品

```http
PUT /api/products/:id
Content-Type: multipart/form-data
```

表单字段：
- `name` (必需): 商品名称
- `category` (必需): 商品分类
- `features` (可选): 商品特征
- `images` (可选): 新图片文件

#### 6. 删除商品

```http
DELETE /api/products/:id
```

#### 7. 删除商品图片

```http
DELETE /api/products/:id/images/:imageUrl
```

#### 8. 获取图片

```http
GET /api/images/:key
```

## 管理界面

管理界面已集成到主网站中，访问路径：

```
https://your-domain.com/admin
```

或本地开发：

```
http://localhost:5173/admin
```

### 功能说明

1. **商品列表**: 显示所有商品，支持按分类筛选
2. **添加商品**: 填写商品信息并上传多张图片
3. **编辑商品**: 修改商品信息，添加或删除图片
4. **删除商品**: 删除商品及其所有图片

## 商品分类

系统支持以下8个分类：

1. 瑜伽服
2. 瑜伽器具
3. 运动休闲类
4. 功能性服装
5. 包类
6. 軍手と手袋（手套类）
7. 雑貨類（杂货类）
8. アニメ類（动漫类）

## 数据库架构

### products 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| name | TEXT | 商品名称 |
| category | TEXT | 分类 |
| folder | TEXT | 文件夹名称 |
| image | TEXT | 主图路径 |
| features | TEXT | 商品特征 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

### product_images 表

| 字段 | 类型 | 说明 |
|------|------|------|
| id | INTEGER | 主键，自增 |
| product_id | INTEGER | 商品ID（外键） |
| image_url | TEXT | 图片路径 |
| display_order | INTEGER | 显示顺序 |
| created_at | DATETIME | 创建时间 |

## 常见问题

### 1. 如何查看 Worker 日志？

```bash
npm run tail
```

### 2. 如何执行 SQL 查询？

```bash
npx wrangler d1 execute yingwu_products --command="SELECT * FROM products LIMIT 10"
```

### 3. 如何列出 R2 中的文件？

```bash
npx wrangler r2 object list yingwu-images
```

### 4. 图片上传大小限制

Cloudflare Workers 默认上传限制为 100MB，单个文件建议不超过 5MB。

### 5. CORS 问题

如果遇到跨域问题，检查 `wrangler.toml` 中的 `ALLOWED_ORIGINS` 配置。

## 环境变量

在 `wrangler.toml` 中配置：

```toml
[vars]
ALLOWED_ORIGINS = "*"  # 允许的跨域来源
```

## 安全建议

1. **添加身份验证**: 在生产环境中，建议为管理界面添加身份验证
2. **限制上传大小**: 在客户端和服务器端都验证文件大小
3. **图片格式验证**: 只允许特定的图片格式（jpg, png, webp等）
4. **速率限制**: 使用 Cloudflare 的速率限制功能防止滥用

## 成本估算

Cloudflare Workers 免费套餐包括：
- 每天 100,000 次请求
- 10ms CPU 时间/请求
- D1: 每天 5GB 读取，100,000 次写入
- R2: 10GB 存储，每月 1,000,000 次 Class A 操作

对于中小型电商网站，免费套餐通常足够使用。

## 技术支持

如有问题，请查看：
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [D1 数据库文档](https://developers.cloudflare.com/d1/)
- [R2 存储文档](https://developers.cloudflare.com/r2/)
- [Hono 框架文档](https://hono.dev/)

## License

MIT

