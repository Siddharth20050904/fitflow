"use server"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request) {
  try {
    const { memberId } = await request.json()

    const bills = await prisma.bill.findMany({
      where: {
        memberId,
      },
      include: {
        package: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formattedBills = bills.map((bill) => ({
      id: bill.id,
      date: bill.createdAt.toISOString().split("T")[0],
      amount: bill.amount,
      packageName: bill.package?.name,
      status: bill.status,
      paidDate: bill.paidDate ? bill.paidDate.toISOString().split("T")[0] : null,
      dueDate: bill.dueDate.toISOString().split("T")[0],
      receipt: bill.status === "paid",
    }))

    return Response.json({ ok: true, bills: formattedBills })
  } catch (error) {
    console.error("Error fetching member bills:", error)
    return Response.json({ ok: false, bills: [], message: "Failed to fetch bills" })
  }
}
