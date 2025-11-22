"use server"
import { prisma } from "@/lib/prisma"

export const fetchPackages = async (adminId: string) => {
  try {
    const packages = await prisma.package.findMany({
      where: {
        adminId,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return { ok: true, packages, message: "Packages fetched successfully" }
  } catch (err) {
    console.error("Error fetching packages:", err)
    return { ok: false, packages: [], message: "Failed to fetch packages" }
  }
}
