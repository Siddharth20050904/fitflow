"use server"
import { prisma } from "@/lib/prisma"

export async function fetchMemberBills(memberId: string) {
  try {
    const bills = await prisma.bill.findMany({
      where: {
        memberId,
      },
      include: {
        package: true,
        receipts: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formattedBills = bills.map((bill) => ({
      id: bill.id,
      date: bill.createdAt.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      amount: bill.amount,
      packageName: bill.package?.name || "N/A",
      status: bill.status,
      paidDate: bill.paidDate
        ? bill.paidDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
        : null,
      dueDate: bill.dueDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      receipt: bill.receipts.length > 0 ? bill.receipts[0] : null,
    }))

    return { ok: true, bills: formattedBills }
  } catch (error) {
    console.error("Error fetching member bills:", error)
    return { ok: false, bills: [], message: "Failed to fetch bills" }
  }
}

export async function fetchBillDetails(billId: string) {
  try {
    const bill = await prisma.bill.findUnique({
      where: { id: billId },
      include: {
        package: true,
        member: true,
        receipts: true,
        admin: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    })

    if (!bill) {
      return { ok: false, message: "Bill not found" }
    }

    return {
      ok: true,
      bill: {
        id: bill.id,
        amount: bill.amount,
        status: bill.status,
        dueDate: bill.dueDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
        paidDate: bill.paidDate
          ? bill.paidDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })
          : null,
        createdAt: bill.createdAt.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
        package: bill.package
          ? {
              name: bill.package.name,
              description: bill.package.description,
              billingCycle: bill.package.billingCycle,
            }
          : null,
        member: {
          name: bill.member.name,
          email: bill.member.email,
          phone: bill.member.phone,
        },
        gym: {
          name: bill.admin.name,
          email: bill.admin.email,
        },
        receipt: bill.receipts[0] || null,
      },
    }
  } catch (error) {
    console.error("Error fetching bill details:", error)
    return { ok: false, message: "Failed to fetch bill details" }
  }
}
