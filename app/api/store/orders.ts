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

export async function getOrder(): Promise<StoreOrder[] | null> {
  const order = await prisma.storeOrder.findMany({
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

  return order
}

export async function createOrder(input: CreateOrderInput) {
  try {
    const { memberName, memberId, items } = input

    const productIds = items.map((item) => item.productId)
    const products = await prisma.storeProduct.findMany({
      where: {
        id: { in: productIds },
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

export async function updateOrder({
  orderId,
  memberName,
  memberId,
  items
}: {
  orderId: string
  memberName: string
  memberId: string
  items: {
    productId: string
    quantity: number
  }[]
}) {
  try {
    // 1️⃣ Fetch existing order + items
    const existingOrder = await prisma.storeOrder.findUnique({
      where: { id: orderId },
      include: { items: true },
    })

    if (!existingOrder) {
      return { ok: false, message: "Order not found", order: null }
    }

    const oldItems = existingOrder.items

    // 2️⃣ Map old quantities by productId
    const oldMap = new Map(
      oldItems.map(i => [i.productId, i.quantity])
    )

    // 3️⃣ Validate stock BEFORE updating
    for (const item of items) {
      const product = await prisma.storeProduct.findUnique({
        where: { id: item.productId },
      })

      if (!product) {
        return { ok: false, message: "Product not found", order: null }
      }

      const oldQty = oldMap.get(item.productId) ?? 0
      const diff = item.quantity - oldQty

      if (diff > 0 && product.stock < diff) {
        return {
          ok: false,
          order: null,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`,
        }
      }
    }

    // 4️⃣ Apply stock/sales difference
    for (const item of items) {

      const oldQty = oldMap.get(item.productId) ?? 0
      const diff = item.quantity - oldQty

      if (diff > 0) {
        // Need more → reduce stock
        await prisma.storeProduct.update({
          where: { id: item.productId },
          data: {
            stock: { decrement: diff },
            sales: { increment: diff },
          },
        })
      } else if (diff < 0) {
        // Reduced → increase stock back
        await prisma.storeProduct.update({
          where: { id: item.productId },
          data: {
            stock: { increment: Math.abs(diff) },
            sales: { decrement: Math.abs(diff) },
          },
        })
      }
    }

    // 5️⃣ Delete old items and recreate new ones
    await prisma.storeOrderItem.deleteMany({
      where: { orderId },
    })

    const products = await prisma.storeProduct.findMany({
      where: { id: { in: items.map(i => i.productId) } },
    })
    const productsMap = new Map(products.map(p => [p.id, p]))

    // 6️⃣ Calculate new totalAmount
    const totalAmount = items.reduce((sum, item) => {
      const product = productsMap.get(item.productId)
      return sum + (product!.price * item.quantity)
    }, 0)

    // 7️⃣ Update order
    const updatedOrder = await prisma.storeOrder.update({
      where: { id: orderId },
      data: {
        memberName,
        memberId,
        totalAmount,
        items: {
          create: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity,
            price: productsMap.get(item.productId)!.price,
          })),
        },
      },
      include: {
        items: {
          include: {
            product: {
              select: { name: true },
            },
          },
        },
      },
    })

    return { ok: true, order: updatedOrder, message: "Order updated successfully" }
  } catch (error) {
    console.error("Error updating order:", error)
    return { ok: false, order: null, message: "Failed to update order" }
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
