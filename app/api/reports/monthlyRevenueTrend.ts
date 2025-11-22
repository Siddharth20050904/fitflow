"use server"

import { prisma } from "@/lib/prisma"

export const getMonthlyRevenueTrend = async (adminId: string) => {
  try {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const bills = await prisma.bill.findMany({
      where: {
        adminId,
        createdAt: { gte: sixMonthsAgo },
      },
      select: {
        amount: true,
        status: true,
        createdAt: true,
      },
    })

    // Group by month
    const monthlyData: Record<string, { revenue: number; paid: number; pending: number }> = {}
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    // Initialize last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const key = months[date.getMonth()]
      monthlyData[key] = { revenue: 0, paid: 0, pending: 0 }
    }

    // Aggregate data
    bills.forEach((bill) => {
      const billDate = new Date(bill.createdAt)
      const monthKey = months[billDate.getMonth()]

      if (monthlyData[monthKey]) {
        monthlyData[monthKey].revenue += bill.amount
        if (bill.status === "paid") {
          monthlyData[monthKey].paid += bill.amount
        } else {
          monthlyData[monthKey].pending += bill.amount
        }
      }
    })

    const data = Object.entries(monthlyData).map(([month, values]) => ({
      month,
      revenue: Math.round(values.revenue),
      paid: Math.round(values.paid),
      pending: Math.round(values.pending),
    }))

    return { success: true, data }
  } catch (error) {
    console.error("Error fetching monthly revenue trend:", error)
    return { success: false, data: [] }
  }
}
