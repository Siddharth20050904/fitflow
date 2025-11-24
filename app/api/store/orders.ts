"use server"

import { prisma } from "@/lib/prisma"

export type StoreOrder = {
  id: string
  memberId: string | null
  memberName: string
  totalAmount: number
  status: string
  paymentStatus: string
  createdAt: Date
  updatedAt: Date
  items: StoreOrderItem[]
}

export type StoreOrderItem = {
  id: string
  productId: string
  quantity: number
  price: number
  product: {
    name: string
  }
}

export type CreateOrderInput = {
  adminId: string
  memberName: string
  memberId?: string
  items: {
    productId: string
    quantity: number
  }[]
}

export type UpdateOrderStatusInput = {
  orderId: string
  status?: string
  paymentStatus?: string
}

export async function getStoreOrders(adminId: string) {
  try {
    const store = await prisma.store.findUnique({
      where: { adminId },
      include: {
        orders: {
          include: {
            items: {
              include: {
                product: {
                  select: {
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    })

    if (!store) {
      return { ok: false, orders: [], message: "Store not found" }
    }

    return { ok: true, orders: store.orders, message: "Orders fetched successfully" }
  } catch (error) {
    console.error("Error fetching orders:", error)
    return { ok: false, orders: [], message: "Failed to fetch orders" }
  }
}

export async function createOrder(input: CreateOrderInput) {
  try {
    const { adminId, memberName, memberId, items } = input

    const store = await prisma.store.findUnique({
      where: { adminId },
    })

    if (!store) {
      return { ok: false, order: null, message: "Store not found" }
    }

    const productIds = items.map((item) => item.productId)
    const products = await prisma.storeProduct.findMany({
      where: {
        id: { in: productIds },
        storeId: store.id,
      },
    })

    if (products.length !== items.length) {
      return { ok: false, order: null, message: "Some products not found" }
    }

    const productsMap = new Map(products.map((p) => [p.id, p]))

    for (const item of items) {
      const product = productsMap.get(item.productId)
      if (product && product.stock < item.quantity) {
        return {
          ok: false,
          order: null,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        }
      }
    }

    const totalAmount = items.reduce((sum, item) => {
      const product = productsMap.get(item.productId)
      return sum + (product ? product.price * item.quantity : 0)
    }, 0)

    const order = await prisma.storeOrder.create({
      data: {
        storeId: store.id,
        memberName,
        memberId: memberId || null,
        totalAmount,
        status: "pending",
        paymentStatus: "pending",
        items: {
          create: items.map((item) => {
            const product = productsMap.get(item.productId)
            return {
              productId: item.productId,
              quantity: item.quantity,
              price: product ? product.price : 0,
            }
          }),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    for (const item of items) {
      await prisma.storeProduct.update({
        where: { id: item.productId },
        data: {
          stock: {
            decrement: item.quantity,
          },
          sales: {
            increment: item.quantity,
          },
        },
      })
    }

    return { ok: true, order, message: "Order created successfully" }
  } catch (error) {
    console.error("Error creating order:", error)
    return { ok: false, order: null, message: "Failed to create order" }
  }
}

export async function updateOrderStatus(input: UpdateOrderStatusInput) {
  try {
    const { orderId, status, paymentStatus } = input

    const updateData: Record<string, string> = {}
    if (status !== undefined) updateData.status = status
    if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus

    const order = await prisma.storeOrder.update({
      where: { id: orderId },
      data: updateData,
      include: {
        items: {
          include: {
            product: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    })

    return { ok: true, order, message: "Order status updated successfully" }
  } catch (error) {
    console.error("Error updating order status:", error)
    return { ok: false, order: null, message: "Failed to update order status" }
  }
}

export async function deleteOrder(orderId: string) {
  try {
    const order = await prisma.storeOrder.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    })

    if (!order) {
      return { ok: false, message: "Order not found" }
    }

    for (const item of order.items) {
      await prisma.storeProduct.update({
        where: { id: item.productId },
        data: {
          stock: {
            increment: item.quantity,
          },
          sales: {
            decrement: item.quantity,
          },
        },
      })
    }

    await prisma.storeOrder.delete({
      where: { id: orderId },
    })

    return { ok: true, message: "Order deleted successfully" }
  } catch (error) {
    console.error("Error deleting order:", error)
    return { ok: false, message: "Failed to delete order" }
  }
}
