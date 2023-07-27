import nodemailer from "nodemailer";
const sendEmail = async (dest, subject, message) => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDEREMAIL,
      pass: process.env.SENDERPASSWORD,
    },
  });
  let info = await transporter.sendMail({
    from: ` Ahmed 👻" ${process.env.SENDEREMAIL}`,
    to: dest,
    subject,
    html: message,
  });
  return info;
};
export default sendEmail;
