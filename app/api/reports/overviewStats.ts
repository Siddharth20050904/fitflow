"use server"

import { prisma } from "@/lib/prisma"

export const getOverviewStats = async (adminId: string) => {
  try {
    // Total revenue (YTD)
    const currentYear = new Date().getFullYear()
    const yearStart = new Date(currentYear, 0, 1)

    const bills = await prisma.bill.findMany({
      where: {
        adminId,
        createdAt: { gte: yearStart },
      },
      select: { amount: true, status: true, createdAt: true },
    })

    const totalRevenue = bills.reduce((sum, bill) => sum + bill.amount, 0)
    const totalCollected = bills.filter((bill) => bill.status === "paid").reduce((sum, bill) => sum + bill.amount, 0)
    const collectionRate = totalRevenue > 0 ? (totalCollected / totalRevenue) * 100 : 0

    // Active members count
    const totalMembers = await prisma.member.count({ where: { adminId } })
    const activeMembers = await prisma.member.count({
      where: { adminId, status: "active" },
    })

    // Members joined this month
    const monthStart = new Date(currentYear, new Date().getMonth(), 1)
    const newJoiners = await prisma.member.count({
      where: {
        adminId,
        createdAt: { gte: monthStart },
      },
    })

    return {
      success: true,
      data: {
        totalRevenue: Math.round(totalRevenue),
        collectionRate: Math.round(collectionRate * 10) / 10,
        totalMembers,
        activeMembers,
        newJoiners,
        revenueGrowth: 12, // You can calculate YoY growth
        memberGrowth: 5, // You can calculate MoM growth
      },
    }
  } catch (error) {
    console.error("Error fetching overview stats:", error)
    return { success: false, data: {} }
  }
}
