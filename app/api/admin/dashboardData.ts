'use server'

import { prisma } from '@/lib/prisma'

// ---------- TYPES ---------- //
export type DashboardChartPoint = {
  month: string
  revenue: number
  members: number
}

export type DashboardStats = {
  totalMembers: number
  monthlyRevenue: number
  pendingBills: number
  overdueBills: number
  pendingAmount: number
}

export type DashboardResponse = {
  stats: DashboardStats
  chart: DashboardChartPoint[]
}

// ---------- HELPERS ---------- //
const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function getMonthName(date: Date): string {
  return monthNames[date.getMonth()]
}

// ---------- MAIN SERVER ACTION ---------- //
export async function getDashboardData(adminId: string): Promise<DashboardResponse> {
  // ---- TOTAL MEMBERS ---- //
  const totalMembers = await prisma.member.count({
    where: { adminId }
  })

  // ---- MONTHLY REVENUE (CURRENT MONTH) ---- //
  const now = new Date()
  const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const monthlyRevenueData = await prisma.bill.findMany({
    where: {
      adminId,
      status: 'paid',
      paidDate: {
        gte: firstDay,
        lte: lastDay
      }
    },
    select: { amount: true }
  })

  const monthlyRevenue = monthlyRevenueData.reduce((sum, bill) => sum + bill.amount, 0)

  // ---- PENDING & OVERDUE BILLS ---- //
  const pendingBills = await prisma.bill.count({
    where: { adminId, status: 'pending' }
  });

  const pendingAmount = await prisma.bill.aggregate({
    where: { adminId, status: 'pending' },
    _sum: { amount: true }
  });

  const overdueBills = await prisma.bill.count({
    where: { adminId, status: 'overdue' }
  })

  // ---- CHART DATA (Last 6 Months) ---- //
  const sixMonthsAgo = new Date()
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5)
  sixMonthsAgo.setDate(1)

  const bills = await prisma.bill.findMany({
    where: {
      adminId,
      paidDate: { gte: sixMonthsAgo },
      status: 'paid'
    },
    select: {
      amount: true,
      paidDate: true
    }
  })

  const members = await prisma.member.findMany({
    where: {
      adminId,
      joinDate: { gte: sixMonthsAgo }
    },
    select: {
      joinDate: true
    }
  })

  const chartMap: Record<string, DashboardChartPoint> = {}

  for (let i = 0; i < 6; i++) {
    const date = new Date()
    date.setMonth(date.getMonth() - (5 - i))
    const month = getMonthName(date)

    chartMap[month] = {
      month,
      revenue: 0,
      members: 0
    }
  }

  bills.forEach(b => {
    const month = getMonthName(b.paidDate!)
    if (chartMap[month]) {
      chartMap[month].revenue += b.amount
    }
  })

  members.forEach(m => {
    const month = getMonthName(m.joinDate)
    if (chartMap[month]) {
      chartMap[month].members += 1
    }
  })

  const chart = Object.values(chartMap)

  return {
    stats: {
      totalMembers,
      monthlyRevenue,
      pendingBills,
      overdueBills,
      pendingAmount: pendingAmount._sum.amount || 0
    },
    chart
  }
}
