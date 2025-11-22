"use server"

import { prisma } from "@/lib/prisma"

export const getPaymentSummary = async (adminId: string) => {
  try {
    const bills = await prisma.bill.findMany({
      where: { adminId },
      select: {
        amount: true,
        status: true,
        dueDate: true,
      },
    })

    const totalCollected = bills.filter((bill) => bill.status === "paid").reduce((sum, bill) => sum + bill.amount, 0)

    const now = new Date()
    const pendingAmount = bills
      .filter((bill) => bill.status === "pending" && bill.dueDate > now)
      .reduce((sum, bill) => sum + bill.amount, 0)

    const overdueAmount = bills
      .filter((bill) => (bill.status === "pending" || bill.status === "overdue") && bill.dueDate <= now)
      .reduce((sum, bill) => sum + bill.amount, 0)

    const totalRevenue = bills.reduce((sum, bill) => sum + bill.amount, 0)
    const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0

    return {
      success: true,
      data: {
        totalCollected: Math.round(totalCollected),
        pendingPayments: Math.round(pendingAmount),
        overduePayments: Math.round(overdueAmount),
        collectionRate: Math.round(collectionRate * 10) / 10,
      },
    }
  } catch (error) {
    console.error("Error fetching payment summary:", error)
    return { success: false, data: {} }
  }
}
