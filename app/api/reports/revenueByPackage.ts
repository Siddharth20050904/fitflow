"use server"

import { prisma } from "@/lib/prisma"

interface RevenueData {
  packageId: string
  packageName: string
  totalBills: number
  paidBills: number
  pendingBills: number
  totalRevenue: number
  collectedRevenue: number
  pendingRevenue: number
  collectionRate: number
}

export const getRevenueByPackage = async (adminId: string) => {
  try {
    const bills = await prisma.bill.findMany({
      where: { adminId },
      include: {
        package: {
          select: {
            id: true,
            name: true,
          },
        },
        receipts: {
          select: {
            amount: true,
          },
        },
      },
    })

    const revenueMap = new Map<string, RevenueData>()

    bills.forEach((bill) => {
      const packageKey = bill.package?.id || "unassigned"
      const packageName = bill.package?.name || "Unassigned"

      if (!revenueMap.has(packageKey)) {
        revenueMap.set(packageKey, {
          packageId: packageKey,
          packageName,
          totalBills: 0,
          paidBills: 0,
          pendingBills: 0,
          totalRevenue: 0,
          collectedRevenue: 0,
          pendingRevenue: 0,
          collectionRate: 0,
        })
      }

      const data = revenueMap.get(packageKey)!
      data.totalBills += 1
      data.totalRevenue += bill.amount

      if (bill.status === "paid") {
        data.paidBills += 1
        data.collectedRevenue += bill.amount
      } else {
        data.pendingBills += 1
        data.pendingRevenue += bill.amount
      }
    })

    // Calculate collection rates
    revenueMap.forEach((data) => {
      data.collectionRate = data.totalBills > 0 ? (data.paidBills / data.totalBills) * 100 : 0
    })

    const revenueData = Array.from(revenueMap.values()).sort((a, b) => b.collectedRevenue - a.collectedRevenue)

    // Calculate totals
    const totals = revenueData.reduce(
      (acc, item) => ({
        totalBills: acc.totalBills + item.totalBills,
        paidBills: acc.paidBills + item.paidBills,
        pendingBills: acc.pendingBills + item.pendingBills,
        totalRevenue: acc.totalRevenue + item.totalRevenue,
        collectedRevenue: acc.collectedRevenue + item.collectedRevenue,
        pendingRevenue: acc.pendingRevenue + item.pendingRevenue,
      }),
      {
        totalBills: 0,
        paidBills: 0,
        pendingBills: 0,
        totalRevenue: 0,
        collectedRevenue: 0,
        pendingRevenue: 0,
      },
    )

    return {
      success: true,
      data: {
        packages: revenueData,
        totals: {
          ...totals,
          overallCollectionRate: totals.totalBills > 0 ? (totals.paidBills / totals.totalBills) * 100 : 0,
        },
      },
    }
  } catch (error) {
    console.error("Error fetching revenue by package:", error)
    return { success: false, data: null, error: "Failed to fetch revenue data" }
  }
}
