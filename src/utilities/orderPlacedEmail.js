//** Import Node Emailer */
const nodemailer = require("nodemailer");
//** Import handle bars */
const handlebars = require("handlebars");
//**Import file system module */
const fs = require("fs");
//**Import path from module */
const path = require("path");
//**Function to send welcome email
function orderPlacedEmail(to, recipientName, orderID, totalPrice, paymentStatus,paymentID,destructuredCartItems) {
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
    "orderPalcedEmailTemplate.html"
  );
  const source = fs.readFileSync(templatePath, "utf8");
  const template = handlebars.compile(source);
  const html = template({ name: recipientName, orderID,totalPrice, paymentStatus,paymentID,destructuredCartItems });
 
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
    subject: `Your GSR Handlooms order #${orderID}`,
    html: html,
    attachments: attachments,
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log("Error sending order email:", error);
    }
  });
}
module.exports = { orderPlacedEmail };
