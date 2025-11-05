# 📡 使用 curl 测试邮件 API

## ⚠️ 重要说明

`api/contact.ts` 是 **Vercel Serverless Function**，有以下测试方式：

---

## ✅ 方法 1：测试生产环境（推荐）

### 前提条件
- 已部署到 Vercel
- 已配置环境变量

### 测试命令

```bash
curl -X POST "https://你的域名.vercel.app/api/contact" \
  -H "Content-Type: application/json" \
  -w "\n\n📊 HTTP状态码: %{http_code}\n⏱️ 响应时间: %{time_total}s\n" \
  -d '{
    "name": "curl测试用户",
    "email": "test@example.com",
    "company": "curl测试公司",
    "message": "这是通过 curl 发送的测试消息"
  }'
```

### 成功响应示例

```json
{
  "success": true,
  "message": "Email sent successfully via Aliyun SMTP",
  "config": "smtp.qiye.aliyun.com:465 (SSL)"
}

📊 HTTP状态码: 200
⏱️ 响应时间: 2.345s
```

---

## 🔧 方法 2：使用 Vercel CLI 本地测试

### 安装 Vercel CLI

```bash
npm install -g vercel
```

### 登录 Vercel

```bash
vercel login
```

### 链接项目

```bash
cd /Users/wang.yunjie/Desktop/Yingwu-web/japan-china-harmony
vercel link
```

### 拉取环境变量

```bash
vercel env pull .env.local
```

### 启动本地开发服务器

```bash
vercel dev
```

### 在另一个终端测试

```bash
curl -X POST "http://localhost:3000/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "本地测试",
    "email": "local@test.com",
    "company": "本地公司",
    "message": "本地测试消息"
  }'
```

---

## 🚀 方法 3：使用测试脚本

### 使用内置测试脚本

```bash
# 测试生产环境
./test-curl.sh https://你的域名.vercel.app/api/contact

# 或使用 Vercel CLI 本地测试
vercel dev  # 在一个终端
./test-curl.sh http://localhost:3000/api/contact  # 在另一个终端
```

---

## 📝 完整测试示例

### 1. 基本测试

```bash
curl -X POST "https://你的域名.vercel.app/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "张三",
    "email": "zhangsan@example.com",
    "company": "测试公司",
    "message": "我想咨询产品信息"
  }'
```

### 2. 带详细输出的测试

```bash
curl -v -X POST "https://你的域名.vercel.app/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "李四",
    "email": "lisi@example.com",
    "company": "ABC公司",
    "message": "请联系我讨论合作事宜"
  }'
```

### 3. 测试错误处理（缺少必填字段）

```bash
curl -X POST "https://你的域名.vercel.app/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "王五"
  }'
```

预期响应：
```json
{
  "error": "Name, email, and message are required"
}
```

### 4. 测试邮箱格式验证

```bash
curl -X POST "https://你的域名.vercel.app/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "赵六",
    "email": "invalid-email",
    "message": "测试消息"
  }'
```

预期响应：
```json
{
  "error": "Invalid email format"
}
```

---

## 🔍 检查结果

### 1. 检查 HTTP 状态码

```bash
curl -s -o /dev/null -w "%{http_code}" \
  -X POST "https://你的域名.vercel.app/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试",
    "email": "test@test.com",
    "message": "测试"
  }'
```

- `200` = 成功
- `400` = 请求错误（缺少字段或格式错误）
- `405` = 方法不允许（应该使用POST）
- `500` = 服务器错误（检查环境变量或SMTP配置）

### 2. 检查邮件

测试成功后，检查以下邮箱：
- ✉️ `eikoyang@mono-grp.com.cn` - 管理员通知
- ✉️ 你提交的邮箱 - 自动回复

### 3. 查看 Vercel 日志

```
Vercel Dashboard → 项目 → Deployments → 
选择最新部署 → Functions → api/contact → 查看日志
```

---

## 🎯 快速测试命令（复制使用）

### 替换你的域名后运行：

```bash
# 1. 基本测试
curl -X POST "https://你的域名.vercel.app/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"name":"测试","email":"test@example.com","company":"测试公司","message":"测试消息"}'

# 2. 格式化输出
curl -X POST "https://你的域名.vercel.app/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"name":"测试","email":"test@example.com","message":"测试"}' | jq .

# 3. 保存响应到文件
curl -X POST "https://你的域名.vercel.app/api/contact" \
  -H "Content-Type: application/json" \
  -d '{"name":"测试","email":"test@example.com","message":"测试"}' \
  -o response.json

# 4. 显示响应时间
curl -X POST "https://你的域名.vercel.app/api/contact" \
  -H "Content-Type: application/json" \
  -w "\n响应时间: %{time_total}s\n" \
  -d '{"name":"测试","email":"test@example.com","message":"测试"}'
```

---

## ❌ 常见错误

### 错误 1: 连接失败

```
curl: (7) Failed to connect to localhost port 3000
```

**原因**: 服务器未运行  
**解决**: 
- 使用 `vercel dev` 启动本地服务器
- 或测试已部署的生产环境

### 错误 2: 404 Not Found

```json
{
  "error": "Not Found"
}
```

**原因**: API 路由不存在  
**解决**: 
- 确认 URL 正确 `/api/contact`
- 确认已部署到 Vercel

### 错误 3: 500 Internal Server Error

```json
{
  "error": "Failed to send email",
  "details": "..."
}
```

**原因**: SMTP 配置错误  
**解决**: 
- 检查 Vercel 环境变量
- 查看函数日志
- 验证 SMTP 密码

---

## 📚 相关工具

### jq - JSON 格式化工具

安装：
```bash
brew install jq
```

使用：
```bash
curl ... | jq .
```

### httpie - 更友好的 HTTP 客户端

安装：
```bash
brew install httpie
```

使用：
```bash
http POST https://你的域名.vercel.app/api/contact \
  name="测试" \
  email="test@example.com" \
  message="测试消息"
```

---

## 🎉 测试成功标志

当你看到以下内容时，表示测试成功：

✅ HTTP 状态码 200  
✅ 返回 `{"success": true}`  
✅ `eikoyang@mono-grp.com.cn` 收到邮件  
✅ 测试邮箱收到自动回复  
✅ Vercel 日志显示无错误  

---

## 📞 需要帮助？

1. 查看完整文档：`CONTACT_EMAIL_SETUP.md`
2. 检查环境变量：`VERCEL_ENV_SETUP.md`
3. 查看 Vercel 函数日志

---

**更新日期**: 2024-11-05  
**测试工具**: curl, httpie, jq

