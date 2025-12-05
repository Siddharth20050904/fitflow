"use server"
import { prisma } from "@/lib/prisma"

export async function fetchMemberNotifications(memberId: string) {
  try {
    const notifications = await prisma.notification.findMany({
      where: {
        memberId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formattedNotifications = notifications.map((notif) => ({
      id: notif.id,
      title: getNotificationTitle(notif.type),
      message: notif.message,
      type: notif.type,
      date: notif.createdAt.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      read: notif.read,
    }))

    return { ok: true, notifications: formattedNotifications }
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return { ok: false, notifications: [], message: "Failed to fetch notifications" }
  }
}

function getNotificationTitle(type: string): string {
  switch (type) {
    case "payment_reminder":
      return "Payment Reminder"
    case "payment_confirmation":
      return "Payment Received"
    case "suspension_notice":
      return "Account Notice"
    case "special_offer":
      return "Special Offer"
    case "Monthly Fee":
      return "Monthly Fee Reminder"
    case "Overdue Payment":
      return "Overdue Payment"
    case "General Announcement":
      return "Announcement"
    default:
      return "Notification"
  }
}

export async function markNotificationRead(notificationId: string) {
  try {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { read: true },
    })
    return { ok: true }
  } catch (error) {
    console.error("Error marking notification read:", error)
    return { ok: false, message: "Failed to update notification" }
  }
}

export async function markAllNotificationsRead(memberId: string) {
  try {
    await prisma.notification.updateMany({
      where: { memberId, read: false },
      data: { read: true },
    })
    return { ok: true }
  } catch (error) {
    console.error("Error marking all notifications read:", error)
    return { ok: false, message: "Failed to update notifications" }
  }
}

export async function deleteNotification(notificationId: string) {
  try {
    await prisma.notification.delete({
      where: { id: notificationId },
    })
    return { ok: true }
  } catch (error) {
    console.error("Error deleting notification:", error)
    return { ok: false, message: "Failed to delete notification" }
  }
}
