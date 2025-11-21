"use server"

import nodemailer from "nodemailer"
import { prisma } from "@/lib/prisma"

type Member = {
    email: string
}

export const sendNotification = async (
    title: string,
    message: string,
    type: string,
    recipients: string,
    adminId: string
) => {

  if (!adminId) return { success: false, error: "Missing adminId" }

  // Get members according to filter
  let members: Member[] = []

  if (recipients === "All Members") {
    members = await prisma.member.findMany({ where: { adminId }, select: { email: true } })
  } else if (recipients === "Active Members Only") {
    members = await prisma.member.findMany({
      where: { adminId, status: "active" },
      select: { email: true }
    })
  } else if (recipients === "Members with Pending Bills") {
    members = await prisma.member.findMany({
      where: {
        adminId,
        bills: {
          some: {
            status: "pending",
          },
        },
      },
      select: { email: true }
    })
  }

  if (members.length === 0)
    return { success: false, error: "No members found" }

  // Setup the mail transporter
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "gmail",
    secure: false,
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  })

try{
  // Send mail to all members
  for (const member of members) {
    await transporter.sendMail({
      from: `"Gym Management" <${process.env.MAIL_USER}>`,
      to: member.email,
      subject: title,
      html: `
        <h2>${title}</h2>
        <p>${message}</p>
        <br/>
        <p>Type: <strong>${type}</strong></p>
      `,
    })
  }
  return { success: true }
}catch(error){
  console.error("Error sending emails:", error)
  return { success: false }
}
}