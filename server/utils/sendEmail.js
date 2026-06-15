import dotenv from "dotenv";
dotenv.config();

import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendSigningEmail = async (email, token) => {
  const signingUrl = `http://localhost:5173/sign/${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Please Sign Document",
    html: `
      <h2>Document Signature Request</h2>

      <p>Please click the link below:</p>

      <a href="${signingUrl}">
        Sign Document
      </a>

      <br/><br/>

      <p>${signingUrl}</p>
    `,
  });
};