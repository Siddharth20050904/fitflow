"use server"

import { prisma } from "@/lib/prisma"

interface ReportFilters {
  reportType: string
  dateRange: string
  startDate?: Date
  endDate?: Date
}

type FinancialReport = {
  title: string
  totalRevenue: number
  totalCollected: number
  pendingAmount: number
  collectionRate: number
  billCount: number
  bills: {
    id: string
    memberId: string
    amount: number
    status: string
    packageName: string
    date: string
  }[]
}

type MemberReport = {
  title: string
  totalMembers: number
  activeMembers: number
  inactiveMembers: number
  members: {
    id: string
    name: string
    email: string
    phone: string
    packageName: string
    status: string
    joinDate: string
    billsCount: number
  }[]
}

type PaymentReport = {
  title: string
  totalBills: number
  paidBills: number
  pendingBills: number
  totalCollected: number
  totalPending: number
  collectionRate: number
  bills: {
    id: string
    memberName: string
    amount: number
    status: string
    packageName: string
    date: string   
  }[]
}

type MembershipReport = {
  title: string
  packages: {
    id: string
    name: string
    price: number
    billingCycle: string
    memberCount: number
    bills: {
      name: string
      email: string
      status: string
    }[]
  }[]
  totalPackages: number
  totalMembers: number
}

type ReportData =
  | FinancialReport
  | MemberReport
  | PaymentReport
  | MembershipReport


export const generateCustomReport = async (adminId: string, filters: ReportFilters) => {
  try {
    const { reportType, dateRange, startDate, endDate } = filters

    let dateGte = new Date()
    let dateLte = new Date()

    // Set date range based on selection
    switch (dateRange) {
      case "last30days":
        dateGte.setDate(dateGte.getDate() - 30)
        break
      case "lastquarter":
        dateGte.setMonth(dateGte.getMonth() - 3)
        break
      case "last6months":
        dateGte.setMonth(dateGte.getMonth() - 6)
        break
      case "thisyear":
        dateGte.setFullYear(dateGte.getFullYear(), 0, 1)
        break
      case "custom":
        dateGte = startDate || dateGte
        dateLte = endDate || dateLte
        break
      default:
        dateGte.setMonth(dateGte.getMonth() - 1)
    }

    let reportData = null as ReportData | null

    switch (reportType) {
      case "financial":
        const bills = await prisma.bill.findMany({
          where: {
            adminId,
            createdAt: { gte: dateGte, lte: dateLte },
          },
          include: { package: true },
        })

        const totalRevenue = bills.reduce((sum, bill) => sum + bill.amount, 0)
        const paidBills = bills.filter((b) => b.status === "paid")
        const totalCollected = paidBills.reduce((sum, bill) => sum + bill.amount, 0)
        const pendingAmount = bills.reduce((sum, bill) => sum + (bill.status === "pending" ? bill.amount : 0), 0)

        reportData = {
          title: "Financial Summary Report",
          totalRevenue,
          totalCollected,
          pendingAmount,
          collectionRate: bills.length ? Math.round((totalCollected / totalRevenue) * 100) : 0,
          billCount: bills.length,
          bills: bills.map((b) => ({
            id: b.id,
            memberId: b.memberId,
            amount: b.amount,
            status: b.status,
            packageName: b.package?.name || "N/A",
            date: b.createdAt.toISOString(),
          })),
        }
        break

      case "member":
        const members = await prisma.member.findMany({
          where: {
            adminId,
            createdAt: { gte: dateGte, lte: dateLte },
          },
          include: {
            bills: { where: { createdAt: { gte: dateGte, lte: dateLte } } , include: { package: true } },
          },
        })

        reportData = {
          title: "Member Activity Report",
          totalMembers: members.length,
          activeMembers: members.filter((m) => m.status === "active").length,
          inactiveMembers: members.filter((m) => m.status === "inactive").length,
          members: members.map((m) => ({
            id: m.id,
            name: m.name,
            email: m.email,
            phone: m.phone,
            packageName: m.bills.length > 0 ? m.bills[0].package?.name || "N/A" : "N/A",
            status: m.status,
            joinDate: m.createdAt.toISOString(),
            billsCount: m.bills.length,
          })),
        }
        break

      case "payment":
        const allBills = await prisma.bill.findMany({
          where: {
            adminId,
            createdAt: { gte: dateGte, lte: dateLte },
          },
          include: { member: true, package: true },
        })

        const paidBillsPayment = allBills.filter((b) => b.status === "paid")
        const pendingBills = allBills.filter((b) => b.status === "pending")

        reportData = {
          title: "Payment Collection Report",
          totalBills: allBills.length,
          paidBills: paidBillsPayment.length,
          pendingBills: pendingBills.length,
          totalCollected: paidBillsPayment.reduce((sum, b) => sum + b.amount, 0),
          totalPending: pendingBills.reduce((sum, b) => sum + b.amount, 0),
          collectionRate: allBills.length ? Math.round((paidBillsPayment.length / allBills.length) * 100) : 0,
          bills: allBills.map((b) => ({
            id: b.id,
            memberName: b.member.name,
            amount: b.amount,
            status: b.status,
            packageName: b.package?.name || "N/A",
            date: b.createdAt.toISOString(),
          })),
        }
        break

      case "membership":
        const packages = await prisma.package.findMany({
          where: { adminId },
          include: {
            bills: {
              where: { createdAt: { gte: dateGte, lte: dateLte } },
              include: { member: true }
            },
          },
        })

        reportData = {
          title: "Membership Analysis Report",
          packages: packages.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            billingCycle: p.billingCycle,
            memberCount: p.bills.length,
            bills: p.bills.map((b) => ({
              name: b.member.name,
              email: b.member.email,
              status: b.member.status,
            })),
          })),
          totalPackages: packages.length,
          totalMembers: packages.reduce((sum, p) => sum + p.bills.length, 0),
        }

        // console.log(reportData.packages.flatMap(p => p.bills));
        break
      default:
        return { success: false, data: null, message: "Invalid report type" }
    }

    return { success: true, data: reportData }
  } catch (error) {
    console.error("Error generating custom report:", error)
    return { success: false, data: null, message: "Error generating report" }
  }
}
