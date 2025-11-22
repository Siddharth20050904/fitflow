"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit2, Trash2, Check } from "lucide-react"
import toast from "react-hot-toast"
import { useSession } from "next-auth/react"
import { fetchPackages } from "@/app/api/packages/fetchPackages"
import { createPackage } from "@/app/api/packages/createPackage"
import { updatePackage } from "@/app/api/packages/updatePackage"
import { deletePackage } from "@/app/api/packages/deletePackage"

type Package = {
  id: string
  name: string
  description: string | null
  price: number
  billingCycle: string
  features: string[]
  isActive: boolean
}

export function PackagesPage() {
  const [packages, setPackages] = useState<Package[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adminId, setAdminId] = useState<string | null>(null)

  // Form states
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [billingCycle, setBillingCycle] = useState("monthly")
  const [features, setFeatures] = useState("")

  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user?.id) setAdminId(session.user.id)
  }, [session])

  // Fetch packages
  useEffect(() => {
    const loadPackages = async () => {
      if (!adminId) return
      const res = await fetchPackages(adminId)
      if (res.ok) {
        setPackages(res.packages)
      } else {
        toast.error(res.message)
      }
    }
    loadPackages()
  }, [adminId])

  const resetForm = () => {
    setName("")
    setDescription("")
    setPrice("")
    setBillingCycle("monthly")
    setFeatures("")
    setEditingId(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name || !price) {
      toast.error("Please fill required fields")
      return
    }

    const featureList = features
      .split(",")
      .map((f) => f.trim())
      .filter((f) => f)

    if (editingId) {
      const res = await updatePackage({
        packageId: editingId,
        name,
        description,
        price: Number(price),
        billingCycle,
        features: featureList,
      })

      if (res.ok) {
        setPackages(packages.map((p) => (p.id === editingId ? res.package! : p)))
        toast.success("Package updated successfully")
        resetForm()
        setShowForm(false)
      } else {
        toast.error(res.message)
      }
    } else {
      const res = await createPackage({
        adminId: adminId!,
        name,
        description,
        price: Number(price),
        billingCycle,
        features: featureList,
      })

      if (res.ok) {
        setPackages([res.package!, ...packages])
        toast.success("Package created successfully")
        resetForm()
        setShowForm(false)
      } else {
        toast.error(res.message)
      }
    }
  }

  const handleEdit = (pkg: Package) => {
    setName(pkg.name)
    setDescription(pkg.description || "")
    setPrice(pkg.price.toString())
    setBillingCycle(pkg.billingCycle)
    setFeatures(pkg.features.join(", "))
    setEditingId(pkg.id)
    setShowForm(true)
  }

  const handleDelete = async (packageId: string) => {
    if (!confirm("Are you sure you want to delete this package?")) return

    const res = await deletePackage(packageId)
    if (res.ok) {
      setPackages(packages.filter((p) => p.id !== packageId))
      toast.success("Package deleted successfully")
    } else {
      toast.error(res.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Packages</h1>
          <p className="text-muted-foreground">Create and manage membership packages</p>
        </div>

        <Button
          className="bg-primary text-primary-foreground"
          onClick={() => {
            resetForm()
            setShowForm(true)
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          New Package
        </Button>
      </div>

      {/* Packages Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.map((pkg) => (
          <Card key={pkg.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <p className="text-xs text-muted-foreground mt-1">{pkg.billingCycle}</p>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(pkg)} className="p-2 hover:bg-muted rounded">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button onClick={() => handleDelete(pkg.id)} className="p-2 hover:bg-destructive/10 rounded">
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex-1">
              {pkg.description && <p className="text-sm text-muted-foreground mb-3">{pkg.description}</p>}

              <div className="mb-4">
                <p className="text-2xl font-bold text-primary">₹{pkg.price}</p>
                <p className="text-xs text-muted-foreground">per {pkg.billingCycle}</p>
              </div>

              {pkg.features.length > 0 && (
                <div className="space-y-2">
                  {pkg.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4 pt-4 border-t">
                <span
                  className={`text-xs font-medium px-2 py-1 rounded ${
                    pkg.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
                  }`}
                >
                  {pkg.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {packages.length === 0 && !showForm && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-4">No packages created yet</p>
            <Button className="bg-primary text-primary-foreground" onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Package
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Package Form Modal */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-card rounded-xl shadow-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">{editingId ? "Edit Package" : "Create Package"}</h2>
              <button
                className="text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
              >
                ✕
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              {/* Package Name */}
              <div>
                <label className="text-sm font-medium">Package Name *</label>
                <Input
                  type="text"
                  placeholder="e.g., Premium Membership"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-medium">Description</label>
                <textarea
                  placeholder="Package description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              {/* Price */}
              <div>
                <label className="text-sm font-medium">Price (₹) *</label>
                <Input
                  type="number"
                  placeholder="5000"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="mt-1"
                />
              </div>

              {/* Billing Cycle */}
              <div>
                <label className="text-sm font-medium">Billing Cycle</label>
                <select
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  value={billingCycle}
                  onChange={(e) => setBillingCycle(e.target.value)}
                >
                  <option value="monthly">Monthly</option>
                  <option value="quarterly">Quarterly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {/* Features */}
              <div>
                <label className="text-sm font-medium">Features (comma-separated)</label>
                <textarea
                  placeholder="e.g., 24/7 Access, Personal Trainer, Sauna, Swimming Pool"
                  value={features}
                  onChange={(e) => setFeatures(e.target.value)}
                  className="mt-1 w-full border rounded-md px-3 py-2 text-sm"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-primary text-primary-foreground">
                  {editingId ? "Update" : "Create"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
