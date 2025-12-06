"use server";
import { prisma } from "@/lib/prisma";

export const getMemberProfile = async (memberId: string) => {
  console.log("Fetching profile for memberId:", memberId);
  const member = await prisma.member.findUnique({
    where: { id: memberId },
    select: {
      name: true,
      email: true,
      phone: true,
      bills: {
        orderBy: { createdAt: "desc" },
        take: 1,
        select: {
          package: {
            select: {
              name: true,
            },
          },
        },
      },
      status: true,
    },
  });

  if (!member) {
    throw new Error("Member not found");
  }

  return member;
}
