"use server"

import { prisma } from "@/lib/prisma"

export type StoreAnalytics = {
  totalRevenue: number
  totalSales: number
  activeProducts: number
  avgOrderValue: number
  revenueGrowth: number
  topProducts: TopProduct[]
}

export type TopProduct = {
  id: string
  name: string
  sales: number
  revenue: number
  stock: number
}

export async function getStoreAnalytics(adminId: string) {
  try {
    const store = await prisma.store.findUnique({
      where: { adminId },
      include: {
        products: {
          select: {
            id: true,
            name: true,
            price: true,
            stock: true,
            sales: true,
          },
        },
        orders: {
          select: {
            totalAmount: true,
            createdAt: true,
            status: true,
            paymentStatus: true,
          },
        },
      },
    })

    if (!store) {
      return {
        ok: false,
        analytics: null,
        message: "Store not found",
      }
    }

    const activeProducts = store.products.length

    const paidOrders = store.orders.filter((order) => order.paymentStatus === "paid")
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0)
    const totalSales = store.products.reduce((sum, product) => sum + product.sales, 0)

    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0

    const now = new Date()
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59)
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const lastMonthRevenue = paidOrders
      .filter((order) => order.createdAt >= lastMonthStart && order.createdAt <= lastMonthEnd)
      .reduce((sum, order) => sum + order.totalAmount, 0)

    const thisMonthRevenue = paidOrders
      .filter((order) => order.createdAt >= thisMonthStart)
      .reduce((sum, order) => sum + order.totalAmount, 0)

    const revenueGrowth =
      lastMonthRevenue > 0 ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100) : 0

    const topProducts: TopProduct[] = store.products
      .map((product) => ({
        id: product.id,
        name: product.name,
        sales: product.sales,
        revenue: product.price * product.sales,
        stock: product.stock,
      }))
      .sort((a, b) => b.sales - a.sales)

    const analytics: StoreAnalytics = {
      totalRevenue: Math.round(totalRevenue),
      totalSales,
      activeProducts,
      avgOrderValue: Math.round(avgOrderValue),
      revenueGrowth,
      topProducts,
    }

    return {
      ok: true,
      analytics,
      message: "Analytics fetched successfully",
    }
  } catch (error) {
    console.error("Error fetching analytics:", error)
    return {
      ok: false,
      analytics: null,
      message: "Failed to fetch analytics",
    }
  }
}
