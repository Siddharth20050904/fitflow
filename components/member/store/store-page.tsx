'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { ShoppingCart, Star, Filter } from 'lucide-react'
import Image from 'next/image'

const mockProducts = [
  {
    id: 1,
    name: 'Whey Protein Powder',
    category: 'Supplements',
    price: 1500,
    memberPrice: 1350,
    rating: 4.8,
    reviews: 234,
    image: '/protein-powder.jpg',
    inStock: true,
  },
  {
    id: 2,
    name: 'BCAA Complex',
    category: 'Supplements',
    price: 1200,
    memberPrice: 1080,
    rating: 4.6,
    reviews: 156,
    image: '/bcaa-supplement.jpg',
    inStock: true,
  },
  {
    id: 3,
    name: 'Creatine Monohydrate',
    category: 'Supplements',
    price: 800,
    memberPrice: 720,
    rating: 4.7,
    reviews: 189,
    image: '/creatine-powder.png',
    inStock: true,
  },
  {
    id: 4,
    name: 'Pre-Workout Energy',
    category: 'Pre-Workout',
    price: 1400,
    memberPrice: 1260,
    rating: 4.5,
    reviews: 98,
    image: '/pre-workout-supplement.png',
    inStock: true,
  },
  {
    id: 5,
    name: 'Multivitamin Complex',
    category: 'Vitamins',
    price: 900,
    memberPrice: 810,
    rating: 4.4,
    reviews: 112,
    image: '/assorted-vitamins.png',
    inStock: true,
  },
  {
    id: 6,
    name: 'Omega-3 Fish Oil',
    category: 'Health',
    price: 1100,
    memberPrice: 990,
    rating: 4.3,
    reviews: 87,
    image: '/omega3.jpg',
    inStock: false,
  },
]

export function MemberStorePage() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [cart, setCart] = useState<number[]>([])

  const categories = ['All', 'Supplements', 'Pre-Workout', 'Vitamins', 'Health']

  const filteredProducts = selectedCategory === 'All'
    ? mockProducts
    : mockProducts.filter(p => p.category === selectedCategory)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Supplement Store</h1>
          <p className="text-muted-foreground">Premium supplements with member discounts</p>
        </div>
        <div className="relative">
          <Button variant="outline" size="lg">
            <ShoppingCart className="h-5 w-5 mr-2" />
            Cart ({cart.length})
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
                variant={selectedCategory === category ? 'default' : 'outline'}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </Button>
            ))}
          </div>
        </CardHeader>
      </Card>

      {/* Products Grid */}
      <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card
            key={product.id}
            className={`hover:shadow-lg transition-all ${!product.inStock ? 'opacity-60' : ''}`}
          >
            <CardContent className="p-0">
              {/* Product Image */}
              <div className="aspect-square bg-muted relative overflow-hidden rounded-t-lg">
                <Image
                  src={product.image || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
                {!product.inStock && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white font-semibold">Out of Stock</span>
                  </div>
                )}
              </div>

              {/* Product Info */}
              <div className="p-4">
                <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">
                  {product.category}
                </span>
                <h3 className="font-semibold mt-2 line-clamp-2">{product.name}</h3>

                {/* Rating */}
                <div className="flex items-center gap-1 mt-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3 w-3 ${i < Math.floor(product.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-muted-foreground">({product.reviews})</span>
                </div>

                {/* Pricing */}
                <div className="mt-3 space-y-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-sm line-through text-muted-foreground">₹{product.price}</span>
                    <span className="text-lg font-bold text-primary">₹{product.memberPrice}</span>
                  </div>
                  <p className="text-xs text-green-600">Save ₹{product.price - product.memberPrice}</p>
                </div>

                {/* Add to Cart */}
                <Button
                  className="w-full mt-4 bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={() => setCart([...cart, product.id])}
                  disabled={!product.inStock}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
