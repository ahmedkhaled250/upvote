import nodemailer from 'nodemailer'
export async function nodeEmail(dest, subject, message, attachments) {
  if (!attachments) {
    attachments = [];
  }
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.nodeMailerEmail, // generated ethereal user
      pass: process.env.nodeMailerPassword, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let info = await transporter.sendMail({
    from: `"Ahmed Khaled" <${process.env.nodeMailerEmail}>`,
    to: dest,
    subject,
    html: message,
    attachments,
  });
  return info
}
