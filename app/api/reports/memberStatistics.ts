"use server"

import { prisma } from "@/lib/prisma"

export const getMemberStatistics = async (adminId: string) => {
  try {
    const totalMembers = await prisma.member.count({ where: { adminId } })
    const activeMembers = await prisma.member.count({
      where: { adminId, status: "active" },
    })
    const inactiveMembers = await prisma.member.count({
      where: { adminId, status: "inactive" },
    })

    // Members joined this month
    const monthStart = new Date()
    monthStart.setDate(1)
    monthStart.setHours(0, 0, 0, 0)

    const newJoinersThisMonth = await prisma.member.count({
      where: {
        adminId,
        createdAt: { gte: monthStart },
      },
    })

    // Monthly trends (last 4 months)
    const monthlyTrends = []
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ]

    for (let i = 3; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59)

      const joinersThisMonth = await prisma.member.count({
        where: {
          adminId,
          createdAt: {
            gte: monthStart,
            lte: monthEnd,
          },
        },
      })

      monthlyTrends.push({
        month: months[date.getMonth()],
        change: `+${joinersThisMonth} members`,
      })
    }

    return {
      success: true,
      data: {
        totalMembers,
        activeThisMonth: activeMembers,
        newJoiners: newJoinersThisMonth,
        inactiveMembers,
        monthlyTrends,
      },
    }
  } catch (error) {
    console.error("Error fetching member statistics:", error)
    return { success: false, data: {} }
  }
}
