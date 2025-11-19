"use server";

import { createToken } from "@/lib/jwt";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

export async function sendLoginMail(email: string, type: "ADMIN" | "MEMBER") {
  try {
    let user;

    if (type === "ADMIN") {
      user = await prisma.admin.findUnique({ where: { email } });
      if (!user) return { success: false, message: "Admin not found" };
    } else {
      // CHANGE HERE IF YOU HAVE MEMBER MODEL
      user = await prisma.admin.findUnique({ where: { email } });
      if (!user) return { success: false, message: "Admin not found" };
    }

    const verificationToken = createToken({ userId: user.id, email: user.email });

    const userWithToken = await prisma.admin.update({
      where: { email },
      data: { tokenId: verificationToken },
    });

    if (!userWithToken)
      return { success: false, message: "Error occurred, please try later." };

    // Use environment URL for production
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

    const loginUrl = `${baseUrl}/signin?token=${verificationToken}&type=${type}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      host: "smtp.gmail.com",
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"Gym Management Admin" <${process.env.MAIL_USER}>`,
      to: email,
      subject: `${type} Login Link – Gym Management`,
      html: `
        <div style="font-family: Arial; padding: 20px;">
          <h2>Welcome ${type} 👋</h2>

          <p>Your secure login link for the <strong>Gym Management</strong> portal:</p>

          <p>
            <a 
              href="${loginUrl}" 
              style="background: #0070f3; padding: 12px 18px; color: white; text-decoration: none; border-radius: 6px;">
              Login Now
            </a>
          </p>

          <p>If the button doesn't work, use this link:</p>
          <p>${loginUrl}</p>

          <br />
          <p>Regards,<br/>Gym Management Team</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);

    return { success: true, message: "Email sent successfully!" };
  } catch (err) {
    console.error("Mail Error:", err);
    return { success: false, message: "Failed to send email." };
  }
}
