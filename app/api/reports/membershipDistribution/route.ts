import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { adminId } = await request.json()

    if (!adminId) {
      return NextResponse.json({ success: false, message: "Admin ID required" })
    }

    // Get all members for this admin
    const members = await prisma.member.findMany({
      where: { adminId },
      include: {
        bills: {
          include: {
            package: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    })

    // Calculate status distribution
    const statusCounts = {
      active: 0,
      inactive: 0,
      suspended: 0,
    }

    members.forEach((member) => {
      if (member.status === "active") statusCounts.active++
      else if (member.status === "inactive") statusCounts.inactive++
      else if (member.status === "suspended") statusCounts.suspended++
    })

    const total = members.length

    const statusDistribution = [
      { status: "Active", count: statusCounts.active, percentage: total > 0 ? (statusCounts.active / total) * 100 : 0 },
      {
        status: "Inactive",
        count: statusCounts.inactive,
        percentage: total > 0 ? (statusCounts.inactive / total) * 100 : 0,
      },
      {
        status: "Suspended",
        count: statusCounts.suspended,
        percentage: total > 0 ? (statusCounts.suspended / total) * 100 : 0,
      },
    ].filter((item) => item.count > 0)

    // Calculate package distribution
    const packageCounts: Record<string, number> = {}

    members.forEach((member) => {
      const packageName = member.bills[0]?.package?.name || "No Package"
      packageCounts[packageName] = (packageCounts[packageName] || 0) + 1
    })

    const packageDistribution = Object.entries(packageCounts).map(([packageName, memberCount]) => ({
      packageName,
      memberCount,
      percentage: total > 0 ? (memberCount / total) * 100 : 0,
    }))

    return NextResponse.json({
      success: true,
      data: {
        statusDistribution,
        packageDistribution,
        totals: {
          total,
          active: statusCounts.active,
          inactive: statusCounts.inactive,
          suspended: statusCounts.suspended,
        },
      },
    })
  } catch (error) {
    console.error("Error fetching membership distribution:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch membership distribution" })
  }
}
