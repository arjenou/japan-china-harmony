# 邮件功能部署说明 - Vercel + Cloudflare 架构

## 当前架构
- **前端**: Vercel（已部署）
- **后端 API**: Cloudflare Workers（已运行）
- **新功能**: 邮件发送（添加到 Cloudflare Workers）

## 部署步骤

### 1. 部署 Cloudflare Workers（后端）

```bash
# 进入 workers 目录
cd workers

# 登录 Cloudflare（首次需要，会打开浏览器）
wrangler login

# 部署更新
wrangler deploy
```

**注意**: `wrangler login` 会打开浏览器让您登录 Cloudflare 账号，授权后即可部署。

### 2. 部署 Vercel（前端）

由于我已经更新了前端代码（Contact.tsx），需要重新部署：

#### 方法 A: 通过 Git 自动部署（推荐）
```bash
# 提交代码到 Git
git add .
git commit -m "Add email contact functionality"
git push origin main
```

Vercel 会自动检测到更新并部署。

#### 方法 B: 手动部署
```bash
# 在项目根目录
npm run build

# 使用 Vercel CLI 部署
vercel --prod
```

## 测试邮件功能

1. 访问您的网站: https://your-site.vercel.app
2. 滚动到"联系我们"部分
3. 填写表单提交
4. 检查：
   - ✅ postmaster@mono-grp.com.cn 是否收到邮件
   - ✅ 用户邮箱是否收到自动回复

## 不需要的操作

❌ **不需要**配置阿里云 SMTP（smtp.qiye.aliyun.com）  
   - Cloudflare Workers 不支持直接 SMTP 连接
   - 使用 MailChannels 替代，免费且更简单

❌ **不需要**在 Vercel 中额外配置  
   - 前端只是调用 Cloudflare Workers API
   - 所有邮件逻辑在 Workers 中处理

## 文件修改说明

### 已修改的文件：
1. `workers/src/index.ts` - 添加了 `/api/contact` 端点
2. `src/components/Contact.tsx` - 表单提交调用 API
3. `src/contexts/LanguageContext.tsx` - 添加邮件相关翻译

### API 端点：
```
POST https://yingwu-admin.arjenyang.workers.dev/api/contact
```

## 快速部署命令

```bash
# 一步到位
cd workers && wrangler login && wrangler deploy && cd .. && git add . && git commit -m "Add email functionality" && git push
```

## 如果遇到问题

### Workers 部署失败
```bash
# 检查登录状态
wrangler whoami

# 重新登录
wrangler logout
wrangler login
```

### 前端没有更新
- 检查 Vercel Dashboard 是否有部署记录
- 清除浏览器缓存重新访问
- 检查控制台是否有错误

## 成本
- **MailChannels**: 免费
- **Cloudflare Workers**: 免费（已在使用）
- **Vercel**: 免费（已在使用）

**总成本**: $0 💰

