'use client'

import React, { useEffect, useRef, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'
import { createProduct, updateProduct } from '@/app/api/store/products'
import { toast } from 'react-hot-toast'
import { useSession } from 'next-auth/react'

type Product = {
  id: string
  name: string
  description?: string | null
  price: number
  stock: number
  category: string | null
  sales: number
}

export default function AddProductForm({
  open,
  setOpen,
  editing = false,
  product = null,
  onProductSaved,
}: {
  open: boolean
  setOpen: (open: boolean) => void
  editing?: boolean
  product?: Product | null
  onProductSaved: (p: Product) => void
}) {
  const modalRef = useRef<HTMLDivElement | null>(null)
  const { data: session } = useSession()
  const [adminId, setAdminId] = useState('')
  const [loading, setLoading] = useState(false)

  const [form, setForm] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
  })

  useEffect(() => {
    if (session?.user?.id) setAdminId(session.user.id)
  }, [session])

  useEffect(() => {
    if (editing && product) {
      setForm({
        name: product.name ?? '',
        description: product.description ?? '',
        price: product.price?.toString() ?? '',
        stock: product.stock?.toString() ?? '',
        category: product.category ?? '',
      })
    }
  }, [editing, product])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (modalRef.current && !modalRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, setOpen])

  if (!open) return null

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const mapped = {
      adminId,
      name: form.name || "",
      description: form.description || "",
      price: form.price ? Number(form.price) : 0,
      stock: form.stock ? Number(form.stock) : 0,
      category: form.category || "",
    }

    try {
      if (editing && product?.id) {
        // EDIT MODE
        const response = await updateProduct({ productId: product.id, ...mapped });
        onProductSaved(response.product!);       // ⬅ update UI instantly
        toast.success('Product updated successfully!')
      } else {
        // CREATE MODE
        const response = await createProduct(mapped);
        onProductSaved(response.product!);       // ⬅ add new product to UI instantly
        toast.success('Product added successfully!')
      }

      setOpen(false)
    } catch (err) {
      console.log(err)
      toast.error('Failed to save product')
    } finally {
      setLoading(false)
      setForm({
        name: '',
        description: '',
        price: '',
        stock: '',
        category: '',
      })
    }
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className="bg-background rounded-2xl shadow-xl w-full max-w-lg animate-in fade-in-50 slide-in-from-bottom-4"
      >
        <Card>
          <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle className="text-xl font-semibold">
              {editing ? 'Edit Product' : 'Add New Product'}
            </CardTitle>

            <button
              onClick={() => setOpen(false)}
              className="p-1 hover:bg-muted rounded-full transition"
            >
              <X className="h-5 w-5" />
            </button>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Product Name</label>
                <Input
                  placeholder="e.g. Whey Protein"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Description</label>
                <Input
                  placeholder="Short description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price (₹)</label>
                  <Input
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) =>
                      setForm({ ...form, price: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Stock</label>
                  <Input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) =>
                      setForm({ ...form, stock: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Input
                  placeholder="e.g. Supplements"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                />
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading
                  ? 'Saving...'
                  : editing
                  ? 'Update Product'
                  : 'Add Product'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
