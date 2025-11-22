"use server"
import { prisma } from "@/lib/prisma"

export const deletePackage = async (packageId: string) => {
  try {
    await prisma.package.delete({
      where: { id: packageId },
    })

    return { ok: true, message: "Package deleted successfully" }
  } catch (err) {
    console.error("Error deleting package:", err)
    return { ok: false, message: "Failed to delete package" }
  }
}
