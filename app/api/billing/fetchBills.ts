"use server"

import { prisma } from "@/lib/prisma"

export const fetchBills = async (adminId: string) => {
  try {
    const res = await prisma.bill.findMany({
      where: { adminId },
      select: {
        id: true,
        member: {
          select: {
            name: true,
          },
        },
        package: {
          select: {
            name: true,
          },
        },
        amount: true,
        dueDate: true,
        status: true,
        paidDate: true,
      },
      orderBy: {
        dueDate: "desc",
      },
      take: 10,
    })

    const bills = res.map((bill) => ({
      id: bill.id,
      member: bill.member.name,
      amount: bill.amount,
      dueDate: bill.dueDate.toISOString().split("T")[0],
      status: bill.status,
      paidDate: bill.paidDate ? bill.paidDate.toISOString().split("T")[0] : null,
      packageName: bill.package?.name,
    }))

    return { success: true, data: bills }
  } catch (error) {
    console.error("Error fetching bills:", error)
    return { success: false, data: [] }
  }
}
