"use server";

import { prisma } from "@/lib/prisma";

export const deleteMember = async (memberId: string) => {
  try {
    await prisma.member.delete({
      where: {
        id: memberId,
      },
    });
    return { success: true, message: "Member deleted successfully." };
  } catch (error) {
    console.error("Error deleting member:", error);
    return { success: false, message: "Failed to delete member." };
  }
};