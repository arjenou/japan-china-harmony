# Vercel 环境变量快速配置

## 📝 需要配置的环境变量

复制以下内容，在 Vercel Dashboard 中逐个添加：

### 1. SMTP_USER
```
eikoyang@mono-grp.com.cn
```

### 2. SMTP_PASSWORD
```
7a7Q33fO5QM3xMfy
```

### 3. RECIPIENT_EMAIL (可选)
```
eikoyang@mono-grp.com.cn
```

---

## 🚀 配置步骤

### 方法一：通过 Vercel Dashboard（推荐）

1. **登录 Vercel**
   - 访问: https://vercel.com/
   - 登录你的账号

2. **进入项目设置**
   - 选择项目: `japan-china-harmony`
   - 点击顶部 **Settings** 标签

3. **添加环境变量**
   - 在左侧菜单选择 **Environment Variables**
   - 点击 **Add New** 按钮

4. **逐个添加变量**
   
   **添加 SMTP_USER:**
   - Name: `SMTP_USER`
   - Value: `eikoyang@mono-grp.com.cn`
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - 点击 **Save**

   **添加 SMTP_PASSWORD:**
   - Name: `SMTP_PASSWORD`
   - Value: `7a7Q33fO5QM3xMfy`
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - 点击 **Save**

   **添加 RECIPIENT_EMAIL (可选):**
   - Name: `RECIPIENT_EMAIL`
   - Value: `eikoyang@mono-grp.com.cn`
   - Environment: ✅ Production, ✅ Preview, ✅ Development
   - 点击 **Save**

5. **重新部署**
   - 返回 **Deployments** 标签
   - 点击最新的部署旁边的 **...** (三个点)
   - 选择 **Redeploy**
   - 确认重新部署

---

### 方法二：通过 Vercel CLI

如果你已经安装了 Vercel CLI，可以使用命令行配置：

```bash
# 1. 登录 Vercel
vercel login

# 2. 进入项目目录
cd /Users/wang.yunjie/Desktop/Yingwu-web/japan-china-harmony

# 3. 链接项目（如果还未链接）
vercel link

# 4. 添加环境变量
vercel env add SMTP_USER production
# 输入: eikoyang@mono-grp.com.cn

vercel env add SMTP_PASSWORD production
# 输入: 7a7Q33fO5QM3xMfy

vercel env add RECIPIENT_EMAIL production
# 输入: eikoyang@mono-grp.com.cn

# 5. 为 Preview 和 Development 环境添加相同变量
vercel env add SMTP_USER preview
vercel env add SMTP_PASSWORD preview
vercel env add RECIPIENT_EMAIL preview

vercel env add SMTP_USER development
vercel env add SMTP_PASSWORD development
vercel env add RECIPIENT_EMAIL development

# 6. 重新部署
vercel --prod
```

---

### 方法三：批量导入（最快）

创建一个临时文件 `.env.production`（注意：不要提交到 Git）：

```bash
SMTP_USER=eikoyang@mono-grp.com.cn
SMTP_PASSWORD=7a7Q33fO5QM3xMfy
RECIPIENT_EMAIL=eikoyang@mono-grp.com.cn
```

然后使用 Vercel CLI 导入：

```bash
vercel env pull .env.production
```

**⚠️ 安全提醒**: 导入后立即删除 `.env.production` 文件！

```bash
rm .env.production
```

---

## ✅ 验证配置

### 1. 检查环境变量是否生效

```bash
# 查看所有环境变量
vercel env ls
```

### 2. 查看函数日志

1. 进入 Vercel Dashboard
2. **Deployments** → 选择最新部署
3. **Functions** → 找到 `api/contact`
4. 查看日志输出

### 3. 测试邮件发送

#### 使用测试脚本

```bash
# 测试生产环境
./test-contact-api.sh https://你的域名.vercel.app/api/contact

# 测试本地开发环境
./test-contact-api.sh http://localhost:3000/api/contact
```

#### 使用 curl 命令

```bash
curl -X POST https://你的域名.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "测试用户",
    "email": "your-test-email@example.com",
    "company": "测试公司",
    "message": "这是一个测试消息"
  }'
```

#### 通过网站界面测试

1. 访问你的网站
2. 滚动到联系表单部分
3. 填写表单并提交
4. 检查邮箱是否收到邮件

---

## 🔍 故障排查

### 问题 1: 环境变量不生效

**解决方案:**
1. 确认变量名拼写正确（区分大小写）
2. 确认已选择正确的环境（Production/Preview/Development）
3. **必须重新部署**才能使新变量生效
4. 清除浏览器缓存

### 问题 2: 找不到环境变量

在 Vercel 函数中添加调试代码：

```typescript
console.log('SMTP_USER:', process.env.SMTP_USER ? '已设置' : '未设置');
console.log('SMTP_PASSWORD:', process.env.SMTP_PASSWORD ? '已设置' : '未设置');
```

查看函数日志确认变量是否加载。

### 问题 3: SMTP 连接失败

**检查清单:**
- ✅ 环境变量配置正确
- ✅ 授权密码正确（不是邮箱登录密码）
- ✅ 阿里云企业邮箱 SMTP 服务已启用
- ✅ Vercel 函数可以访问外部 SMTP 服务器

### 问题 4: 部署后仍然报错

1. **强制清除缓存重新部署:**
   ```bash
   vercel --prod --force
   ```

2. **检查函数执行时间:**
   - Vercel Hobby 计划: 10秒超时
   - Pro 计划: 60秒超时
   - 确认邮件发送没有超时

3. **查看详细日志:**
   - Dashboard → Deployments → Functions → Logs
   - 查找具体错误信息

---

## 📊 监控和维护

### 日常检查

1. **每周检查一次邮件功能**
   - 提交测试表单
   - 确认收到邮件

2. **查看 Vercel 使用量**
   - Dashboard → Usage
   - 监控函数调用次数
   - 检查是否接近限额

3. **检查垃圾邮件文件夹**
   - 确保自动回复没有被标记为垃圾邮件
   - 如有必要，添加 SPF/DKIM 记录

### 定期更新

1. **定期更换密码（推荐每3个月）**
   ```bash
   # 1. 在阿里云生成新的客户端授权密码
   # 2. 更新 Vercel 环境变量
   vercel env rm SMTP_PASSWORD production
   vercel env add SMTP_PASSWORD production
   # 3. 重新部署
   vercel --prod
   ```

2. **更新依赖**
   ```bash
   npm update nodemailer
   npm update @types/nodemailer
   ```

---

## 📚 相关文档

- [CONTACT_EMAIL_SETUP.md](./CONTACT_EMAIL_SETUP.md) - 完整配置指南
- [Vercel 环境变量文档](https://vercel.com/docs/concepts/projects/environment-variables)
- [阿里云企业邮箱帮助](https://help.aliyun.com/product/35529.html)
- [Nodemailer 文档](https://nodemailer.com/)

---

## 🎉 配置完成检查清单

使用此清单确认所有步骤都已完成：

- [ ] 在 Vercel 添加了 `SMTP_USER` 环境变量
- [ ] 在 Vercel 添加了 `SMTP_PASSWORD` 环境变量
- [ ] 在 Vercel 添加了 `RECIPIENT_EMAIL` 环境变量
- [ ] 为所有环境（Production, Preview, Development）都添加了变量
- [ ] 重新部署了项目
- [ ] 通过测试脚本测试成功
- [ ] 管理员邮箱收到测试邮件
- [ ] 测试邮箱收到自动回复
- [ ] 查看了 Vercel 函数日志确认无错误

全部完成后，你的邮件功能就完全可用了！🎊

