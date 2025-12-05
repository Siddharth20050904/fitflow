"use server"
import { prisma } from "@/lib/prisma"

export async function fetchReceiptDetails(receiptId: string) {
  try {
    const receipt = await prisma.receipt.findUnique({
      where: { id: receiptId },
      include: {
        bill: {
          include: {
            package: true,
          },
        },
        member: true,
      },
    })

    if (!receipt) {
      return { ok: false, message: "Receipt not found" }
    }

    // Fetch gym info
    const gym = await prisma.gym.findFirst()

    return {
      ok: true,
      receipt: {
        receiptNo: receipt.receiptNo,
        amount: receipt.amount,
        paymentMethod: receipt.paymentMethod,
        notes: receipt.notes,
        createdAt: receipt.createdAt.toLocaleDateString("en-IN", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        bill: {
          id: receipt.bill.id,
          dueDate: receipt.bill.dueDate.toLocaleDateString("en-IN", {
            month: "short",
            day: "numeric",
            year: "numeric",
          }),
          package: receipt.bill.package
            ? {
                name: receipt.bill.package.name,
                billingCycle: receipt.bill.package.billingCycle,
              }
            : null,
        },
        member: {
          name: receipt.member.name,
          email: receipt.member.email,
          phone: receipt.member.phone,
        },
        gym: gym
          ? {
              name: gym.name,
              address: gym.address,
              phone: gym.phone,
              email: gym.email,
            }
          : null,
      },
    }
  } catch (error) {
    console.error("Error fetching receipt details:", error)
    return { ok: false, message: "Failed to fetch receipt" }
  }
}

export async function fetchMemberReceipts(memberId: string) {
  try {
    const receipts = await prisma.receipt.findMany({
      where: { memberId },
      include: {
        bill: {
          include: {
            package: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const formattedReceipts = receipts.map((receipt) => ({
      id: receipt.id,
      receiptNo: receipt.receiptNo,
      amount: receipt.amount,
      paymentMethod: receipt.paymentMethod,
      date: receipt.createdAt.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      packageName: receipt.bill.package?.name || "N/A",
    }))

    return { ok: true, receipts: formattedReceipts }
  } catch (error) {
    console.error("Error fetching member receipts:", error)
    return { ok: false, receipts: [], message: "Failed to fetch receipts" }
  }
}
