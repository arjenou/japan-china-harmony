# Vercel 邮件功能配置指南

## 选择方案

### 方案 A：使用 Cloudflare Workers（推荐）✅

**优点：**
- 后端 API 已经在 Cloudflare Workers 上
- 无需额外配置
- 完全免费
- 代码已经写好

**步骤：**
```bash
cd workers
wrangler login
wrangler deploy
```

然后在前端推送代码到 Git，Vercel 会自动部署。

---

### 方案 B：使用 Vercel Serverless Functions

如果您想把所有功能都放在 Vercel，可以使用这个方案。

## Vercel 方案配置步骤

### 1. 安装依赖

```bash
npm install @vercel/node --save-dev
```

### 2. 更新前端 API 调用

修改 `src/components/Contact.tsx` 第 26 行：

```typescript
// 从：
const response = await fetch('https://yingwu-admin.arjenyang.workers.dev/api/contact', {

// 改为：
const response = await fetch('/api/contact', {
```

### 3. 选择邮件服务

#### 选项 1: 使用 MailChannels（免费）

无需额外配置，`api/contact.ts` 会自动使用 MailChannels。

#### 选项 2: 使用 Resend（推荐，免费 3000 封/月）

1. 注册 Resend: https://resend.com
2. 获取 API Key
3. 在 Vercel Dashboard 设置环境变量：
   - Key: `RESEND_API_KEY`
   - Value: 你的 API Key

### 4. 验证域名（可选，提高送达率）

在 Resend 中验证您的域名 `mono-grp.com.cn`：

1. 登录 Resend Dashboard
2. 添加域名
3. 在 DNS 中添加提供的记录（SPF、DKIM）

### 5. 部署到 Vercel

```bash
# 方法 1: Git 自动部署（推荐）
git add .
git commit -m "Add Vercel email API"
git push

# 方法 2: 手动部署
vercel --prod
```

## 架构对比

### Cloudflare Workers 架构（方案 A）
```
用户表单 → Vercel 前端 → Cloudflare Workers API → MailChannels → 邮件
```

**优点：**
- 统一的 API 管理（产品 + 邮件）
- 无需修改太多代码
- 完全免费

### Vercel 完全架构（方案 B）
```
用户表单 → Vercel 前端 → Vercel API Routes → Resend/MailChannels → 邮件
```

**优点：**
- 一站式管理
- 简化架构

**缺点：**
- 产品 API 还是在 Cloudflare（需要同时维护两个平台）

## 我的建议

**推荐使用方案 A（Cloudflare Workers）**，因为：

1. ✅ 您的后端 API 已经在 Cloudflare Workers 上运行
2. ✅ 邮件代码已经写好并测试
3. ✅ 完全免费，无需额外服务
4. ✅ 统一管理所有 API
5. ✅ 只需一个命令部署：`wrangler deploy`

如果选择方案 B，需要：
- 安装新依赖
- 修改前端代码
- 可能需要注册 Resend
- 维护两个平台的代码

## 快速决策

**如果您想要：**
- 最简单的部署 → 选择方案 A（Cloudflare Workers）
- 一站式管理 → 选择方案 B（Vercel），但产品 API 还是在 Cloudflare

**我的强烈建议：方案 A** ✅

只需要运行：
```bash
cd workers
wrangler login  # 首次需要
wrangler deploy
```

然后推送前端代码：
```bash
git add .
git commit -m "Add email functionality"
git push
```

完成！🎉

