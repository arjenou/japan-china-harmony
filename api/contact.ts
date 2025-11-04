// Vercel Serverless Function - 邮件发送 API
// 使用 MailChannels 免费发送邮件

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
    const { name, email, company, message } = req.body;

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

    const recipientEmail = 'eikoyang@mono-grp.com.cn';

    // 管理员邮件内容
    const adminEmailContent = `
      <h2>新的联系表单提交</h2>
      <p><strong>姓名：</strong>${escapeHtml(name)}</p>
      <p><strong>邮箱：</strong>${escapeHtml(email)}</p>
      <p><strong>公司：</strong>${escapeHtml(company || '未提供')}</p>
      <p><strong>消息：</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      <hr>
      <p><small>此邮件来自英武实业网站联系表单</small></p>
    `;

    // 用户自动回复邮件内容
    const autoReplyContent = `
      <h2>感谢您的咨询</h2>
      <p>尊敬的${escapeHtml(name)}，</p>
      <p>我们已经收到您的咨询信息，我们会尽快与您联系。</p>
      <p>以下是您提交的信息：</p>
      <p><strong>公司：</strong>${escapeHtml(company || '未提供')}</p>
      <p><strong>消息：</strong></p>
      <p>${escapeHtml(message).replace(/\n/g, '<br>')}</p>
      <hr>
      <p>上海英武实业有限公司<br>
      Office I, 15/F, Huamin Hanjun Tower, 726 Yan'an West Road,<br>
      Changning District, Shanghai, China 〒200050</p>
      <p>如有紧急事宜，请直接致电我们。</p>
    `;

    // 发送给管理员的邮件
    const adminEmailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: recipientEmail, name: '英武实业' }],
          },
        ],
        from: {
          email: 'noreply@mono-grp.com.cn',
          name: '英武实业网站',
        },
        reply_to: {
          email: email,
          name: name,
        },
        subject: `新的联系表单 - ${name}`,
        content: [
          {
            type: 'text/html',
            value: adminEmailContent,
          },
        ],
      }),
    });

    // 发送自动回复给用户
    const userEmailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: email, name: name }],
          },
        ],
        from: {
          email: 'noreply@mono-grp.com.cn',
          name: '上海英武实业有限公司',
        },
        subject: '感谢您的咨询 - 上海英武实业',
        content: [
          {
            type: 'text/html',
            value: autoReplyContent,
          },
        ],
      }),
    });

    if (!adminEmailResponse.ok) {
      console.error('Failed to send admin email:', await adminEmailResponse.text());
    }

    if (!userEmailResponse.ok) {
      console.error('Failed to send user email:', await userEmailResponse.text());
    }

    return res.status(200).json({
      success: true,
      message: 'Email sent successfully',
    });
    
  } catch (error: any) {
    console.error('Contact form error:', error);
    return res.status(500).json({ 
      error: 'Failed to send email',
      details: error.message 
    });
  }
}

// HTML 转义函数，防止 XSS
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
