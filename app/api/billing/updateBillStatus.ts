"use server"

import { prisma } from "@/lib/prisma"

type UpdateBillStatusParams = {
  billId: string
  status: "paid" | "pending" | "overdue"
  paidDate?: Date | null
}

type UpdateBillStatusResponse = {
  ok: boolean
  message: string
  bill: {
    id: string
    status: string
    paidDate: string | null
  } | null
}

export const updateBillStatus = async ({
  billId,
  status,
  paidDate,
}: UpdateBillStatusParams): Promise<UpdateBillStatusResponse> => {
  try {
    const updatedBill = await prisma.bill.update({
      where: { id: billId },
      data: {
        status,
        paidDate: status === "paid" ? (paidDate ?? new Date()) : null,
      },
      select: {
        id: true,
        status: true,
        paidDate: true,
      },
    })

    return {
      ok: true,
      message: `Bill status updated to ${status}`,
      bill: {
        id: updatedBill.id,
        status: updatedBill.status,
        paidDate: updatedBill.paidDate ? updatedBill.paidDate.toISOString().split("T")[0] : null,
      },
    }
  } catch (error) {
    console.error("Error updating bill status:", error)
    return {
      ok: false,
      message: "Failed to update bill status",
      bill: null,
    }
  }
}
