# 阿里云企业邮箱 SMTP 配置指南

## ✅ 已完成

- ✅ 安装 nodemailer 依赖
- ✅ 配置阿里云 SMTP
- ✅ 创建邮件模板（HTML + 纯文本）
- ✅ 自动回复功能

## 📧 SMTP 配置信息

```
SMTP 服务器：smtp.qiye.aliyun.com
端口：465
加密方式：SSL
用户名：eikoyang@mono-grp.com.cn
密码：Yang1234&
```

## 🔒 安全配置（推荐）

为了安全，建议在 Vercel 中设置环境变量，而不是在代码中硬编码密码。

### 步骤 1: 在 Vercel Dashboard 设置环境变量

1. 登录 [Vercel Dashboard](https://vercel.com)
2. 选择您的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下变量：

```
变量名: SMTP_USER
变量值: eikoyang@mono-grp.com.cn
适用环境: Production, Preview, Development

变量名: SMTP_PASSWORD
变量值: Yang1234&
适用环境: Production, Preview, Development
```

5. 点击 **Save**

### 步骤 2: 重新部署

设置环境变量后，需要重新部署：

```bash
git add .
git commit -m "Update email function to use Aliyun SMTP"
git push origin main
```

或在 Vercel Dashboard 中点击 **Redeploy**。

## 🚀 部署步骤

### 方法 1: Git 推送（推荐）

```bash
git add .
git commit -m "Add Nodemailer with Aliyun SMTP"
git push origin main
```

### 方法 2: Vercel CLI

```bash
vercel --prod
```

## 🧪 测试

部署完成后：

1. 访问您的网站
2. 填写联系表单
3. 点击发送

**预期结果：**
- ✅ eikoyang@mono-grp.com.cn 收到表单内容
- ✅ 用户邮箱收到自动回复
- ✅ 邮件格式美观（HTML 格式）
- ✅ 点击"回复"自动填充用户邮箱

## 📧 邮件功能

### 管理员邮件特点
- 专业的 HTML 格式
- 清晰的信息展示
- 可以直接点击"回复"联系客户
- 发件人：英物国際貿易网站

### 用户自动回复特点
- 确认收到咨询
- 回显提交的信息
- 显示公司联系方式
- 专业的品牌形象
- 发件人：上海英物国際貿易有限公司

## ❓ 常见问题

### Q1: 邮件未收到？

**检查清单：**
1. ✅ 确认 Vercel 环境变量已设置
2. ✅ 确认已重新部署
3. ✅ 查看垃圾邮件文件夹
4. ✅ 检查 Vercel Function 日志

### Q2: 显示 SMTP 连接错误？

**可能原因：**
- 密码错误
- 阿里云邮箱未开通 SMTP
- 环境变量未设置

**解决方案：**
1. 登录阿里云企业邮箱确认密码
2. 确认 SMTP 服务已开通
3. 重新设置 Vercel 环境变量

### Q3: 只收到管理员邮件，用户没收到？

这是正常的。代码设计为：
- 管理员邮件失败会返回错误
- 用户邮件失败不影响整体流程

可以查看 Vercel Function 日志确认原因。

### Q4: 如何查看发送日志？

在 Vercel Dashboard：
1. 选择项目
2. Functions → contact
3. 查看 Logs

可以看到：
```
Received contact form: { name: '...', email: '...', company: '...' }
SMTP connection verified
Sending email to admin...
Admin email sent: <message-id>
Sending auto-reply to user...
User email sent: <message-id>
```

## 🔍 调试

### 本地测试

```bash
# 设置环境变量
export SMTP_USER="eikoyang@mono-grp.com.cn"
export SMTP_PASSWORD="Yang1234&"

# 启动开发服务器
npm run dev
```

### 测试 SMTP 连接

可以使用以下代码测试：

```javascript
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.qiye.aliyun.com',
  port: 465,
  secure: true,
  auth: {
    user: 'eikoyang@mono-grp.com.cn',
    pass: 'Yang1234&',
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error('SMTP Error:', error);
  } else {
    console.log('SMTP Ready:', success);
  }
});
```

## 💰 成本

- **阿里云企业邮箱**：根据您的套餐
- **Vercel**：免费额度
- **Nodemailer**：开源免费

## 🎉 优势

相比 MailChannels 和 Resend：
- ✅ 使用自己的企业邮箱
- ✅ 更高的信任度（企业域名发件）
- ✅ 完全控制
- ✅ 不依赖第三方服务
- ✅ 邮件不会进垃圾箱（企业邮箱信誉高）

## 📊 监控

### 查看发送统计

登录阿里云企业邮箱：
1. 可以查看已发送邮件
2. 确认邮件送达状态
3. 管理邮件历史

## 🔐 安全建议

1. ✅ 使用环境变量存储密码
2. ✅ 定期更换密码
3. ✅ 启用阿里云邮箱的安全设置
4. ✅ 监控异常发送活动
5. ✅ 限制 API 调用频率（防止滥用）

## 🎯 下一步

1. 设置 Vercel 环境变量
2. 推送代码并部署
3. 测试表单提交
4. 确认邮件接收

---

**现在就开始吧！** 🚀

