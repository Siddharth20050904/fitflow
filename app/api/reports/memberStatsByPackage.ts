"use server"

import { prisma } from "@/lib/prisma"

interface MemberStats {
  packageId: string
  packageName: string
  totalMembers: number
  activeMembers: number
  suspendedMembers: number
  inactiveMembers: number
  avgMonthlyRevenue: number
  newMembersThisMonth: number
}

export const getMemberStatsByPackage = async (adminId: string) => {
  try {
    const today = new Date()
    const monthStart = new Date(today.getFullYear(), today.getMonth(), 1)

    const packages = await prisma.package.findMany({
      where: { adminId, isActive: true },
      include: {
        bills: {
          include: {
            member: {
              select: {
                id: true,
                status: true,
                joinDate: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    })

    const statsMap = new Map<string, MemberStats>()

    packages.forEach((pkg) => {
      const uniqueMembers = new Map()
      let newThisMonth = 0

      // Get unique members and track new ones
      pkg.bills.forEach((bill) => {
        if (!uniqueMembers.has(bill.member.id)) {
          uniqueMembers.set(bill.member.id, bill.member)
          if (bill.member.joinDate >= monthStart) {
            newThisMonth += 1
          }
        }
      })

      const membersList = Array.from(uniqueMembers.values())
      const totalMembers = membersList.length
      const activeMembers = membersList.filter((m) => m.status === "active").length
      const suspendedMembers = membersList.filter((m) => m.status === "suspended").length
      const inactiveMembers = totalMembers - activeMembers - suspendedMembers

      statsMap.set(pkg.id, {
        packageId: pkg.id,
        packageName: pkg.name,
        totalMembers,
        activeMembers,
        suspendedMembers,
        inactiveMembers,
        avgMonthlyRevenue: totalMembers > 0 ? pkg.price * totalMembers : 0,
        newMembersThisMonth: newThisMonth,
      })
    })

    const stats = Array.from(statsMap.values())

    return {
      success: true,
      data: {
        packages: stats,
        summary: {
          totalPackages: stats.length,
          totalMembers: stats.reduce((sum, s) => sum + s.totalMembers, 0),
          totalActiveMembers: stats.reduce((sum, s) => sum + s.activeMembers, 0),
          totalPotentialRevenue: stats.reduce((sum, s) => sum + s.avgMonthlyRevenue, 0),
          newMembersThisMonth: stats.reduce((sum, s) => sum + s.newMembersThisMonth, 0),
        },
      },
    }
  } catch (error) {
    console.error("Error fetching member stats by package:", error)
    return { success: false, data: null, error: "Failed to fetch member statistics" }
  }
}
