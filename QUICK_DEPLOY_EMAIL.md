# 🚀 联系表单邮件功能 - 快速部署指南

## ⚡ 5分钟快速部署

### 第一步：更新代码（✅ 已完成）

代码已经更新完毕，包含以下更改：
- ✅ 更新了 `api/contact.ts` 中的 SMTP 授权密码
- ✅ 添加了 `@types/nodemailer` 类型定义到 `package.json`
- ✅ 邮件功能已完全实现（管理员通知 + 自动回复）

### 第二步：安装依赖

```bash
cd /Users/wang.yunjie/Desktop/Yingwu-web/japan-china-harmony
npm install
```

### 第三步：配置 Vercel 环境变量

#### 方法 A：通过 Vercel Dashboard（推荐）

1. 登录 https://vercel.com/
2. 选择项目 → **Settings** → **Environment Variables**
3. 添加以下3个变量（每个变量都要选择 Production + Preview + Development）：

| Variable Name | Value |
|--------------|-------|
| `SMTP_USER` | `eikoyang@mono-grp.com.cn` |
| `SMTP_PASSWORD` | `7a7Q33fO5QM3xMfy` |
| `RECIPIENT_EMAIL` | `eikoyang@mono-grp.com.cn` |

4. 保存后，重新部署项目

#### 方法 B：通过 Vercel CLI（更快）

```bash
# 登录 Vercel
vercel login

# 进入项目目录
cd /Users/wang.yunjie/Desktop/Yingwu-web/japan-china-harmony

# 添加环境变量（为所有环境添加）
vercel env add SMTP_USER
# 输入: eikoyang@mono-grp.com.cn
# 选择: Production, Preview, Development (全选)

vercel env add SMTP_PASSWORD
# 输入: 7a7Q33fO5QM3xMfy
# 选择: Production, Preview, Development (全选)

vercel env add RECIPIENT_EMAIL
# 输入: eikoyang@mono-grp.com.cn
# 选择: Production, Preview, Development (全选)
```

### 第四步：部署到 Vercel

```bash
# 提交代码更改
git add .
git commit -m "更新邮件功能配置"
git push origin main

# 或者直接使用 Vercel CLI 部署
vercel --prod
```

### 第五步：测试邮件功能

#### 使用测试脚本

```bash
# 替换为你的实际域名
./test-contact-api.sh https://你的域名.vercel.app/api/contact
```

#### 或者通过网站界面测试

1. 访问你的网站
2. 滚动到"お問い合わせ"部分
3. 填写测试信息并提交
4. 检查邮箱：
   - `eikoyang@mono-grp.com.cn` 应收到管理员通知
   - 你填写的邮箱应收到自动回复

---

## 📋 完整功能清单

### ✅ 已实现功能

1. **联系表单提交** - 用户填写姓名、邮箱、公司、消息
2. **管理员邮件通知** - 发送到 `eikoyang@mono-grp.com.cn`
3. **客户自动回复** - 发送确认邮件给提交者
4. **多语言界面** - 支持中文/日文切换
5. **HTML美化邮件** - 专业的邮件模板
6. **错误处理** - 完善的重试机制
7. **SMTP自动切换** - 自动尝试多个SMTP配置
8. **安全验证** - 邮箱格式验证、XSS防护

### 📧 邮件内容说明

**管理员通知邮件包含：**
- 客户姓名、邮箱、公司
- 咨询内容
- 可直接回复客户

**客户自动回复包含：**
- 感谢信息
- 提交内容回显
- 公司联系方式
- 预计回复时间

---

## 🔧 SMTP 配置详情

- **服务器**: smtp.qiye.aliyun.com
- **端口**: 465 (SSL) / 25 (TLS)
- **账号**: eikoyang@mono-grp.com.cn
- **授权密码**: 7a7Q33fO5QM3xMfy

系统会自动尝试以下配置（按顺序）：
1. smtp.qiye.aliyun.com:465 (SSL)
2. smtp.mxhichina.com:465 (SSL)
3. smtp.qiye.aliyun.com:25 (TLS)
4. smtp.mxhichina.com:25 (TLS)

---

## 🔍 故障排查

### 问题 1: 提交后显示"发送失败"

**解决方案：**
1. 检查 Vercel 环境变量是否正确配置
2. 确认已重新部署项目
3. 查看 Vercel 函数日志（Dashboard → Deployments → Functions → api/contact）

### 问题 2: 管理员收不到邮件

**检查清单：**
- [ ] `SMTP_USER` 环境变量设置为 `eikoyang@mono-grp.com.cn`
- [ ] `SMTP_PASSWORD` 环境变量设置为 `7a7Q33fO5QM3xMfy`
- [ ] 已重新部署项目（环境变量修改后必须重新部署）
- [ ] 检查垃圾邮件文件夹

### 问题 3: 客户收不到自动回复

**可能原因：**
- 客户邮箱把邮件标记为垃圾邮件
- 客户填写了错误的邮箱地址

**解决方案：**
- 提醒客户检查垃圾邮件文件夹
- 将 `eikoyang@mono-grp.com.cn` 加入白名单

### 问题 4: 查看详细错误日志

```bash
# 1. 进入 Vercel Dashboard
# 2. 选择项目 → Deployments → 选择最新部署
# 3. 点击 "Functions" 标签
# 4. 找到 api/contact 查看日志
```

---

## 📊 监控建议

### 日常监控

1. **每周测试一次** - 提交测试表单确认功能正常
2. **检查邮件送达率** - 确保没有进垃圾邮件
3. **查看 Vercel 使用量** - 确保不超过免费额度

### Vercel 免费额度

- 函数调用：100GB-小时/月
- 带宽：100GB/月
- 足够处理大量联系表单请求

---

## 📚 相关文档

- **详细配置指南**: [CONTACT_EMAIL_SETUP.md](./CONTACT_EMAIL_SETUP.md)
- **环境变量配置**: [VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md)
- **测试脚本**: [test-contact-api.sh](./test-contact-api.sh)

---

## ✨ 完成后的效果

### 客户视角
1. 访问网站
2. 填写联系表单
3. 点击"送信"提交
4. 看到成功提示
5. 收到自动回复邮件

### 管理员视角
1. 收到新咨询通知邮件
2. 查看客户信息和咨询内容
3. 直接点击"回复"与客户沟通
4. 高效处理客户咨询

---

## 🎯 下一步建议

完成基础部署后，可以考虑以下增强功能：

### 可选增强（未实现）

1. **添加 reCAPTCHA** - 防止垃圾邮件
2. **速率限制** - 防止滥用
3. **邮件队列** - 处理高并发
4. **统计分析** - 追踪转化率
5. **CRM集成** - 自动导入联系人

---

## 🎉 完成！

按照以上步骤操作后，你的联系表单邮件功能将完全可用。

**测试清单：**
- [ ] Vercel 环境变量已配置
- [ ] 代码已部署到 Vercel
- [ ] 通过测试脚本测试成功
- [ ] 管理员邮箱收到测试邮件
- [ ] 测试邮箱收到自动回复
- [ ] 网站界面显示正常

如有问题，请查看详细文档或 Vercel 函数日志。

---

**最后更新**: 2024-11-05  
**维护者**: 英物国際貿易技术团队

