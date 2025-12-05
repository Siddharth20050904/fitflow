"use server"
import { prisma } from "@/lib/prisma"

export async function fetchStoreProducts() {
  try {
    const products = await prisma.storeProduct.findMany({
      orderBy: { sales: "desc" },
    })

    const formattedProducts = products.map((product) => ({
      id: product.id,
      name: product.name,
      description: product.description,
      category: product.category || "General",
      price: product.price,
      stock: product.stock,
      inStock: product.stock > 0,
      sales: product.sales,
    }))

    return { ok: true, products: formattedProducts }
  } catch (error) {
    console.error("Error fetching store products:", error)
    return { ok: false, products: [], message: "Failed to fetch products" }
  }
}

export async function createMemberOrder(
  memberId: string,
  memberName: string,
  items: { productId: string; quantity: number; price: number }[],
) {
  try {
    const totalAmount = items.reduce((sum, item) => sum + item.price * item.quantity, 0)

    const order = await prisma.storeOrder.create({
      data: {
        memberId,
        memberName,
        totalAmount,
        status: "pending",
        paymentStatus: "pending",
        items: {
          create: items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            price: item.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    })

    // Update product stock
    for (const item of items) {
      await prisma.storeProduct.update({
        where: { id: item.productId },
        data: {
          stock: { decrement: item.quantity },
          sales: { increment: item.quantity },
        },
      })
    }

    return { ok: true, order }
  } catch (error) {
    console.error("Error creating order:", error)
    return { ok: false, message: "Failed to create order" }
  }
}

export async function fetchMemberOrders(memberId: string) {
  try {
    const orders = await prisma.storeOrder.findMany({
      where: { memberId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const formattedOrders = orders.map((order) => ({
      id: order.id,
      date: order.createdAt.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" }),
      totalAmount: order.totalAmount,
      status: order.status,
      paymentStatus: order.paymentStatus,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: item.price,
      })),
    }))

    return { ok: true, orders: formattedOrders }
  } catch (error) {
    console.error("Error fetching member orders:", error)
    return { ok: false, orders: [], message: "Failed to fetch orders" }
  }
}
