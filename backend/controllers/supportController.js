// Support controller: handle contact form submissions
const nodemailer = require('nodemailer');

function createTransporter() {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  if (!user || !pass) {
    throw new Error('Email credentials not configured');
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass }
  });
}

// POST /api/support/contact
async function sendContactMessage(req, res) {
  try {
    const { name, email, subject, message } = req.body || {};
    if (!name || !email || !message) {
      return res.status(400).json({ success: false, message: 'Name, email and message are required' });
    }

    const transporter = createTransporter();
    const to = process.env.SUPPORT_EMAIL || process.env.EMAIL_USER;
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to,
      subject: subject ? `[Contact] ${subject}` : 'New contact message',
      html: `
        <h3>New contact submission</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject || '(none)'}</p>
        <p><b>Message:</b></p>
        <p>${(message || '').replace(/\n/g, '<br/>')}</p>
      `,
      replyTo: email
    };

    await transporter.sendMail(mailOptions);
    return res.status(200).json({ success: true, message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact message error:', error.message);
    return res.status(500).json({ success: false, message: 'Failed to send message' });
  }
}

module.exports = { sendContactMessage };
