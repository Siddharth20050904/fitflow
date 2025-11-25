"use server"

import { prisma } from "@/lib/prisma"

export type StoreProduct = {
	id: string
	name: string
	description: string | null
	price: number
	stock: number
	category: string | null
	sales: number
	createdAt: Date
	updatedAt: Date
}

export type CreateProductInput = {
	adminId: string
	name: string
	description?: string
	price: number
	stock: number
	category?: string
}

export type UpdateProductInput = {
	productId: string
	name?: string
	description?: string
	price?: number
	stock?: number
	category?: string
}

export async function getProducts(){
	try {
		const products = await prisma.storeProduct.findMany({
			orderBy: {
				createdAt: 'desc',
			},
		})

		return { ok: true, products, message: "Products fetched successfully" }
	} catch (error) {
		console.error("Error fetching products:", error)
		return { ok: false, products: [], message: "Failed to fetch products" }
	}
}

export async function createProduct(input: CreateProductInput) {
	try {
		const { name, description, price, stock, category } = input

		const product = await prisma.storeProduct.create({
			data: {
				name,
				description: description || null,
				price,
				stock,
				category: category || null,
				sales: 0,
			},
		})

		return { ok: true, product, message: "Product created successfully" }
	} catch (error) {
		console.error("Error creating product:", error)
		return { ok: false, product: null, message: "Failed to create product" }
	}
}

export async function updateProduct(input: UpdateProductInput) {
	try {
		const { productId, ...updateData } = input

		const product = await prisma.storeProduct.update({
			where: { id: productId },
			data: {
				...(updateData.name && { name: updateData.name }),
				...(updateData.description !== undefined && { description: updateData.description }),
				...(updateData.price !== undefined && { price: updateData.price }),
				...(updateData.stock !== undefined && { stock: updateData.stock }),
				...(updateData.category !== undefined && { category: updateData.category }),
			},
		})

		return { ok: true, product, message: "Product updated successfully" }
	} catch (error) {
		console.error("Error updating product:", error)
		return { ok: false, product: null, message: "Failed to update product" }
	}
}

export async function deleteProduct(productId: string) {
	try {
		await prisma.storeProduct.delete({
			where: { id: productId },
		})

		return { ok: true, message: "Product deleted successfully" }
	} catch (error) {
		console.error("Error deleting product:", error)
		return { ok: false, message: "Failed to delete product" }
	}
}
