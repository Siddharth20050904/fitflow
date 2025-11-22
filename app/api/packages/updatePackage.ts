"use server"
import { prisma } from "@/lib/prisma"

export const updatePackage = async ({
  packageId,
  name,
  description,
  price,
  billingCycle,
  features,
  isActive,
}: {
  packageId: string
  name?: string
  description?: string
  price?: number
  billingCycle?: string
  features?: string[]
  isActive?: boolean
}) => {
  try {
    const pkg = await prisma.package.update({
      where: { id: packageId },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(price && { price }),
        ...(billingCycle && { billingCycle }),
        ...(features && { features }),
        ...(isActive !== undefined && { isActive }),
      },
    })

    return { ok: true, package: pkg, message: "Package updated successfully" }
  } catch (err) {
    console.error("Error updating package:", err)
    return { ok: false, package: null, message: "Failed to update package" }
  }
}
