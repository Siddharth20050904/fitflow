"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ShoppingCart, Star, Filter, Loader2, Package, Minus, Plus, Trash2 } from "lucide-react"
import { useSession } from "next-auth/react"
import { fetchStoreProducts, createMemberOrder, fetchMemberOrders } from "@/app/api/member/store"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import toast from "react-hot-toast"

type Product = {
  id: string
  name: string
  description: string | null
  category: string
  price: number
  stock: number
  inStock: boolean
  sales: number
}

type CartItem = {
  product: Product
  quantity: number
}

type Order = {
  id: string
  date: string
  totalAmount: number
  status: string
  paymentStatus: string
  items: {
    name: string
    quantity: number
    price: number
  }[]
}

export function MemberStorePage() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [cart, setCart] = useState<CartItem[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [cartOpen, setCartOpen] = useState(false)
  const [orderHistoryOpen, setOrderHistoryOpen] = useState(false)
  const [placingOrder, setPlacingOrder] = useState(false)
  const { data: session } = useSession()

  const categories = ["All", ...new Set(products.map((p) => p.category))]

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const result = await fetchStoreProducts()
        if (result.ok) {
          setProducts(result.products)
        }
      } catch (error) {
        console.error("Failed to load products:", error)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  useEffect(() => {
    const loadOrders = async () => {
      if (!session?.user?.id) return
      try {
        const result = await fetchMemberOrders(session.user.id)
        if (result.ok) {
          setOrders(result.orders)
        }
      } catch (error) {
        console.error("Failed to load orders:", error)
      }
    }
    if (orderHistoryOpen) {
      loadOrders()
    }
  }, [session, orderHistoryOpen])

  const filteredProducts =
    selectedCategory === "All" ? products : products.filter((p) => p.category === selectedCategory)

  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: Math.min(item.quantity + 1, product.stock) } : item,
        )
      }
      return [...prev, { product, quantity: 1 }]
    })
    toast.success(`${product.name} added to cart`)
  }

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta
          if (newQty <= 0) return item
          if (newQty > item.product.stock) return item
          return { ...item, quantity: newQty }
        }
        return item
      }),
    )
  }

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId))
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0)
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0)

  const placeOrder = async () => {
    if (!session?.user?.id || cart.length === 0) return

    setPlacingOrder(true)
    try {
      const items = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }))

      const result = await createMemberOrder(session.user.id, session.user.name || "Member", items)

      if (result.ok) {
        toast.success("Order placed successfully!")
        setCart([])
        setCartOpen(false)
        // Refresh products to update stock
        const productsResult = await fetchStoreProducts()
        if (productsResult.ok) {
          setProducts(productsResult.products)
        }
      } else {
        toast.error(result.message || "Failed to place order")
      }
    } catch (error) {
      console.error("Error placing order:", error)
      toast.error("Failed to place order")
    } finally {
      setPlacingOrder(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supplement Store</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setOrderHistoryOpen(true)}>
            <Package className="h-5 w-5 mr-2" />
            My Orders
          </Button>
          <Button variant="outline" onClick={() => setCartOpen(true)} className="relative">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Button>
        </div>
      </div>

      {/* Filter Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-4 w-4" />
            <span className="font-medium">Filter by Category</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                onClick={() => setSelectedCategory(category)}
                size="sm"
              >
                {category}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Products Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className={`hover:shadow-lg transition-all ${!product.inStock ? "opacity-60" : ""}`}>
            <CardContent className="p-4">

              {/* Product Info */}
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">{product.category}</span>
              <h3 className="font-semibold mt-2 line-clamp-2">{product.name}</h3>
              {product.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{product.description}</p>
              )}

              {/* Rating (based on sales) */}
              <div className="flex items-center gap-1 mt-2">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`h-3 w-3 ${i < Math.min(5, Math.ceil(product.sales / 10)) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">({product.sales} sold)</span>
              </div>

              {/* Pricing */}
              <div className="mt-3 space-y-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-sm text-muted-foreground">₹{product.price.toLocaleString()}</span>
                </div>
              </div>

              {/* Stock info */}
              <p className="text-xs text-muted-foreground mt-2">
                {product.stock > 0 ? `${product.stock} in stock` : "Out of stock"}
              </p>

              {/* Add to Cart */}
              <Button className="w-full mt-4" onClick={() => addToCart(product)} disabled={!product.inStock}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Add to Cart
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="pt-12 pb-12 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">No products found in this category</p>
          </CardContent>
        </Card>
      )}

      {/* Cart Dialog */}
      <Dialog open={cartOpen} onOpenChange={setCartOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Shopping Cart</DialogTitle>
          </DialogHeader>
          {cart.length > 0 ? (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex items-center gap-4 pb-4 border-b">
                  <div className="flex-1">
                    <h4 className="font-medium">{item.product.name}</h4>
                    <p className="text-sm text-muted-foreground">₹{item.product.price.toLocaleString()} each</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() => updateQuantity(item.product.id, -1)}
                      disabled={item.quantity <= 1}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                    <span className="w-8 text-center">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8 bg-transparent"
                      onClick={() => updateQuantity(item.product.id, 1)}
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between items-center pt-4">
                <span className="font-semibold">Total:</span>
                <span className="text-xl font-bold text-primary">₹{cartTotal.toLocaleString()}</span>
              </div>
              <Button className="w-full" onClick={placeOrder} disabled={placingOrder}>
                {placingOrder ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  "Place Order"
                )}
              </Button>
            </div>
          ) : (
            <div className="text-center py-8">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">Your cart is empty</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Order History Dialog */}
      <Dialog open={orderHistoryOpen} onOpenChange={setOrderHistoryOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>My Orders</DialogTitle>
          </DialogHeader>
          {orders.length > 0 ? (
            <div className="space-y-4 max-h-[60vh] overflow-y-auto">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="text-sm text-muted-foreground">{order.date}</p>
                        <p className="font-bold text-primary">₹{order.totalAmount.toLocaleString()}</p>
                      </div>
                      <div className="flex gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            order.status === "delivered"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.status}
                        </span>
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            order.paymentStatus === "paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {order.paymentStatus}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.items.map((item, idx) => (
                        <span key={idx}>
                          {item.name} x{item.quantity}
                          {idx < order.items.length - 1 ? ", " : ""}
                        </span>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <p className="text-muted-foreground">No orders yet</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
