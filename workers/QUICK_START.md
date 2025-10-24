# 快速开始指南

## 5分钟部署指南

### 步骤 1: 安装 Wrangler CLI

```bash
npm install -g wrangler
```

### 步骤 2: 登录 Cloudflare

```bash
wrangler login
```

浏览器会打开，授权 Wrangler 访问你的 Cloudflare 账户。

### 步骤 3: 进入 workers 目录并安装依赖

```bash
cd workers
npm install
```

### 步骤 4: 创建 D1 数据库

```bash
wrangler d1 create yingwu_products
```

**重要**: 复制输出的 `database_id`，例如：

```
[[d1_databases]]
binding = "DB"
database_name = "yingwu_products"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
```

### 步骤 5: 更新 wrangler.toml

打开 `wrangler.toml`，替换 `your-database-id` 为上一步获得的 database_id：

```toml
[[d1_databases]]
binding = "DB"
database_name = "yingwu_products"
database_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"  # 替换这里
```

### 步骤 6: 创建 R2 存储桶

```bash
wrangler r2 bucket create yingwu-images
```

如果需要预览环境（可选）：

```bash
wrangler r2 bucket create yingwu-images-preview
```

### 步骤 7: 初始化数据库

```bash
npm run db:init
```

### 步骤 8: 部署到生产环境

```bash
npm run deploy
```

部署成功后，你会看到类似输出：

```
Published yingwu-admin (x.xx sec)
  https://yingwu-admin.your-subdomain.workers.dev
```

### 步骤 9: 更新前端 API 地址

在 `/src/pages/Admin.tsx` 中，找到：

```typescript
const API_BASE_URL = 'https://yingwu.wangyunjie1101.workers.dev';
```

替换为你的 Worker URL。

### 步骤 10: 访问管理界面

1. 启动前端开发服务器：
   ```bash
   cd ..  # 返回项目根目录
   npm run dev
   ```

2. 在浏览器中访问：
   ```
   http://localhost:5173/admin
   ```

3. 开始添加商品！

## 本地开发

### 启动 Worker 开发服务器

```bash
cd workers
npm run dev
```

Worker 将在 `http://localhost:8787` 运行。

### 启动前端开发服务器

在另一个终端：

```bash
npm run dev
```

前端将在 `http://localhost:5173` 运行。

### 测试 API

```bash
# 获取商品列表
curl http://localhost:8787/api/products

# 获取分类列表
curl http://localhost:8787/api/categories
```

## 常用命令

### 查看 Worker 日志

```bash
cd workers
npm run tail
```

### 查询数据库

```bash
# 查看所有商品
wrangler d1 execute yingwu_products --command="SELECT * FROM products"

# 查看商品数量
wrangler d1 execute yingwu_products --command="SELECT COUNT(*) as total FROM products"
```

### 查看 R2 存储

```bash
# 列出所有图片
wrangler r2 object list yingwu-images

# 获取存储桶信息
wrangler r2 bucket info yingwu-images
```

## 故障排查

### 问题 1: 部署失败 - "database_id is required"

**解决方案**: 确保已在 `wrangler.toml` 中正确设置了 database_id。

### 问题 2: 图片上传失败

**解决方案**: 检查：
1. R2 存储桶是否已创建
2. `wrangler.toml` 中的存储桶名称是否正确
3. 图片大小是否超过限制（建议 < 5MB）

### 问题 3: CORS 错误

**解决方案**: 检查 Worker 代码中的 CORS 中间件配置，确保允许你的前端域名。

### 问题 4: 数据库查询失败

**解决方案**: 
1. 确认数据库已初始化：`npm run db:init`
2. 查看 Worker 日志：`npm run tail`
3. 手动查询数据库检查表结构

## 生产环境配置

### 1. 添加自定义域名

在 Cloudflare Dashboard 中：
1. 进入 Workers & Pages
2. 选择你的 Worker
3. 点击 "Triggers" 标签
4. 添加自定义域名

### 2. 配置环境变量

在 `wrangler.toml` 中添加：

```toml
[env.production]
vars = { ALLOWED_ORIGINS = "https://your-domain.com" }
```

### 3. 启用 R2 公共访问（可选）

如果想让图片可以直接通过 R2 URL 访问：

```bash
wrangler r2 bucket update yingwu-images --public
```

**注意**: 这会让所有图片公开可访问。

### 4. 数据库备份

定期导出数据库：

```bash
wrangler d1 export yingwu_products --output=backup.sql
```

恢复数据库：

```bash
wrangler d1 execute yingwu_products --file=backup.sql
```

## 下一步

- [ ] 添加管理员身份验证
- [ ] 实现图片压缩和优化
- [ ] 添加批量导入功能
- [ ] 设置自动备份
- [ ] 配置 CDN 缓存策略

## 获取帮助

如果遇到问题：

1. 查看 [README.md](./README.md) 了解详细文档
2. 检查 [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
3. 运行 `npm run tail` 查看实时日志

祝你使用愉快！🎉

