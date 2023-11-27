//** Import Node Emailer */
const nodemailer = require("nodemailer");
//** Import handle bars */
const handlebars = require("handlebars");
//**Import file system module */
const fs = require("fs");
//**Import path from module */
const path = require("path");
//**Function to send welcome email
function passwordChangeEmail(to, recipientName, senderName) {
  const transporter = nodemailer.createTransport({
    service: process.env.EMAIL_SERVICE_PROVIDER,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const templatePath = path.join(
    __dirname,
    "..",
    "email",
    "passwordChangeTemplate.html"
  );
  const source = fs.readFileSync(templatePath, "utf8");
  const template = handlebars.compile(source);
  const html = template({ name: recipientName });
 
  const attachments = [
    {
      filename: "brand_logo.png",
      path: path.join(__dirname, "../controllers/brand_logo.png"),
      cid: "unique@cid",
    },
    {
      filename: "Youtube.png",
      path: path.join(__dirname, "../controllers/yt.png"),
      cid: "yt@cid",
    },
    {
      filename: "insta.png",
      path: path.join(__dirname, "../controllers/insta.png"),
      cid: "insta@cid",
    },
    {
      filename: "whatsapp.png",
      path: path.join(__dirname, "../controllers/whatsapp.png"),
      cid: "whatsapp@cid",
    },
  ];
  
  const mailOptions = {
    from: `"GSR Handlooms" <${process.env.EMAIL_USER}>`,
    to: to,
    subject: "Alert! You have Changed Password ",
    html: html,
    attachments: attachments,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending welcome email:", error);
    }
  });
}
module.exports = { passwordChangeEmail };
