# 🚀 立即部署邮件功能

## ✅ 已配置
- **收件邮箱**: eikoyang@mono-grp.com.cn
- **邮件服务**: MailChannels（免费，无需 SMTP 密码）
- **自动回复**: 已启用

## 📝 部署步骤

### 步骤 1: 部署 Cloudflare Workers（后端）

```bash
cd workers
wrangler login
wrangler deploy
```

**说明**：
- `wrangler login` 会打开浏览器，让您登录 Cloudflare 账号
- 登录后，`wrangler deploy` 会自动部署更新

### 步骤 2: 部署 Vercel（前端）

```bash
cd ..
git add .
git commit -m "Add email contact functionality"
git push origin main
```

**说明**：
- 推送到 Git 后，Vercel 会自动检测并部署
- 大约 1-2 分钟后即可使用

## 🎯 测试邮件功能

部署完成后：

1. 访问您的网站
2. 滚动到"联系我们"部分
3. 填写测试表单：
   - 姓名：测试
   - 邮箱：您的测试邮箱
   - 公司：测试公司
   - 消息：这是一条测试消息
4. 点击发送

**预期结果**：
- ✅ 页面显示"发送中..."
- ✅ 显示成功提示
- ✅ **eikoyang@mono-grp.com.cn** 收到新表单通知
- ✅ 测试邮箱收到自动回复

## 📧 邮件内容

### 您会收到的邮件（eikoyang@mono-grp.com.cn）
```
主题：新的联系表单 - [客户姓名]

内容：
- 客户姓名
- 客户邮箱
- 公司名称
- 咨询内容

回复：点击"回复"按钮会自动填充客户邮箱
```

### 客户会收到的自动回复
```
主题：感谢您的咨询 - 上海英武实业

内容：
- 感谢语
- 确认已收到
- 回显客户提交的信息
- 公司联系方式
```

## 🔧 快速命令（一键部署）

```bash
cd workers && wrangler login && wrangler deploy && cd .. && git add . && git commit -m "Add email contact functionality" && git push
```

## ❓ 常见问题

### Q: 需要配置 SMTP 吗？
**A:** 不需要！我们使用 MailChannels，无需 SMTP 配置。

### Q: 密码（Yang1234$）用在哪里？
**A:** 这个密码只用于您登录邮箱查收邮件，不需要在代码中配置。

### Q: 邮件会进垃圾箱吗？
**A:** 可能。首次收到邮件后，标记为"不是垃圾邮件"即可。建议添加 SPF/DKIM 记录提高送达率（见下方）。

### Q: 如何提高邮件送达率？
**A:** 在您的域名 DNS 中添加以下记录：

**SPF 记录**：
```
类型: TXT
名称: @
内容: v=spf1 include:relay.mailchannels.net ~all
```

**DKIM 记录**（可选）：
```
类型: TXT
名称: mailchannels._domainkey
内容: （需要从 MailChannels 获取）
```

## 📊 监控

### 查看 Workers 实时日志
```bash
cd workers
wrangler tail
```

这会显示所有请求、邮件发送状态和错误信息。

## 💰 成本
- **完全免费** ✅
- MailChannels: 免费
- Cloudflare Workers: 免费额度（每天 100,000 请求）
- Vercel: 免费额度

## 🎉 下一步

部署完成后，建议：
1. 先自己测试一次
2. 确认邮件接收正常
3. 通知团队可以使用
4. 关注 eikoyang@mono-grp.com.cn 的新邮件

---

**现在就开始部署吧！** 🚀

如有问题，查看 Workers 日志：`wrangler tail`

