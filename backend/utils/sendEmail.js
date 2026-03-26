const nodemailer = require("nodemailer");

const sendEmail = async (options) => {
  // Safe Debugging - see if the .env variables are actually loaded
  console.log("-----------------------------------------");
  console.log(`📧 Attempting to send email from: ${process.env.EMAIL_USER}`);
  console.log(`🔑 Password loaded? ${!!process.env.EMAIL_PASS}`);
  console.log(`🔑 Password length: ${process.env.EMAIL_PASS?.length} characters`);
  console.log("-----------------------------------------");

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Email error: Missing EMAIL_USER or EMAIL_PASS in .env file!");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: "ByteLearn Security <noreply@bytelearn.com>",
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
