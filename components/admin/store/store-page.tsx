'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit2, Trash2, ShoppingBag, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'
import AddProductForm from './addProductForm'
import { deleteProduct, getProducts } from '@/app/api/store/products'
import { getStoreAnalytics, StoreAnalytics } from '@/app/api/store/analytics'
import { StoreOrder, getOrder, deleteOrder, updateOrderStatus } from '@/app/api/store/orders'
import AddOrderForm from './addOrderForm'
import toast from 'react-hot-toast'

type Products = {
  id: string
  name: string
  category: string | null
  price: number
  stock: number
  sales: number
}

export function AdminStorePage() {
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState<Products[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<Products | null>(null)
  const [analytics, setAnalytics] = useState<StoreAnalytics | null>(null)
  const [openOrder, setOpenOrder] = useState(false)
  const [editingOrder, setEditingOrder] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null)
  const [orders, setOrders] = useState<StoreOrder[]>([])
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);



  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    async function fetchProducts() {
      const response = await getProducts();
      if (response.ok) {
        setProducts(response.products);
      } else {
        console.error(response.message);
      }
    }
    fetchProducts()
  }, []);

  useEffect(() => {
    async function fetchAnalytics() {
      const response = await getStoreAnalytics();
      if (response.ok && response.analytics) {
        setAnalytics(response.analytics);
      } else {
        console.error(response.message);
      }
    }
    if (activeTab === 'analytics') {
      fetchAnalytics()
    }
  }, [activeTab]);

  useEffect(() => {
    async function fetchOrders() {
      const res = await getOrder();
      if (res) {
        setOrders(res);
      }
    }
    fetchOrders();
  }, []);

  function handleProductSaved(savedProduct: Products) {
    setProducts(prev => {
      // If editing, replace
      const exists = prev.find(p => p.id === savedProduct.id)
      if (exists) {
        return prev.map(p => (p.id === savedProduct.id ? savedProduct : p))
      }
      // If adding, append
      return [...prev, savedProduct]
    })
  }

  function handleOrderSaved(savedOrder: StoreOrder) {
    setOrders(prev => {
      // If editing, replace
      const exists = prev.find(p => p.id === savedOrder.id)
      if (exists) {
        return prev.map(p => (p.id === savedOrder.id ? savedOrder : p))
      }
      // If adding, append
      return [...prev, savedOrder]
    })
  }

  const deleteOrderFunc = async(orderId: string) => {
    const deletedOrder = await deleteOrder(orderId);
    if(deletedOrder.ok){
      setOrders(prev => prev.filter(o => o.id !== orderId));
      toast.success("Order deleted successfully");
    }else{
      toast.error("Failed to delete order");
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supplement Store</h1>
          <p className="text-muted-foreground">Manage products, inventory, and orders</p>
        </div>
        {/* Add Product Button or Order Button */
        activeTab === 'products' ? (
          <Button
            className="bg-primary text-primary-foreground"
            onClick={() => {
              setEditing(false);
              setSelectedProduct(null);
              setOpen(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        ) : 
        activeTab === 'orders' ? (
          <Button 
          className="bg-primary text-primary-foreground"
          onClick={()=>{
            setOpenOrder(true);
            setEditingOrder(false);
            setSelectedOrder(null);
          }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Order
          </Button>
        ) : null
        }
      </div>

      <AddProductForm
        open={open}
        setOpen={setOpen}
        editing={editing}
        product={selectedProduct}
        onProductSaved={handleProductSaved}
      />
      <AddOrderForm
        open={openOrder}
        setOpen={setOpenOrder}
        editing={editingOrder}
        order={selectedOrder}
        onOrderSaved={handleOrderSaved}
      />


      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 bg-input px-3 py-2 rounded-lg">
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="border-0 bg-transparent outline-none"
                />
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Product Name</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Category</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Price</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Stock</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Sales</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-medium">{product.name}</td>
                        <td className="py-3 px-4 text-sm text-muted-foreground">{product.category}</td>
                        <td className="py-3 px-4 font-semibold">₹{product.price}</td>
                        <td className="py-3 px-4">
                          <span className={`text-sm px-2 py-1 rounded-full ${
                            product.stock > 50
                              ? 'bg-green-100 text-green-700'
                              : product.stock > 20
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {product.stock}
                          </span>
                        </td>
                        <td className="py-3 px-4">{product.sales}</td>
                        <td className="py-3 px-4 flex gap-2">
                          <button className="p-1 hover:bg-muted rounded transition-colors"
                          onClick={()=>{
                            setSelectedProduct(product);
                            setEditing(true);
                            setOpen(true);
                          }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button className="p-1 hover:bg-muted rounded transition-colors text-destructive"
                          onClick={async()=>{
                            const deletedProduct = await deleteProduct(product.id);
                            if(deletedProduct.ok){
                              setProducts(prev => prev.filter(p => p.id !== product.id));
                              toast.success("Product deleted successfully");
                            }else{
                              toast.error("Failed to delete product");
                            }
                          }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Member</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Product</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Payment Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">{order.memberName}</td>

                        <td className="py-3 px-4 text-sm">
                          {order.items.map((item) => item.product.name).join(", ")}
                        </td>

                        <td className="py-3 px-4 font-semibold">₹{order.totalAmount}</td>

                        {/* --- STATUS BUTTON --- */}
                        <td className="py-3 px-4">
                          <Button
                            disabled={order.status === "delivered" || updatingOrderId === order.id}
                            size="sm"
                            variant="outline"
                            className={`
                              ${order.status === "delivered" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
                              rounded-full px-3 shadow-lg
                              ${updatingOrderId === order.id ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                            onClick={async () => {
                              setUpdatingOrderId(order.id);
                              const res = await updateOrderStatus({orderId: order.id, status: "delivered"});
                              setUpdatingOrderId(null);
                              if(!res.ok){
                                toast.error("Failed to update order status");
                                return;
                              }
                              setOrders(prev =>
                                prev.map(o => o.id === order.id ? { ...o, status: "delivered" } : o)
                              );
                              toast.success("Order status updated");
                            }}
                          >
                            {order.status === "delivered" ? "Delivered" : "Pending"}
                          </Button>
                        </td>

                        {/* --- PAYMENT STATUS BUTTON --- */}
                        <td className="py-3 px-4">
                          <Button
                            disabled={order.paymentStatus === "paid" || updatingOrderId === order.id}
                            size="sm"
                            variant="outline"
                            className={`
                              ${order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}
                              rounded-full px-3 shadow-lg
                              ${updatingOrderId === order.id ? "opacity-50 cursor-not-allowed" : ""}
                            `}
                            onClick={async () => {
                              setUpdatingOrderId(order.id);
                              const res = await updateOrderStatus({orderId: order.id, paymentStatus: "paid"});
                              setUpdatingOrderId(null);
                              if(!res.ok){
                                toast.error("Failed to update payment status");
                                return;
                              }
                              setOrders(prev =>
                                prev.map(o => o.id === order.id ? { ...o, paymentStatus: "paid" } : o)
                              );
                              toast.success("Payment status updated");
                            }}
                          >
                            {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                          </Button>
                        </td>

                        {/* --- ACTIONS COLUMN --- */}
                        <td className="py-3 px-4 flex gap-3">
                          {/* Edit order */}
                          <button
                            disabled={order.status === "delivered"}
                            className={`p-1 hover:bg-muted rounded transition-colors ${order.status === "delivered" ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => {
                              setSelectedOrder(order);
                              setEditingOrder(true);
                              setOpenOrder(true);
                            }}
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* Delete order */}
                          <button
                            disabled={order.status === "delivered"}
                            className={`p-1 hover:bg-muted rounded transition-colors text-destructive ${order.status === "delivered" ? "opacity-50 cursor-not-allowed" : ""}`}
                            onClick={() => deleteOrderFunc(order.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>

                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{analytics ? analytics.totalRevenue : 'Loading...'}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <ShoppingBag className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics ? analytics.totalSales : 'Loading...'}</div>
                <p className="text-xs text-muted-foreground">Products sold</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                <ShoppingBag className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics ? analytics.activeProducts : 'Loading...'}</div>
                <p className="text-xs text-muted-foreground">In catalog</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{analytics ? analytics.avgOrderValue : 'Loading...'}</div>
                <p className="text-xs text-muted-foreground">Per transaction</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Selling Products</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics ? analytics.topProducts.slice(0, 5).map((product) => (
                  <div key={product.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{product.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Sold: {product.sales} | Revenue: ₹{product.revenue}
                      </p>
                    </div>
                    <div className="text-sm font-semibold">Stock: {product.stock}</div>
                  </div>
                )) : 'Loading...'}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
