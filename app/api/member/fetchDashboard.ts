"use server"
import { prisma } from "@/lib/prisma"

export async function fetchMemberDashboard(memberId: string) {
  try {
    // Fetch member details with their package info from bills
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        bills: {
          include: {
            package: true,
          },
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    })

    if (!member) {
      return { ok: false, message: "Member not found" }
    }

    // Get the latest bill to determine current package
    const latestBill = member.bills[0]
    const currentPackage = latestBill?.package

    // Calculate outstanding balance
    const pendingBills = await prisma.bill.findMany({
      where: {
        memberId,
        status: { in: ["pending", "overdue"] },
      },
    })
    const outstandingBalance = pendingBills.reduce((sum, bill) => sum + bill.amount, 0)

    // Get next due bill
    const nextDueBill = await prisma.bill.findFirst({
      where: {
        memberId,
        status: "pending",
      },
      orderBy: { dueDate: "asc" },
    })

    // Format recent bills
    const recentBills = member.bills.map((bill) => ({
      id: bill.id,
      date: bill.createdAt.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      amount: bill.amount,
      status: bill.status,
      packageName: bill.package?.name,
    }))

    return {
      ok: true,
      dashboard: {
        memberStatus: member.status,
        memberName: member.name,
        joinDate: member.joinDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
        currentPackage: currentPackage
          ? {
              name: currentPackage.name,
              price: currentPackage.price,
              billingCycle: currentPackage.billingCycle,
            }
          : null,
        nextBillDue: nextDueBill
          ? {
              date: nextDueBill.dueDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
              amount: nextDueBill.amount,
            }
          : null,
        outstandingBalance,
        recentBills,
      },
      message: "Dashboard data fetched successfully",
    }
  } catch (error) {
    console.error("Error fetching member dashboard:", error)
    return { ok: false, message: "Failed to fetch dashboard data", dashboard: null}
  }
}
