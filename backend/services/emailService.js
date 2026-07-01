const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

exports.sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error('Email error:', error);
  }
};

exports.sendWelcomeEmail = async (user) => {
  const html = `
    <h1>Welcome to Cofounder Matrimony</h1>
    <p>Hello ${user.firstName},</p>
    <p>Welcome to our platform. Start connecting with potential co-founders today!</p>
  `;
  await exports.sendEmail(user.email, 'Welcome to Cofounder Matrimony', html);
};
