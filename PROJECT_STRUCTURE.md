# 项目结构说明

## 📂 完整项目结构

```
japan-china-harmony/
│
├── workers/                          # 🔥 Cloudflare Workers 后台
│   ├── src/
│   │   └── index.ts                 # API 主文件（Hono 框架）
│   ├── scripts/
│   │   ├── import-products.js       # 产品数据导入脚本
│   │   ├── upload-images.js         # 图片批量上传脚本
│   │   └── README.md                # 脚本使用文档
│   ├── package.json                 # Workers 依赖
│   ├── wrangler.toml                # Cloudflare 配置 ⚙️
│   ├── schema.sql                   # 数据库架构
│   ├── tsconfig.json                # TypeScript 配置
│   ├── README.md                    # 完整 API 文档 📖
│   ├── QUICK_START.md               # 5分钟快速开始 ⚡
│   ├── 使用说明.md                  # 中文使用指南 🇨🇳
│   ├── .gitignore
│   └── .nvmrc
│
├── src/
│   ├── pages/
│   │   ├── Index.tsx                # 主页
│   │   ├── ProductDetail.tsx        # 商品详情页
│   │   ├── Admin.tsx                # 🎯 管理后台页面（新增）
│   │   └── NotFound.tsx             # 404 页面
│   ├── components/                  # UI 组件
│   ├── data/
│   │   └── products.ts              # 原有商品数据
│   └── App.tsx                      # 路由配置（已更新）
│
├── public/
│   ├── Goods/zahuo/                 # 现有商品图片
│   └── robots.txt
│
├── CLOUDFLARE_SETUP.md              # 🌟 项目总览（从这里开始）
├── DEPLOYMENT_GUIDE.md              # 完整部署指南
├── PROJECT_STRUCTURE.md             # 本文件
├── README.md                        # 项目说明
└── package.json                     # 前端依赖

```

## 🎯 快速导航

### 开始使用
1. 📖 **首先阅读**: [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)
2. ⚡ **快速部署**: [workers/QUICK_START.md](./workers/QUICK_START.md)
3. 🇨🇳 **中文指南**: [workers/使用说明.md](./workers/使用说明.md)

### 技术文档
- 📚 **API 文档**: [workers/README.md](./workers/README.md)
- 🚀 **部署指南**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- 🔧 **脚本说明**: [workers/scripts/README.md](./workers/scripts/README.md)

## 📦 核心文件说明

### ⚙️ 配置文件

| 文件 | 说明 | 需要修改 |
|------|------|---------|
| `workers/wrangler.toml` | Cloudflare 配置 | ✅ 必须（database_id） |
| `workers/schema.sql` | 数据库表结构 | ❌ 不需要 |
| `src/pages/Admin.tsx` | 管理界面 | ✅ 必须（API_BASE_URL） |

### 🔥 核心代码

| 文件 | 功能 | 技术 |
|------|------|------|
| `workers/src/index.ts` | API 后端 | Hono + D1 + R2 |
| `src/pages/Admin.tsx` | 管理前端 | React + shadcn/ui |
| `src/App.tsx` | 路由配置 | React Router |

### 📝 脚本工具

| 脚本 | 功能 | 使用场景 |
|------|------|----------|
| `scripts/import-products.js` | 生成导入 SQL | 批量导入商品 |
| `scripts/upload-images.js` | 上传图片到 R2 | 迁移现有图片 |

## 🔄 数据流

```
用户 → 管理界面 (Admin.tsx)
         ↓
    Workers API (index.ts)
         ↓
    ┌────┴────┐
    ↓         ↓
D1 数据库   R2 存储
(商品信息)  (图片文件)
```

## 🌐 URL 结构

### 开发环境
- 前端：`http://localhost:5173`
- 管理后台：`http://localhost:5173/admin`
- Worker API：`http://localhost:8787`

### 生产环境
- 前端：`https://your-domain.com`
- 管理后台：`https://your-domain.com/admin`
- Worker API：`https://yingwu-admin.xxx.workers.dev`

## 📊 数据库结构

### products 表
- 存储商品基本信息
- 字段：id, name, category, folder, image, features, created_at, updated_at

### product_images 表
- 存储商品多图
- 字段：id, product_id, image_url, display_order, created_at

## 🗂️ 商品分类

系统支持 8 个分类：

1. 瑜伽服
2. 瑜伽器具
3. 运动休闲类
4. 功能性服装
5. 包类
6. 軍手と手袋（手套）
7. 雑貨類（杂货）
8. アニメ類（动漫）

## 🛠️ 开发工作流

### 1. 本地开发

```bash
# Terminal 1: Worker
cd workers
npm run dev

# Terminal 2: Frontend
npm run dev
```

### 2. 添加新功能

**后端（API）**:
- 编辑 `workers/src/index.ts`
- 添加新的路由和处理函数

**前端（管理界面）**:
- 编辑 `src/pages/Admin.tsx`
- 添加新的 UI 和功能

### 3. 部署

```bash
# 部署 Worker
cd workers
npm run deploy

# 部署前端（通过 Git 推送）
git add .
git commit -m "Update"
git push
```

## 📋 待办事项（可选优化）

### 功能增强
- [ ] 添加商品搜索
- [ ] 批量操作（删除、导出）
- [ ] 图片压缩和优化
- [ ] 数据统计和报表

### 安全性
- [ ] 管理员身份验证
- [ ] API 密钥保护
- [ ] 速率限制
- [ ] 输入验证增强

### 性能优化
- [ ] 图片 CDN
- [ ] API 缓存
- [ ] 分页加载
- [ ] 懒加载图片

### 用户体验
- [ ] 拖拽排序图片
- [ ] 批量上传优化
- [ ] 进度显示
- [ ] 移动端优化

## 🔑 环境变量

### Workers (wrangler.toml)
```toml
[vars]
ALLOWED_ORIGINS = "*"  # 修改为你的域名
```

### Frontend (可选)
```env
VITE_API_URL=https://your-worker-url.workers.dev
```

## 🚨 重要提醒

1. ⚠️ **安全**: 生产环境必须添加身份验证
2. 📦 **备份**: 定期备份 D1 数据库
3. 🔧 **配置**: 部署前检查所有配置文件
4. 💰 **成本**: 监控 Cloudflare 使用量
5. 🔒 **CORS**: 生产环境限制允许的源

## 📞 技术支持

### 遇到问题？

1. 查看对应的文档文件
2. 检查 Worker 日志：`npm run tail`
3. 查看浏览器控制台
4. 参考 Cloudflare 官方文档

### 有用的命令

```bash
# 查看状态
wrangler whoami
wrangler deployments list

# 数据库操作
wrangler d1 list
wrangler d1 execute yingwu_products --command="SELECT COUNT(*) FROM products"

# R2 操作
wrangler r2 bucket list
wrangler r2 object list yingwu-images
```

## 🎓 学习资源

- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Hono 框架](https://hono.dev/)
- [D1 数据库](https://developers.cloudflare.com/d1/)
- [R2 存储](https://developers.cloudflare.com/r2/)

---

**开始使用**: 阅读 [CLOUDFLARE_SETUP.md](./CLOUDFLARE_SETUP.md)

**祝你开发顺利！** 🚀

