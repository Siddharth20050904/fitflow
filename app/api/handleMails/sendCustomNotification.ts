"use server"

import nodemailer from "nodemailer"
import { prisma } from "@/lib/prisma"

type Member = {
  id: string
  email: string
}

export const sendNotification = async (
  title: string,
  message: string,
  type: string,
  recipients: string,
  adminId: string,
) => {
  if (!adminId) return { success: false, error: "Missing adminId" }

  // Get members according to filter
  let members: Member[] = []

  if (recipients === "All Members") {
    members = await prisma.member.findMany({ where: { adminId }, select: { id: true, email: true } })
  } else if (recipients === "Active Members Only") {
    members = await prisma.member.findMany({
      where: { adminId, status: "active" },
      select: { id: true, email: true },
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
      select: { id: true, email: true },
    })
  }

  if (members.length === 0) return { success: false, error: "No members found" }

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

  try {
    const notificationPromises = members.map(async (member) => {
      // Create notification in database
      await prisma.notification.create({
        data: {
          type: type,
          message: `${title}\n\n${message}`,
          memberId: member.id,
          adminId: adminId,
          read: false,
        },
      })

      // Send email
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
    })

    await Promise.all(notificationPromises)
    return { success: true, count: members.length }
  } catch (error) {
    console.error("Error sending notifications:", error)
    return { success: false, error: "Failed to send notifications" }
  }
}
