// Vercel Serverless Function - 使用阿里云企业邮箱 SMTP 发送邮件
import nodemailer from 'nodemailer';

// HTML 转义函数，防止 XSS
function escapeHtml(text: string): string {
  if (!text) return '';
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// 生成管理员邮件模板
function getAdminEmailTemplate(name: string, email: string, company: string, message: string, language: string) {
  const templates = {
    zh: {
      subject: `新的联系表单 - ${name}`,
      title: '新的联系表单提交',
      nameLabel: '姓名：',
      emailLabel: '邮箱：',
      companyLabel: '公司：',
      messageLabel: '消息内容：',
      footer1: '此邮件来自MONO-GRP Trading Co., Ltd. 网站联系表单',
      footer2: '请尽快回复客户咨询',
      notProvided: '未提供'
    },
    ja: {
      subject: `新しいお問い合わせ - ${name}様`,
      title: '新しいお問い合わせ',
      nameLabel: 'お名前：',
      emailLabel: 'メールアドレス：',
      companyLabel: '会社名：',
      messageLabel: 'お問い合わせ内容：',
      footer1: 'このメールはMONO-GRP Trading Co., Ltd. のウェブサイトからのお問い合わせです',
      footer2: 'お早めにご返信ください',
      notProvided: '未記入'
    }
  };

  const t = templates[language as 'zh' | 'ja'] || templates.ja;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
    .field { margin: 15px 0; }
    .label { font-weight: bold; color: #667eea; }
    .value { margin-top: 5px; padding: 10px; background: white; border-radius: 3px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">${t.title}</h2>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">${t.nameLabel}</div>
        <div class="value">${escapeHtml(name)}</div>
      </div>
      <div class="field">
        <div class="label">${t.emailLabel}</div>
        <div class="value">${escapeHtml(email)}</div>
      </div>
      <div class="field">
        <div class="label">${t.companyLabel}</div>
        <div class="value">${escapeHtml(company || t.notProvided)}</div>
      </div>
      <div class="field">
        <div class="label">${t.messageLabel}</div>
        <div class="value" style="white-space: pre-wrap;">${escapeHtml(message)}</div>
      </div>
    </div>
    <div class="footer">
      <p>${t.footer1}</p>
      <p>${t.footer2}</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${t.title}

${t.nameLabel}${name}
${t.emailLabel}${email}
${t.companyLabel}${company || t.notProvided}
${t.messageLabel}
${message}

---
${t.footer1}
  `;

  return { subject: t.subject, html, text };
}

// 生成客户自动回复邮件模板
function getUserAutoReplyTemplate(name: string, company: string, message: string, language: string) {
  const templates = {
    zh: {
      subject: '感谢您的咨询 - MONO-GRP Trading Co., Ltd. ',
      title: '感谢您的咨询',
      greeting: `尊敬的 ${escapeHtml(name)}，`,
      message1: '感谢您通过我们的网站与我们联系。我们已经收到您的咨询信息，我们的工作人员会尽快与您取得联系。',
      submittedInfo: '您提交的信息：',
      companyLabel: '公司：',
      messageLabel: '消息内容：',
      companyName: 'MONO-GRP Trading Co., Ltd. ',
      addressLabel: '地址：',
      phoneLabel: '电话：',
      emailLabel: '邮箱：',
      message2: '如有紧急事宜，请直接致电我们或回复此邮件。',
      footer1: '此邮件为自动发送，请勿直接回复',
      footer2: '© 2024 MONO-GRP Trading Co., Ltd.  版权所有',
      notProvided: '未提供'
    },
    ja: {
      subject: 'お問い合わせありがとうございます - MONO-GRP Trading Co., Ltd. ',
      title: 'お問い合わせありがとうございます',
      greeting: `${escapeHtml(name)} 様`,
      message1: 'この度は当社ウェブサイトからお問い合わせいただきありがとうございます。お問い合わせ内容を受け付けました。担当者より折り返しご連絡させていただきます。',
      submittedInfo: 'ご送信いただいた内容：',
      companyLabel: '会社名：',
      messageLabel: 'お問い合わせ内容：',
      companyName: 'MONO-GRP Trading Co., Ltd. ',
      addressLabel: '住所：',
      phoneLabel: '電話：',
      emailLabel: 'メール：',
      message2: '緊急の場合は、お電話またはこのメールに直接ご返信ください。',
      footer1: 'このメールは自動送信されています',
      footer2: '© 2024 MONO-GRP Trading Co., Ltd.  All Rights Reserved',
      notProvided: '未記入'
    }
  };

  const t = templates[language as 'zh' | 'ja'] || templates.ja;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
    .company-info { margin-top: 20px; padding: 15px; background: white; border-left: 4px solid #667eea; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">${t.title}</h2>
    </div>
    <div class="content">
      <p>${t.greeting}</p>
      <p>${t.message1}</p>
      
      <h3>${t.submittedInfo}</h3>
      <p><strong>${t.companyLabel}</strong>${escapeHtml(company || t.notProvided)}</p>
      <p><strong>${t.messageLabel}</strong></p>
      <p style="white-space: pre-wrap; background: white; padding: 10px; border-radius: 3px;">${escapeHtml(message)}</p>
      
      <div class="company-info">
        <h3 style="margin-top: 0;">${t.companyName}</h3>
        <p><strong>${t.addressLabel}</strong>Office I, 15/F, Huamin Hanjun Tower, 726 Yan'an West Road,<br>
        Changning District, Shanghai, China 〒200050</p>
        <p><strong>${t.phoneLabel}</strong>013661548592</p>
        <p><strong>${t.emailLabel}</strong>eikoyang@mono-grp.com.cn</p>
      </div>
      
      <p>${t.message2}</p>
    </div>
    <div class="footer">
      <p>${t.footer1}</p>
      <p>${t.footer2}</p>
    </div>
  </div>
</body>
</html>
  `;

  const text = `
${t.title}

${t.greeting}

${t.message1}

${t.submittedInfo}
${t.companyLabel}${company || t.notProvided}
${t.messageLabel}
${message}

---
${t.companyName}
Office I, 15/F, Huamin Hanjun Tower, 726 Yan'an West Road,
Changning District, Shanghai, China 〒200050
${t.phoneLabel}013661548592
${t.emailLabel}eikoyang@mono-grp.com.cn

${t.message2}
  `;

  return { subject: t.subject, html, text };
}

export default async function handler(req: any, res: any) {
  // 设置 CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // 处理 OPTIONS 请求
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 仅允许 POST 请求
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, company, message, language = 'ja' } = req.body;

    console.log('Received contact form:', { name, email, company, language });

    // 验证必填字段
    if (!name || !email || !message) {
      return res.status(400).json({ 
        error: 'Name, email, and message are required' 
      });
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const smtpUser = process.env.SMTP_USER || 'eikoyang@mono-grp.com.cn';
    const smtpPassword = process.env.SMTP_PASSWORD || '7a7Q33fO5QM3xMfy';
    const recipientEmail = 'eikoyang@mono-grp.com.cn';

    // 尝试多种 SMTP 配置
    const smtpConfigs = [
      {
        name: 'smtp.qiye.aliyun.com:465 (SSL)',
        host: 'smtp.qiye.aliyun.com',
        port: 465,
        secure: true,
      },
      {
        name: 'smtp.mxhichina.com:465 (SSL)',
        host: 'smtp.mxhichina.com',
        port: 465,
        secure: true,
      },
      {
        name: 'smtp.qiye.aliyun.com:25 (TLS)',
        host: 'smtp.qiye.aliyun.com',
        port: 25,
        secure: false,
      },
      {
        name: 'smtp.mxhichina.com:25 (TLS)',
        host: 'smtp.mxhichina.com',
        port: 25,
        secure: false,
      },
    ];

    let transporter = null;
    let successConfig = null;

    // 尝试每个配置
    for (const config of smtpConfigs) {
      try {
        console.log(`Trying ${config.name}...`);
        
        const testTransporter = nodemailer.createTransport({
          host: config.host,
          port: config.port,
          secure: config.secure,
          auth: {
            user: smtpUser,
            pass: smtpPassword,
          },
          tls: {
            rejectUnauthorized: false, // 允许自签名证书
          },
        });

        await testTransporter.verify();
        console.log(`✓ ${config.name} verified successfully`);
        
        transporter = testTransporter;
        successConfig = config;
        break; // 找到可用配置，退出循环
      } catch (error: any) {
        console.error(`✗ ${config.name} failed:`, error.message);
        continue; // 尝试下一个配置
      }
    }

    // 如果所有配置都失败
    if (!transporter || !successConfig) {
      return res.status(500).json({
        error: 'SMTP configuration failed',
        details: 'All SMTP configurations failed. Please check your credentials or consider using Resend.',
        suggestion: 'You may need to enable SMTP service or get an authorization code from Aliyun mail settings.',
      });
    }

    console.log(`Using ${successConfig.name} for sending emails`);

    // 生成邮件模板
    const adminEmail = getAdminEmailTemplate(name, email, company, message, language);
    const userEmail = getUserAutoReplyTemplate(name, company, message, language);

    // 旧模板代码已移除 - 现在使用上面的函数生成
    const adminEmailHtml_OLD = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
    .field { margin: 15px 0; }
    .label { font-weight: bold; color: #667eea; }
    .value { margin-top: 5px; padding: 10px; background: white; border-radius: 3px; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">新的联系表单提交</h2>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">姓名：</div>
        <div class="value">${escapeHtml(name)}</div>
      </div>
      <div class="field">
        <div class="label">邮箱：</div>
        <div class="value">${escapeHtml(email)}</div>
      </div>
      <div class="field">
        <div class="label">公司：</div>
        <div class="value">${escapeHtml(company || '未提供')}</div>
      </div>
      <div class="field">
        <div class="label">消息内容：</div>
        <div class="value" style="white-space: pre-wrap;">${escapeHtml(message)}</div>
      </div>
    </div>
    <div class="footer">
      <p>此邮件来自MONO-GRP Trading Co., Ltd. 网站联系表单</p>
      <p>请尽快回复客户咨询</p>
    </div>
  </div>
</body>
</html>
    `;

    // 用户自动回复邮件内容（HTML）
    const autoReplyHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 5px 5px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border: 1px solid #ddd; border-top: none; }
    .company-info { margin-top: 20px; padding: 15px; background: white; border-left: 4px solid #667eea; }
    .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">感谢您的咨询</h2>
    </div>
    <div class="content">
      <p>尊敬的 ${escapeHtml(name)}，</p>
      <p>感谢您通过我们的网站与我们联系。我们已经收到您的咨询信息，我们的工作人员会尽快与您取得联系。</p>
      
      <h3>您提交的信息：</h3>
      <p><strong>公司：</strong>${escapeHtml(company || '未提供')}</p>
      <p><strong>消息内容：</strong></p>
      <p style="white-space: pre-wrap; background: white; padding: 10px; border-radius: 3px;">${escapeHtml(message)}</p>
      
      <div class="company-info">
        <h3 style="margin-top: 0;">MONO-GRP Trading Co., Ltd. </h3>
        <p><strong>地址：</strong>Office I, 15/F, Huamin Hanjun Tower, 726 Yan'an West Road,<br>
        Changning District, Shanghai, China 〒200050</p>
        <p><strong>电话：</strong>013661548592</p>
        <p><strong>邮箱：</strong>eikoyang@mono-grp.com.cn</p>
      </div>
      
      <p>如有紧急事宜，请直接致电我们或回复此邮件。</p>
    </div>
    <div class="footer">
      <p>此邮件为自动发送，请勿直接回复</p>
      <p>© 2024 MONO-GRP Trading Co., Ltd.  版权所有</p>
    </div>
  </div>
</body>
</html>
    `;

    // 发送给管理员的邮件
    console.log('Sending email to admin...');
    try {
      const adminInfo = await transporter.sendMail({
        from: `"MONO-GRP Trading Co., Ltd. " <${smtpUser}>`,
        to: recipientEmail,
        replyTo: email,
        subject: `新的联系表单 - ${name}`,
        html: adminEmailHtml,
        text: `
新的联系表单提交

姓名：${name}
邮箱：${email}
公司：${company || '未提供'}
消息：
${message}

---
此邮件来自MONO-GRP Trading Co., Ltd. 网站联系表单
        `,
      });
      console.log('Admin email sent:', adminInfo.messageId);
    } catch (error: any) {
      console.error('Failed to send admin email:', error);
      return res.status(500).json({
        error: 'Failed to send admin email',
        details: error.message,
      });
    }

    // 发送自动回复给用户
    console.log('Sending auto-reply to user...');
    try {
      const userInfo = await transporter.sendMail({
        from: `"MONO-GRP Trading Co., Ltd. " <${smtpUser}>`,
        to: email,
        subject: '感谢您的咨询 - MONO-GRP Trading Co., Ltd. ',
        html: autoReplyHtml,
        text: `
感谢您的咨询

尊敬的${name}，

感谢您通过我们的网站与我们联系。我们已经收到您的咨询信息，我们的工作人员会尽快与您取得联系。

您提交的信息：
公司：${company || '未提供'}
消息：
${message}

---
MONO-GRP Trading Co., Ltd. 
Office I, 15/F, Huamin Hanjun Tower, 726 Yan'an West Road,
Changning District, Shanghai, China 〒200050
电话：013661548592
邮箱：eikoyang@mono-grp.com.cn

如有紧急事宜，请直接致电我们或回复此邮件。
        `,
      });
      console.log('User email sent:', userInfo.messageId);
    } catch (error: any) {
      console.error('Failed to send user email:', error);
      // 管理员邮件已发送，用户邮件失败不返回错误
    }

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully via Aliyun SMTP',
      config: successConfig.name,
    });
    
  } catch (error: any) {
    console.error('Contact form error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message,
    });
  }
}

// HTML 转义函数，防止 XSS
function escapeHtml(text: string): string {
  if (!text) return '';
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
