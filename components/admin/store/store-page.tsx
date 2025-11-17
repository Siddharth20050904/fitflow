'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Edit2, Trash2, ShoppingBag, TrendingUp } from 'lucide-react'
import { Input } from '@/components/ui/input'

const mockProducts = [
  {
    id: 1,
    name: 'Whey Protein Powder',
    category: 'Supplements',
    price: 1500,
    stock: 45,
    sales: 234,
  },
  {
    id: 2,
    name: 'BCAA Complex',
    category: 'Supplements',
    price: 1200,
    stock: 32,
    sales: 156,
  },
  {
    id: 3,
    name: 'Creatine Monohydrate',
    category: 'Supplements',
    price: 800,
    stock: 78,
    sales: 189,
  },
  {
    id: 4,
    name: 'Pre-Workout Energy',
    category: 'Pre-Workout',
    price: 1400,
    stock: 24,
    sales: 98,
  },
]

export function AdminStorePage() {
  const [activeTab, setActiveTab] = useState('products')
  const [products] = useState(mockProducts)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const totalRevenue = products.reduce((sum, p) => sum + (p.price * p.sales), 0)
  const totalSales = products.reduce((sum, p) => sum + p.sales, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supplement Store</h1>
          <p className="text-muted-foreground">Manage products, inventory, and orders</p>
        </div>
        {activeTab === 'products' && (
          <Button className="bg-primary text-primary-foreground">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
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
                          <button className="p-1 hover:bg-muted rounded transition-colors">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button className="p-1 hover:bg-muted rounded transition-colors text-destructive">
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
                      <th className="text-left py-3 px-4 text-sm font-semibold">Order ID</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Member</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Product</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                      <th className="text-left py-3 px-4 text-sm font-semibold">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { id: 'O001', member: 'John Doe', product: 'Whey Protein', amount: 1500, status: 'delivered', date: '2024-11-25' },
                      { id: 'O002', member: 'Jane Smith', product: 'BCAA Complex', amount: 1200, status: 'shipped', date: '2024-11-24' },
                      { id: 'O003', member: 'Bob Johnson', product: 'Creatine', amount: 800, status: 'pending', date: '2024-11-23' },
                    ].map((order) => (
                      <tr key={order.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4 font-mono text-sm">{order.id}</td>
                        <td className="py-3 px-4">{order.member}</td>
                        <td className="py-3 px-4 text-sm">{order.product}</td>
                        <td className="py-3 px-4 font-semibold">₹{order.amount}</td>
                        <td className="py-3 px-4">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            order.status === 'delivered'
                              ? 'bg-green-100 text-green-700'
                              : order.status === 'shipped'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-sm">{order.date}</td>
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
                <div className="text-2xl font-bold">₹{(totalRevenue / 100000).toFixed(1)}L</div>
                <p className="text-xs text-muted-foreground">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                <ShoppingBag className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalSales}</div>
                <p className="text-xs text-muted-foreground">Products sold</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Products</CardTitle>
                <ShoppingBag className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{products.length}</div>
                <p className="text-xs text-muted-foreground">In catalog</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Order Value</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{Math.round(totalRevenue / totalSales)}</div>
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
                {products
                  .sort((a, b) => b.sales - a.sales)
                  .map((product) => (
                    <div key={product.id} className="flex items-center justify-between pb-3 border-b last:border-0">
                      <span className="text-sm font-medium">{product.name}</span>
                      <div className="flex items-center gap-4">
                        <span className="text-sm text-muted-foreground">{product.sales} sold</span>
                        <span className="text-sm font-semibold">₹{(product.price * product.sales).toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Store Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Store Name</label>
                <Input defaultValue="FitFlow Supplements" />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Store Description</label>
                <textarea
                  defaultValue="Premium quality supplements and nutrition products for gym members"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Enable supplement store</span>
                </label>
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2">
                  <input type="checkbox" defaultChecked />
                  <span className="text-sm">Enable member discounts</span>
                </label>
              </div>

              <div className="space-y-2">
                <label htmlFor="discount">Member Discount (%)</label>
                <Input id="discount" type="number" defaultValue="10" min="0" max="100" />
              </div>

              <Button className="bg-primary text-primary-foreground">
                Save Settings
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
