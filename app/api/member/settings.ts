"use server"
import { prisma } from "@/lib/prisma"

export async function fetchMemberProfile(memberId: string) {
  try {
    const member = await prisma.member.findUnique({
      where: { id: memberId },
      include: {
        admin: {
          select: {
            name: true,
          },
        },
      },
    })

    if (!member) {
      return { ok: false, message: "Member not found" }
    }

    return {
      ok: true,
      profile: {
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone,
        status: member.status,
        joinDate: member.joinDate.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
        gymName: member.admin.name,
      },
    }
  } catch (error) {
    console.error("Error fetching member profile:", error)
    return { ok: false, message: "Failed to fetch profile" }
  }
}

export async function updateMemberProfile(memberId: string, data: { name?: string; phone?: string }) {
  try {
    const updated = await prisma.member.update({
      where: { id: memberId },
      data: {
        name: data.name,
        phone: data.phone,
      },
    })

    return {
      ok: true,
      profile: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        phone: updated.phone,
        status: updated.status,
      },
    }
  } catch (error) {
    console.error("Error updating member profile:", error)
    return { ok: false, message: "Failed to update profile" }
  }
}
