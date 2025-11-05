# 📧 お問い合わせ邮件功能 - 使用指南

> 快速开始使用联系表单邮件发送功能

---

## 🚀 快速开始（3步完成）

### 第1步：安装依赖

```bash
cd /Users/wang.yunjie/Desktop/Yingwu-web/japan-china-harmony
npm install
```

### 第2步：配置 Vercel 环境变量

在 [Vercel Dashboard](https://vercel.com/) 添加以下环境变量：

| Variable | Value |
|----------|-------|
| `SMTP_USER` | `eikoyang@mono-grp.com.cn` |
| `SMTP_PASSWORD` | `7a7Q33fO5QM3xMfy` |
| `RECIPIENT_EMAIL` | `eikoyang@mono-grp.com.cn` |

> 💡 详细配置步骤请参考 [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md)

### 第3步：部署

```bash
git add .
git commit -m "配置邮件功能"
git push origin main
```

或使用 Vercel CLI：

```bash
vercel --prod
```

---

## 🧪 测试功能

### 方法1：使用测试脚本

```bash
chmod +x test-contact-api.sh
./test-contact-api.sh https://你的域名.vercel.app/api/contact
```

### 方法2：通过网站界面

1. 访问你的网站
2. 滚动到"お問い合わせ"部分
3. 填写表单并提交
4. 检查邮箱是否收到邮件

---

## 📚 完整文档

### 🎯 推荐阅读顺序

1. **快速开始** - [QUICK_DEPLOY_EMAIL.md](./QUICK_DEPLOY_EMAIL.md) ⭐ 推荐！
   - 5分钟快速部署指南
   - 适合快速上手

2. **环境配置** - [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md)
   - 详细的环境变量配置步骤
   - 多种配置方法

3. **完整指南** - [CONTACT_EMAIL_SETUP.md](./CONTACT_EMAIL_SETUP.md)
   - 功能说明
   - 故障排查
   - 邮件模板自定义

4. **检查清单** - [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
   - 完整的部署检查清单
   - 确保不遗漏任何步骤

5. **完成报告** - [EMAIL_FEATURE_COMPLETE.md](./EMAIL_FEATURE_COMPLETE.md)
   - 功能完成情况
   - 技术实现细节

---

## ✨ 功能特点

✅ **自动发送** - 客户提交后自动发送邮件  
✅ **双向通知** - 管理员通知 + 客户自动回复  
✅ **多语言** - 支持中文/日文界面  
✅ **美化模板** - 专业的HTML邮件模板  
✅ **安全可靠** - 完善的验证和错误处理  
✅ **智能切换** - 自动尝试多个SMTP配置  

---

## 🔧 配置信息

### SMTP 服务器

- **提供商**: 阿里云企业邮箱
- **服务器**: smtp.qiye.aliyun.com
- **端口**: 465 (SSL) / 25 (TLS)
- **账号**: eikoyang@mono-grp.com.cn

### 环境变量

需要在 Vercel 配置的环境变量：

```env
SMTP_USER=eikoyang@mono-grp.com.cn
SMTP_PASSWORD=7a7Q33fO5QM3xMfy
RECIPIENT_EMAIL=eikoyang@mono-grp.com.cn
```

---

## 📧 邮件内容

### 管理员通知邮件

- **发送到**: eikoyang@mono-grp.com.cn
- **主题**: 新的联系表单 - [客户姓名]
- **包含**: 客户信息、咨询内容
- **功能**: 可直接回复客户

### 客户自动回复

- **发送到**: 客户填写的邮箱
- **主题**: 感谢您的咨询 - 上海英物国際貿易
- **包含**: 感谢信息、公司联系方式
- **目的**: 确认收到咨询

---

## 🔍 故障排查

### 常见问题快速解决

| 症状 | 解决方案 | 文档 |
|------|---------|------|
| 提交后显示错误 | 检查环境变量配置 | [配置指南](./VERCEL_ENV_SETUP.md) |
| 收不到邮件 | 检查垃圾邮件文件夹 | [故障排查](./CONTACT_EMAIL_SETUP.md#故障排查) |
| SMTP连接失败 | 验证授权密码 | [配置指南](./VERCEL_ENV_SETUP.md) |
| 环境变量不生效 | 重新部署项目 | [快速部署](./QUICK_DEPLOY_EMAIL.md) |

### 查看日志

```
Vercel Dashboard → 项目 → Deployments → Functions → api/contact
```

---

## 🎯 部署检查清单

使用以下清单确保部署成功：

- [ ] 运行 `npm install` 安装依赖
- [ ] 在 Vercel 配置 3 个环境变量
- [ ] 部署代码到 Vercel
- [ ] 执行测试脚本
- [ ] 管理员邮箱收到测试邮件
- [ ] 测试邮箱收到自动回复
- [ ] 检查 Vercel 函数日志无错误

> 💡 完整清单请查看 [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)

---

## 📞 获取帮助

### 文档查询

遇到问题时，按以下顺序查找：

1. 本文件（快速参考）
2. [QUICK_DEPLOY_EMAIL.md](./QUICK_DEPLOY_EMAIL.md) - 部署问题
3. [CONTACT_EMAIL_SETUP.md](./CONTACT_EMAIL_SETUP.md) - 功能问题
4. [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md) - 检查遗漏

### 技术支持

- 📧 邮箱: eikoyang@mono-grp.com.cn
- 📱 电话: 013661548592
- 🌐 网站: [你的网站]

---

## 🗂️ 文件说明

### 📄 配置文档

| 文件 | 说明 | 适用场景 |
|------|------|---------|
| `EMAIL_README.md` | 本文件，快速参考 | 快速查找信息 |
| `QUICK_DEPLOY_EMAIL.md` | 5分钟快速部署 | 初次部署 |
| `CONTACT_EMAIL_SETUP.md` | 完整配置指南 | 详细了解功能 |
| `VERCEL_ENV_SETUP.md` | 环境变量配置 | 配置环境变量 |
| `DEPLOYMENT_CHECKLIST.md` | 部署检查清单 | 确保完整部署 |
| `EMAIL_FEATURE_COMPLETE.md` | 功能完成报告 | 了解实现细节 |

### 🔧 代码文件

| 文件 | 说明 |
|------|------|
| `api/contact.ts` | 邮件发送API |
| `src/components/Contact.tsx` | 联系表单组件 |
| `package.json` | 项目依赖配置 |

### 🧪 工具文件

| 文件 | 说明 | 使用方法 |
|------|------|---------|
| `test-contact-api.sh` | API测试脚本 | `./test-contact-api.sh [URL]` |

---

## 💡 使用提示

### 日常维护

1. **每周测试一次** - 确保功能正常
   ```bash
   ./test-contact-api.sh https://你的域名.vercel.app/api/contact
   ```

2. **检查邮件送达** - 确保没有进垃圾邮件

3. **监控使用量** - 查看 Vercel Dashboard 使用情况

4. **定期更新密码** - 建议每3个月更新一次 SMTP 密码

### 优化建议

- 🔒 添加 reCAPTCHA 防止垃圾邮件
- 📊 添加统计分析追踪转化率
- 🎨 自定义邮件模板样式
- ⚡ 实现速率限制防止滥用

---

## 🎓 学习资源

### 相关技术文档

- [Vercel 文档](https://vercel.com/docs)
- [Nodemailer 文档](https://nodemailer.com/)
- [阿里云企业邮箱](https://qiye.aliyun.com/)
- [React 表单处理](https://react.dev/learn)

### 示例代码

查看 `api/contact.ts` 了解：
- SMTP 配置方法
- 邮件模板定义
- 错误处理机制
- 自动重试逻辑

---

## 🏁 开始使用

准备好了吗？让我们开始：

1. **首次部署** → 阅读 [QUICK_DEPLOY_EMAIL.md](./QUICK_DEPLOY_EMAIL.md)
2. **配置环境** → 参考 [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md)
3. **检查清单** → 使用 [DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)
4. **测试功能** → 运行 `./test-contact-api.sh`
5. **开始使用** → 客户可以联系你了！

---

## 📊 项目状态

✅ **代码**: 完成  
✅ **文档**: 完成  
✅ **测试工具**: 完成  
⏳ **部署**: 待完成（需要你操作）  
⏳ **测试**: 待完成（需要你验证）  

---

## 🎉 祝贺

恭喜你获得完整的邮件功能实现！

现在你有：
- ✨ 功能完整的联系表单
- 📧 自动邮件发送和回复
- 📚 详细的配置文档
- 🧪 完善的测试工具
- 🔧 专业的技术支持

**祝你部署顺利！** 🚀

---

**项目**: japan-china-harmony  
**功能**: お問い合わせ邮件系统  
**版本**: v1.0  
**更新**: 2024-11-05

