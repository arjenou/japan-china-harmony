# 部署指南 - Yingwu 商品管理系统

本指南将帮助你部署整个系统，包括前端网站和 Cloudflare Workers 后台。

## 系统架构

```
┌─────────────────┐         ┌──────────────────┐
│   前端网站      │ ───────▶│ Cloudflare       │
│   (React/Vite)  │         │ Workers API      │
└─────────────────┘         └──────────────────┘
                                     │
                    ┌────────────────┴────────────────┐
                    │                                  │
            ┌───────▼────────┐              ┌─────────▼────────┐
            │  D1 Database   │              │   R2 Storage     │
            │  (商品数据)    │              │   (图片存储)    │
            └────────────────┘              └──────────────────┘
```

## 部分 1: 部署 Cloudflare Workers 后台

### 前置要求

- Cloudflare 账户（免费即可）
- Node.js 18+ 和 npm

### 步骤详解

#### 1. 安装并登录 Wrangler

```bash
# 全局安装 Wrangler CLI
npm install -g wrangler

# 登录 Cloudflare
wrangler login
```

#### 2. 创建 D1 数据库

```bash
cd workers
wrangler d1 create yingwu_products
```

记下输出的 `database_id`。

#### 3. 配置 wrangler.toml

打开 `workers/wrangler.toml`，更新 `database_id`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "yingwu_products"
database_id = "你的-database-id-在这里"
```

#### 4. 创建 R2 存储桶

```bash
wrangler r2 bucket create yingwu-images
wrangler r2 bucket create yingwu-images-preview
```

#### 5. 安装依赖并初始化数据库

```bash
npm install
npm run db:init
```

#### 6. 部署 Worker

```bash
npm run deploy
```

记下部署后的 URL，例如：`https://yingwu-admin.your-subdomain.workers.dev`

#### 7. 迁移数据库到生产环境

```bash
npm run db:migrate
```

## 部分 2: 部署前端网站

### 选项 A: 部署到 Cloudflare Pages（推荐）

#### 1. 创建 GitHub 仓库

```bash
# 在项目根目录
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/your-username/your-repo.git
git push -u origin main
```

#### 2. 连接到 Cloudflare Pages

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入 "Workers & Pages"
3. 点击 "Create application"
4. 选择 "Pages" 标签
5. 连接你的 GitHub 账户
6. 选择你的仓库

#### 3. 配置构建设置

- **Framework preset**: Vite
- **Build command**: `npm run build`
- **Build output directory**: `dist`

#### 4. 设置环境变量（可选）

在 "Settings" > "Environment variables" 中添加：

```
VITE_API_URL=https://yingwu-admin.your-subdomain.workers.dev
```

#### 5. 部署

点击 "Save and Deploy"。几分钟后，你的网站就会上线！

### 选项 B: 部署到其他平台

#### Vercel

```bash
npm install -g vercel
vercel
```

#### Netlify

```bash
npm install -g netlify-cli
netlify deploy
```

## 部分 3: 配置前端 API 地址

在部署前端之前，更新 API 地址：

### 1. 更新 Admin 页面

编辑 `src/pages/Admin.tsx`：

```typescript
const API_BASE_URL = 'https://你的-worker-url.workers.dev';
```

### 2. 重新构建和部署

```bash
npm run build
# 然后推送到 git 或重新部署
```

## 部分 4: 配置自定义域名（可选）

### 为 Worker 配置自定义域名

1. 在 Cloudflare Dashboard 中，进入你的 Worker
2. 点击 "Triggers" 标签
3. 点击 "Add Custom Domain"
4. 输入域名，如 `api.your-domain.com`
5. Cloudflare 会自动配置 DNS

### 为 Pages 配置自定义域名

1. 在 Cloudflare Pages 设置中
2. 点击 "Custom domains"
3. 添加你的域名
4. 按照说明更新 DNS 记录

## 部分 5: 初始化数据

### 导入现有商品数据

创建一个脚本来导入现有的产品数据：

```bash
cd workers
node scripts/import-products.js
```

或者使用管理界面手动添加商品。

## 部分 6: 测试

### 测试 API

```bash
# 测试获取商品列表
curl https://your-worker-url.workers.dev/api/products

# 测试获取分类
curl https://your-worker-url.workers.dev/api/categories
```

### 测试管理界面

1. 访问 `https://your-domain.com/admin`
2. 尝试添加一个测试商品
3. 上传图片
4. 验证图片是否正确显示

## 部分 7: 安全设置（重要！）

### 1. 添加身份验证

为管理界面添加简单的密码保护：

在 `src/pages/Admin.tsx` 开头添加：

```typescript
import { useEffect, useState } from 'react';

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  useEffect(() => {
    const password = localStorage.getItem('admin_password');
    if (password !== 'your-secret-password') {
      const input = prompt('请输入管理员密码：');
      if (input === 'your-secret-password') {
        localStorage.setItem('admin_password', input);
        setIsAuthenticated(true);
      } else {
        alert('密码错误');
        window.location.href = '/';
      }
    } else {
      setIsAuthenticated(true);
    }
  }, []);

  if (!isAuthenticated) {
    return <div>验证中...</div>;
  }

  // 原有的管理界面代码...
}
```

**注意**: 这只是基本保护。生产环境建议使用更安全的认证方案。

### 2. 配置 CORS

确保 Worker 只接受来自你域名的请求：

在 `workers/src/index.ts` 中更新 CORS 配置：

```typescript
app.use('/*', cors({
  origin: 'https://your-domain.com', // 替换为你的域名
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));
```

### 3. 设置速率限制

在 Cloudflare Dashboard 中为你的 Worker 设置速率限制。

## 部分 8: 监控和维护

### 查看 Worker 日志

```bash
cd workers
npm run tail
```

### 数据库备份

定期备份数据库：

```bash
wrangler d1 export yingwu_products --output=backup-$(date +%Y%m%d).sql
```

### 监控使用情况

在 Cloudflare Dashboard 中查看：
- Workers 请求数量
- D1 读写操作
- R2 存储使用量

## 成本估算

### Cloudflare 免费套餐包括：

- **Workers**: 每天 100,000 次请求
- **D1**: 每天 5GB 读取，100,000 次写入
- **R2**: 10GB 存储
- **Pages**: 无限带宽和请求

对于中小型网站，免费套餐完全够用！

## 故障排查

### Worker 部署失败

1. 检查 `wrangler.toml` 配置
2. 确保数据库和 R2 存储桶已创建
3. 查看错误日志：`wrangler tail`

### 图片无法显示

1. 检查 R2 存储桶名称是否正确
2. 确认图片已成功上传到 R2
3. 测试图片 URL：`https://your-worker-url/api/images/test.jpg`

### 数据库错误

1. 确认数据库已初始化：`npm run db:init`
2. 检查表结构：`wrangler d1 execute yingwu_products --command="SELECT name FROM sqlite_master WHERE type='table'"`

## 下一步优化

- [ ] 添加图片压缩和优化
- [ ] 实现批量导入/导出功能
- [ ] 添加商品搜索功能
- [ ] 设置自动备份
- [ ] 添加图片 CDN 加速
- [ ] 实现多用户管理
- [ ] 添加数据分析功能

## 获取帮助

- 查看 [workers/README.md](./workers/README.md) 了解 API 详情
- 查看 [workers/QUICK_START.md](./workers/QUICK_START.md) 了解快速开始
- [Cloudflare Workers 文档](https://developers.cloudflare.com/workers/)
- [Cloudflare Pages 文档](https://developers.cloudflare.com/pages/)

祝你部署顺利！🚀

