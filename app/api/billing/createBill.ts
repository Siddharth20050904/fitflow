"use server";
import { prisma } from "@/lib/prisma";

export const createBill = async ({
  adminId,
  memberId,
  amount,
  dueDate,
  status,
  paidDate,
}: {
  adminId: string;
  memberId: string;
  amount: number;
  dueDate: Date;
  status: string;
  paidDate: Date | null;
}) => {
  try {
    const bill = await prisma.bill.create({
      data: {
        adminId,
        memberId,
        amount,
        dueDate,
        status,
        paidDate,
      },
    });

    return { ok: true, bill: bill, message: "Bill created successfully" };
  } catch(err){
    console.error("Error creating bill:", err);
    return { ok: false,bill: null, message: "Failed to create bill" };
  }
};