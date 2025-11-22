"use server"

import { prisma } from "@/lib/prisma"

interface PackageMembershipData {
  packageId: string
  packageName: string
  price: number
  billingCycle: string
  totalMembers: number
  activeMembers: number
  inactiveMembers: number
  features: string[]
  members: {
    id: string
    name: string
    email: string
    phone: string
    status: string
    joinDate: string
  }[]
}

export const getMembershipDistribution = async (adminId: string) => {
  try {
    // Get all packages for the admin with member count
    const packages = await prisma.package.findMany({
      where: { adminId, isActive: true },
      include: {
        bills: {
          include: {
            member: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                status: true,
                joinDate: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const distributionData: PackageMembershipData[] = packages.map((pkg) => {
      // Get unique members for this package using a Set to avoid duplicates
      const uniqueMembers = new Map()
      pkg.bills.forEach((bill) => {
        if (!uniqueMembers.has(bill.member.id)) {
          uniqueMembers.set(bill.member.id, bill.member)
        }
      })

      const membersList = Array.from(uniqueMembers.values())
      const activeMembers = membersList.filter((m) => m.status === "active").length
      const inactiveMembers = membersList.length - activeMembers

      return {
        packageId: pkg.id,
        packageName: pkg.name,
        price: pkg.price,
        billingCycle: pkg.billingCycle,
        totalMembers: membersList.length,
        activeMembers,
        inactiveMembers,
        features: pkg.features,
        members: membersList.map((member) => ({
          id: member.id,
          name: member.name,
          email: member.email,
          phone: member.phone,
          status: member.status,
          joinDate: member.joinDate.toISOString().split("T")[0],
        })),
      }
    })

    // Calculate total statistics
    const totalMembers = distributionData.reduce((sum, pkg) => sum + pkg.totalMembers, 0)
    const totalActiveMembers = distributionData.reduce((sum, pkg) => sum + pkg.activeMembers, 0)
    const totalRevenue = distributionData.reduce((sum, pkg) => sum + pkg.price * pkg.totalMembers, 0)

    return {
      success: true,
      data: {
        packages: distributionData,
        summary: {
          totalPackages: distributionData.length,
          totalMembers,
          totalActiveMembers,
          totalInactiveMembers: totalMembers - totalActiveMembers,
          totalPotentialRevenue: totalRevenue,
        },
      },
    }
  } catch (error) {
    console.error("Error fetching membership distribution:", error)
    return { success: false, data: null, error: "Failed to fetch membership distribution" }
  }
}
