# 🚀 Vercel 邮件功能部署指南

## ✅ 已完成配置

- ✅ 收件邮箱：eikoyang@mono-grp.com.cn
- ✅ 邮件服务：MailChannels（免费，无需配置）
- ✅ 自动回复：已启用
- ✅ API 路由：/api/contact
- ✅ 完全部署在 Vercel

## 📁 文件说明

已创建/修改的文件：
- `api/contact.ts` - Vercel Serverless Function（邮件 API）
- `src/components/Contact.tsx` - 前端表单（调用本地 API）
- `vercel.json` - Vercel 配置（支持 API 路由）
- `src/contexts/LanguageContext.tsx` - 多语言支持

## 🚀 部署步骤（3 种方法）

### 方法 1：Git 推送自动部署（最简单）✅

```bash
git add .
git commit -m "Add email contact functionality"
git push origin main
```

**说明**：推送到 Git 后，Vercel 会自动检测并部署（1-2 分钟）

---

### 方法 2：Vercel CLI 手动部署

```bash
# 安装 Vercel CLI（如果还没安装）
npm install -g vercel

# 部署到生产环境
vercel --prod
```

---

### 方法 3：Vercel Dashboard 手动部署

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 找到您的项目
3. 点击 "Deployments"
4. 点击 "Redeploy"

## 🧪 测试邮件功能

部署完成后：

1. 访问您的网站：https://your-site.vercel.app
2. 滚动到"联系我们"部分
3. 填写测试表单：
   ```
   姓名：测试用户
   邮箱：your-test@email.com
   公司：测试公司
   消息：这是一条测试消息
   ```
4. 点击"发送"

### 预期结果

- ✅ 页面显示"发送中..."
- ✅ 显示成功提示
- ✅ **eikoyang@mono-grp.com.cn** 收到表单内容
- ✅ 测试邮箱收到自动回复

## 📧 邮件内容示例

### 管理员收到的邮件（eikoyang@mono-grp.com.cn）

```
主题：新的联系表单 - [客户姓名]

新的联系表单提交

姓名：张三
邮箱：zhangsan@example.com
公司：ABC 公司
消息：
我们对贵公司的产品很感兴趣...

---
此邮件来自英武实业网站联系表单
```

**回复功能**：点击"回复"会自动填充客户邮箱

### 客户收到的自动回复

```
主题：感谢您的咨询 - 上海英武实业

感谢您的咨询

尊敬的张三，

我们已经收到您的咨询信息，我们会尽快与您联系。

以下是您提交的信息：
公司：ABC 公司
消息：
我们对贵公司的产品很感兴趣...

---
上海英武实业有限公司
Office I, 15/F, Huamin Hanjun Tower, 726 Yan'an West Road,
Changning District, Shanghai, China 〒200050

如有紧急事宜，请直接致电我们。
```

## 🔍 检查部署状态

### 在 Vercel Dashboard

1. 登录 Vercel
2. 选择您的项目
3. 查看最新的 Deployment
4. 确认状态为 "Ready"

### 检查 API 是否正常

部署完成后，访问：
```
https://your-site.vercel.app/api/contact
```

应该返回：
```json
{"error":"Method not allowed"}
```

这是正常的（因为需要 POST 请求）。

## ❓ 常见问题

### Q1: 邮件未收到？

**解决方案**：
1. ✅ 检查垃圾邮件文件夹
2. ✅ 查看 Vercel 部署日志
3. ✅ 尝试不同的测试邮箱
4. ✅ 等待 1-2 分钟（邮件可能有延迟）

### Q2: 显示 404 错误？

**解决方案**：
1. 确认 `api/contact.ts` 文件存在
2. 确认 `vercel.json` 已更新
3. 重新部署：`git push` 或 `vercel --prod`

### Q3: 需要配置 SMTP 吗？

**答案**：❌ 不需要！
- 我们使用 MailChannels 免费服务
- 无需 SMTP 密码配置
- 您的密码（Yang1234&）只用于登录邮箱查收邮件

### Q4: 邮件送达率低？

**解决方案**：在域名 DNS 中添加 SPF 记录：

```
类型: TXT
名称: @
内容: v=spf1 include:relay.mailchannels.net ~all
```

这会显著提高邮件送达率。

### Q5: 如何查看错误日志？

在 Vercel Dashboard：
1. 选择项目
2. 点击 "Functions"
3. 点击 "contact"
4. 查看 "Logs"

## 💰 成本

- **完全免费** ✅
- Vercel Hobby Plan: 免费
- MailChannels: 免费
- 无需额外服务

## 🔒 安全特性

已实现的安全措施：
- ✅ 输入验证（必填字段、邮箱格式）
- ✅ HTML 转义（防止 XSS 攻击）
- ✅ CORS 配置
- ✅ 错误处理

## 🎯 下一步建议

部署完成后：
1. ✅ 自己测试一次
2. ✅ 确认邮件接收正常
3. ✅ 通知团队功能已上线
4. ⚠️ 首次收到邮件时，标记为"不是垃圾邮件"

## 📊 监控

### 查看实时请求

在 Vercel Dashboard：
- 项目 → Functions → contact
- 可以看到所有请求记录和响应状态

### 查看邮件发送统计

MailChannels 不提供发送统计，但您可以：
- 检查 eikoyang@mono-grp.com.cn 收件箱
- 查看 Vercel Function 日志

## 🚨 故障排除

如果遇到问题：

1. **检查文件是否正确**：
   ```bash
   ls -la api/
   # 应该看到 contact.ts
   ```

2. **检查 vercel.json**：
   ```bash
   cat vercel.json
   # 应该包含 /api/(.*) 路由
   ```

3. **查看浏览器控制台**：
   - 打开开发者工具
   - 查看 Network 标签
   - 找到 /api/contact 请求
   - 查看响应内容

4. **重新部署**：
   ```bash
   git add .
   git commit -m "Fix email function"
   git push
   ```

## 🎉 完成！

现在您可以：
```bash
git add .
git commit -m "Add email contact functionality"
git push origin main
```

等待 1-2 分钟，Vercel 自动部署完成后即可使用！

---

**需要帮助？** 查看 Vercel Function 日志或联系支持。

