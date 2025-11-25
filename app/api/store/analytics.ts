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

export async function getStoreAnalytics() {
  try {
    // Fetch all orders with items + product details
    const orders = await prisma.storeOrder.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // PAID ORDERS ONLY
    const paidOrders = orders.filter((order) => order.paymentStatus === "paid")

    // 🟢 TOTAL REVENUE (paid orders only)
    const totalRevenue = paidOrders.reduce((sum, order) => sum + order.totalAmount, 0)

    // 🟢 TOTAL SALES (sum of quantity of all product items)
    const totalSales = orders.reduce(
      (sum, order) => sum + order.items.reduce((acc, item) => acc + item.quantity, 0),
      0
    )

    // 🟢 AVERAGE ORDER VALUE
    const avgOrderValue = paidOrders.length > 0 ? totalRevenue / paidOrders.length : 0

    // 📅 Revenue Growth Calculation
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
      lastMonthRevenue > 0
        ? Math.round(((thisMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : 0

    // 🟢 TOP PRODUCTS
    const productMap: Record<string, TopProduct> = {}

    orders.forEach((order) => {
      order.items.forEach((item) => {
        if (!item.product) return

        const productId = item.product.id

        if (!productMap[productId]) {
          productMap[productId] = {
            id: item.product.id,
            name: item.product.name,
            sales: 0,
            revenue: 0,
            stock: item.product.stock,
          }
        }

        productMap[productId].sales += item.quantity
        productMap[productId].revenue += item.price * item.quantity
      })
    })

    const topProducts = Object.values(productMap).sort((a, b) => b.sales - a.sales)

    // 🟢 ACTIVE PRODUCTS (products with stock > 0)
    const activeProducts = await prisma.storeProduct.count({
      where: { stock: { gt: 0 } },
    })

    // Final Analytics Object
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
