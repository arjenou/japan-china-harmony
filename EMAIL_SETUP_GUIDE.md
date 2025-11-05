# 邮件功能设置指南

## 功能说明

已成功实现联系表单的邮件发送功能，包括：

1. **发送给管理员**：表单内容会发送到 `postmaster@mono-grp.com.cn`
2. **自动回复用户**：用户提交表单后会收到自动回复邮件
3. **多语言支持**：支持中文、日文、英文界面

## 技术实现

### 后端 (Cloudflare Workers)

使用 **MailChannels** 免费邮件服务，专为 Cloudflare Workers 优化。

#### API 端点
```
POST https://yingwu-admin.arjenyang.workers.dev/api/contact
```

#### 请求格式
```json
{
  "name": "用户姓名",
  "email": "user@example.com",
  "company": "公司名称（可选）",
  "message": "咨询内容"
}
```

#### 响应格式
```json
{
  "success": true,
  "message": "Email sent successfully"
}
```

### 前端 (React)

- 表单提交时显示加载状态
- 成功/失败都有相应的 Toast 提示
- 表单验证（必填字段、邮箱格式）

## 部署步骤

### 1. 部署 Workers 后端

```bash
cd workers
npm install
wrangler deploy
```

### 2. 部署前端

```bash
npm install
npm run build
# 部署 dist 目录到 Vercel 或其他平台
```

### 3. MailChannels 配置（可选 - 提高送达率）

为了提高邮件送达率，建议配置 SPF 和 DKIM：

#### SPF 记录
在您的域名 DNS 中添加：
```
TXT @ "v=spf1 include:_spf.mx.cloudflare.net include:relay.mailchannels.net ~all"
```

#### DKIM 记录
在您的域名 DNS 中添加：
```
TXT mailchannels._domainkey "v=DKIM1; p=YOUR_PUBLIC_KEY"
```

具体步骤：
1. 登录 Cloudflare Dashboard
2. 选择您的域名
3. 进入 DNS 设置
4. 添加上述 TXT 记录

## 使用阿里云企业邮箱 SMTP（可选方案）

如果您希望使用阿里云企业邮箱的 SMTP 发送邮件，由于 Cloudflare Workers 不支持直接的 SMTP 连接，需要使用以下方案之一：

### 方案 1: 使用中间代理服务

创建一个 Node.js 服务作为 SMTP 代理：

```javascript
// smtp-proxy.js
const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json());

const transporter = nodemailer.createTransport({
  host: 'smtp.qiye.aliyun.com',
  port: 465,
  secure: true,
  auth: {
    user: 'postmaster@mono-grp.com.cn',
    pass: 'Yang1234$'
  }
});

app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, html, replyTo } = req.body;
    
    await transporter.sendMail({
      from: '"英物国際貿易网站" <postmaster@mono-grp.com.cn>',
      to,
      subject,
      html,
      replyTo
    });
    
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(3000);
```

然后在 Workers 中调用这个代理服务。

### 方案 2: 使用 Cloudflare Email Routing

1. 在 Cloudflare Dashboard 中启用 Email Routing
2. 配置域名的 MX 记录
3. 设置转发规则到 `postmaster@mono-grp.com.cn`

## 邮件内容自定义

### 管理员邮件模板

在 `workers/src/index.ts` 的 `adminEmailContent` 变量中修改：

```typescript
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
```

### 自动回复邮件模板

在 `workers/src/index.ts` 的 `autoReplyContent` 变量中修改：

```typescript
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
```

## 测试

### 1. 本地测试 Workers

```bash
cd workers
wrangler dev
```

然后在前端代码中将 API 地址临时改为：
```typescript
const response = await fetch('http://localhost:8787/api/contact', {
  // ...
});
```

### 2. 测试邮件发送

提交联系表单，检查：
- [ ] 管理员是否收到邮件
- [ ] 用户是否收到自动回复
- [ ] 邮件内容是否正确
- [ ] 回复功能是否正常（点击管理员邮件中的回复按钮，应该自动填充用户邮箱）

## 监控和调试

### 查看 Workers 日志

```bash
cd workers
wrangler tail
```

### 常见问题

1. **邮件未收到**
   - 检查垃圾邮件文件夹
   - 验证 DNS 配置（SPF、DKIM）
   - 查看 Workers 日志

2. **邮件送达率低**
   - 配置 SPF 和 DKIM 记录
   - 使用已验证的发件域名
   - 避免在邮件中使用垃圾邮件关键词

3. **API 调用失败**
   - 检查 CORS 配置
   - 验证 Workers 已正确部署
   - 检查网络连接

## 成本

- **MailChannels**: 免费（通过 Cloudflare Workers）
- **Cloudflare Workers**: 免费额度（每天 100,000 请求）
- **存储**: 不需要额外存储

## 安全考虑

1. **速率限制**：建议添加速率限制防止滥用
2. **输入验证**：已实现基本验证，可根据需要加强
3. **垃圾邮件防护**：可以添加 reCAPTCHA 或其他验证机制

## 后续优化建议

1. 添加 reCAPTCHA 防止机器人提交
2. 实现更复杂的邮件模板（使用专业邮件模板引擎）
3. 添加邮件发送失败重试机制
4. 记录提交历史到数据库
5. 添加管理后台查看提交记录

