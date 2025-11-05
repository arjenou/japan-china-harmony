// Vercel Serverless Function - 使用阿里云企业邮箱 SMTP 发送邮件
// 支持中日双语邮件
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
      footer1: '此邮件来自上海英物国際貿易有限会社网站联系表单',
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
      footer1: 'このメールは上海英物国際貿易有限会社のウェブサイトからのお問い合わせです',
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
      subject: '感谢您的咨询 - 上海英物国際貿易有限会社',
      title: '感谢您的咨询',
      greeting: `尊敬的 ${escapeHtml(name)}，`,
      message1: '感谢您通过我们的网站与我们联系。我们已经收到您的咨询信息，我们的工作人员会尽快与您取得联系。',
      submittedInfo: '您提交的信息：',
      companyLabel: '公司：',
      messageLabel: '消息内容：',
      companyName: '上海英物国際貿易有限会社',
      addressLabel: '地址：',
      phoneLabel: '电话：',
      emailLabel: '邮箱：',
      message2: '如有紧急事宜，请直接致电我们或回复此邮件。',
      footer1: '此邮件为自动发送，请勿直接回复',
      footer2: '© 2024 上海英物国際貿易有限会社 版权所有',
      notProvided: '未提供'
    },
    ja: {
      subject: 'お問い合わせありがとうございます - 上海英物国際貿易有限会社',
      title: 'お問い合わせありがとうございます',
      greeting: `${escapeHtml(name)} 様`,
      message1: 'この度は当社ウェブサイトからお問い合わせいただきありがとうございます。お問い合わせ内容を受け付けました。担当者より折り返しご連絡させていただきます。',
      submittedInfo: 'ご送信いただいた内容：',
      companyLabel: '会社名：',
      messageLabel: 'お問い合わせ内容：',
      companyName: '上海英物国際貿易有限会社',
      addressLabel: '住所：',
      phoneLabel: '電話：',
      emailLabel: 'メール：',
      message2: '緊急の場合は、お電話またはこのメールに直接ご返信ください。',
      footer1: 'このメールは自動送信されています',
      footer2: '© 2024 上海英物国際貿易有限会社 All Rights Reserved',
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
    const recipientEmail = process.env.RECIPIENT_EMAIL || 'eikoyang@mono-grp.com.cn';

    // 使用优先的 SMTP 配置（通常第一个就成功）
    const smtpConfig = {
      name: 'smtp.qiye.aliyun.com:465 (SSL)',
      host: 'smtp.qiye.aliyun.com',
      port: 465,
      secure: true,
    };

    console.log(`Using ${smtpConfig.name} for sending emails`);

    // 创建 SMTP 传输器（不预先验证，直接发送以节省时间）
    const transporter = nodemailer.createTransport({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      auth: {
        user: smtpUser,
        pass: smtpPassword,
      },
      tls: {
        rejectUnauthorized: false,
      },
      pool: true, // 使用连接池
      maxConnections: 5, // 最大并发连接数
      maxMessages: 100, // 每个连接最多发送100条消息
    });

    // 生成邮件模板
    const adminEmail = getAdminEmailTemplate(name, email, company, message, language);
    const userEmail = getUserAutoReplyTemplate(name, company, message, language);

    // 并行发送两封邮件以加快速度
    console.log('Sending emails in parallel...');
    
    const sendAdminEmail = transporter.sendMail({
      from: `"上海英物国際貿易有限会社" <${smtpUser}>`,
      to: recipientEmail,
      replyTo: email,
      subject: adminEmail.subject,
      html: adminEmail.html,
      text: adminEmail.text,
    });

    const sendUserEmail = transporter.sendMail({
      from: `"上海英物国際貿易有限会社" <${smtpUser}>`,
      to: email,
      subject: userEmail.subject,
      html: userEmail.html,
      text: userEmail.text,
    });

    try {
      // 同时发送两封邮件
      const [adminInfo, userInfo] = await Promise.all([sendAdminEmail, sendUserEmail]);
      console.log('Both emails sent successfully');
      console.log('Admin email:', adminInfo.messageId);
      console.log('User email:', userInfo.messageId);
    } catch (error: any) {
      console.error('Failed to send emails:', error);
      
      // 尝试至少发送管理员邮件
      try {
        const adminInfo = await sendAdminEmail;
        console.log('Admin email sent (fallback):', adminInfo.messageId);
        // 管理员邮件成功，用户邮件失败也返回成功
      } catch (adminError: any) {
        return res.status(500).json({
          error: 'Failed to send email',
          details: adminError.message,
        });
      }
    }

    // 关闭传输器连接池（可选，让 Vercel 函数更快结束）
    transporter.close();

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully via Aliyun SMTP',
      config: smtpConfig.name,
      language: language,
    });
    
  } catch (error: any) {
    console.error('Contact form error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message,
    });
  }
}

