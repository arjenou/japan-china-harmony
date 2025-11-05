# お問い合わせ（联系表单）邮件功能配置指南

## 📧 功能说明

联系表单邮件功能已完全配置，支持以下功能：

### ✅ 已实现功能

1. **接收客户咨询** - 客户提交表单后，管理员邮箱会收到通知
2. **自动回复** - 客户会自动收到确认邮件
3. **多语言支持** - 界面支持中文和日文切换
4. **美化邮件模板** - HTML格式的专业邮件模板
5. **错误处理** - 完善的错误提示和重试机制

---

## 🔧 SMTP 配置信息

### 阿里云企业邮箱配置

- **SMTP 服务器**: `smtp.qiye.aliyun.com`
- **SMTP 端口**: `465` (SSL加密) 或 `25` (TLS)
- **邮箱账号**: `eikoyang@mono-grp.com.cn`
- **客户端授权密码**: `7a7Q33fO5QM3xMfy`

---

## 🚀 Vercel 环境变量配置

### 方法一：通过 Vercel Dashboard 配置（推荐）

1. 登录 [Vercel Dashboard](https://vercel.com/)
2. 选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下环境变量：

| Variable Name | Value |
|--------------|-------|
| `SMTP_USER` | `eikoyang@mono-grp.com.cn` |
| `SMTP_PASSWORD` | `7a7Q33fO5QM3xMfy` |
| `RECIPIENT_EMAIL` | `eikoyang@mono-grp.com.cn` |

5. 选择环境：**Production**, **Preview**, **Development** (全选)
6. 点击 **Save**
7. 重新部署项目使配置生效

### 方法二：通过 Vercel CLI 配置

```bash
# 登录 Vercel
vercel login

# 进入项目目录
cd /Users/wang.yunjie/Desktop/Yingwu-web/japan-china-harmony

# 添加环境变量
vercel env add SMTP_USER
# 输入: eikoyang@mono-grp.com.cn

vercel env add SMTP_PASSWORD
# 输入: 7a7Q33fO5QM3xMfy

vercel env add RECIPIENT_EMAIL
# 输入: eikoyang@mono-grp.com.cn

# 重新部署
vercel --prod
```

---

## 📝 邮件内容说明

### 1. 管理员通知邮件

当客户提交表单时，`eikoyang@mono-grp.com.cn` 会收到：

- **主题**: `新的联系表单 - [客户姓名]`
- **内容**: 包含客户的姓名、邮箱、公司、咨询内容
- **回复**: 可以直接点击"回复"给客户发邮件

### 2. 客户自动回复邮件

客户提交后会自动收到确认邮件：

- **主题**: `感谢您的咨询 - 上海英物国際貿易`
- **内容**: 
  - 感谢信息
  - 客户提交的内容回显
  - 公司联系方式
  - 预计回复时间说明

---

## 🧪 测试邮件功能

### 测试步骤

1. **打开网站**: 访问你的网站
2. **滚动到联系部分**: 找到"お問い合わせ"部分
3. **填写表单**:
   - 姓名: 测试用户
   - 邮箱: 你的测试邮箱
   - 公司: 测试公司（可选）
   - 消息: 这是一个测试消息
4. **提交表单**: 点击"送信"按钮
5. **验证**:
   - 页面显示成功提示
   - `eikoyang@mono-grp.com.cn` 收到管理员通知
   - 你的测试邮箱收到自动回复

### 使用 curl 命令测试 API

```bash
curl -X POST https://你的域名.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试用户",
    "email": "test@example.com",
    "company": "测试公司",
    "message": "这是一个测试消息"
  }'
```

成功响应示例：
```json
{
  "success": true,
  "message": "Email sent successfully via Aliyun SMTP",
  "config": "smtp.qiye.aliyun.com:465 (SSL)"
}
```

---

## 🔍 故障排查

### 问题 1: "SMTP configuration failed"

**原因**: SMTP 认证失败

**解决方案**:
1. 确认 Vercel 环境变量配置正确
2. 检查授权密码是否正确（注意不是邮箱登录密码）
3. 确认阿里云企业邮箱 SMTP 服务已启用
4. 重新部署项目

### 问题 2: 客户收不到自动回复

**原因**: 可能被垃圾邮件过滤

**解决方案**:
1. 检查客户的垃圾邮件文件夹
2. 将 `eikoyang@mono-grp.com.cn` 添加到白名单
3. 检查 Vercel 日志查看是否发送成功

### 问题 3: 管理员收不到通知邮件

**原因**: SMTP 配置或网络问题

**解决方案**:
1. 查看 Vercel 函数日志：**Deployments** → 选择部署 → **Functions** → 查看日志
2. 确认 `RECIPIENT_EMAIL` 环境变量设置正确
3. 尝试使用其他 SMTP 配置（端口 25）

### 问题 4: 表单提交后无响应

**原因**: API 路由配置问题

**解决方案**:
1. 检查 `vercel.json` 配置
2. 确认 `api/contact.ts` 文件存在
3. 查看浏览器控制台错误信息
4. 检查网络请求是否到达 `/api/contact`

---

## 📊 查看日志

### Vercel 函数日志

1. 进入 Vercel Dashboard
2. 选择项目 → **Deployments**
3. 选择最新部署 → **Functions**
4. 找到 `api/contact` → 查看实时日志

日志会显示：
- SMTP 连接状态
- 邮件发送结果
- 错误详情（如果有）

---

## 🎨 自定义邮件模板

邮件模板位于 `api/contact.ts` 文件中：

### 修改管理员邮件模板

找到 `adminEmailHtml` 变量，修改 HTML 内容

### 修改客户自动回复模板

找到 `autoReplyHtml` 变量，修改 HTML 内容

### 模板变量

可用的变量：
- `${name}` - 客户姓名
- `${email}` - 客户邮箱
- `${company}` - 公司名称
- `${message}` - 咨询内容

---

## 🔐 安全建议

### 1. 使用环境变量（已实现）
- ✅ 不要将密码硬编码在代码中
- ✅ 使用 Vercel 环境变量存储敏感信息
- ✅ 不要将 `.env` 文件提交到 Git

### 2. 输入验证（已实现）
- ✅ 邮箱格式验证
- ✅ 必填字段验证
- ✅ HTML 转义防止 XSS

### 3. 速率限制（建议添加）
如需防止滥用，可以添加：
- Vercel Edge Config 速率限制
- Cloudflare 防护
- reCAPTCHA 验证

---

## 📞 技术支持

如遇到问题，请检查：

1. **Vercel 部署状态**: https://vercel.com/
2. **阿里云邮箱设置**: https://qiye.aliyun.com/
3. **项目日志**: Vercel Dashboard → Functions → Logs

---

## ✨ 部署更新

### 推送更新

```bash
# 提交代码
git add .
git commit -m "更新邮件功能配置"
git push origin main

# Vercel 会自动部署
```

### 手动部署

```bash
# 使用 Vercel CLI
vercel --prod
```

---

## 📝 更新日志

**2024-11-05**
- ✅ 更新 SMTP 客户端授权密码
- ✅ 完善错误处理机制
- ✅ 添加详细日志输出
- ✅ 支持多种 SMTP 配置自动切换
- ✅ 优化邮件模板样式

---

## 🎉 完成！

配置完成后，你的联系表单邮件功能将完全可用：

1. ✅ 客户填写表单
2. ✅ 管理员收到通知
3. ✅ 客户收到自动回复
4. ✅ 可直接回复邮件沟通

如有任何问题，请查看 Vercel 函数日志或联系技术支持。

