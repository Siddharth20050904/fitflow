"use server"
import { prisma } from "@/lib/prisma"

export const createPackage = async ({
  adminId,
  name,
  description,
  price,
  billingCycle,
  features,
}: {
  adminId: string
  name: string
  description?: string
  price: number
  billingCycle: string
  features: string[]
}) => {
  try {
    console.log("Creating package with data:", {
      adminId,
      name,
      description,
      price,
      billingCycle,
      features,
    });
    const pkg = await prisma.package.create({
      data: {
        adminId,
        name,
        description,
        price,
        billingCycle,
        features,
        isActive: true,
      },
    })

    return { ok: true, package: pkg, message: "Package created successfully" }
  } catch (err) {
    console.error("Error creating package:", err)
    return { ok: false, package: null, message: "Failed to create package" }
  }
}
