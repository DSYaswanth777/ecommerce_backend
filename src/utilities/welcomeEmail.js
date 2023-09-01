//** Import Node Emailer */
const nodemailer = require("nodemailer");
//** Import handle bars */
const handlebars = require("handlebars");
//**Import file system module */
const fs = require("fs");
//**Import path from module */
const path = require("path");
//**Function to send welcome email
function sendWelcomeEmail(to, recipientName, senderName) {
    const transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE_PROVIDER,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
    const templatePath = path.join(__dirname, "..", "email", "emailTemplate.html");
    const source = fs.readFileSync(templatePath, "utf8");
    const template = handlebars.compile(source);
    const html = template({ name: recipientName });  
    const mailOptions = {
      from: `"${senderName}" <${process.env.EMAIL_USER}>`,
      to: to,
      subject: "Welcome to Your Website",
      html: html,
    };
  
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error sending welcome email:", error);
      }
    });
  }
  module.exports = { sendWelcomeEmail };
