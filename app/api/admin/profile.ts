"use server";
import { prisma } from "@/lib/prisma";

export async function getAdminProfile(adminId: string) {
  const admin = await prisma.admin.findUnique({
    where: { id: adminId },
    select: {
      name: true,
      email: true,
    },
  });

  if (!admin) {
    throw new Error("Admin not found");
  }

  return admin;
}