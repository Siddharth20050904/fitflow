"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, TrendingUp, BarChart3, AlertCircle } from "lucide-react"
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts"
import { getMembershipDistribution } from "@/app/api/reports/membershipDistribution"

interface PackageMembershipData {
  packageId: string
  packageName: string
  price: number
  billingCycle: string
  totalMembers: number
  activeMembers: number
  inactiveMembers: number
  features: string[]
  members: Array<{
    id: string
    name: string
    email: string
    phone: string
    status: string
    joinDate: string
  }>
}

type Summary = {
    totalPackages: number
    totalMembers: number
    totalActiveMembers: number
    totalPotentialRevenue: number
}

type ChartData = {
    name: string
    active: number
    inactive: number
    total: number
}

export function MembershipDistributionReport({ adminId }: { adminId: string }) {
  const [data, setData] = useState<PackageMembershipData[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [expandedPackage, setExpandedPackage] = useState<string | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const result = await getMembershipDistribution(adminId)
      if (result.success && result.data) {
        setData(result.data.packages)
        setSummary(result.data.summary)
        // Prepare chart data
        setChartData(
          result.data.packages.map((pkg) => ({
            name: pkg.packageName,
            active: pkg.activeMembers,
            inactive: pkg.inactiveMembers,
            total: pkg.totalMembers,
          })),
        )
      }
      setLoading(false)
    }
    fetchData()
  }, [adminId])

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading membership data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Packages</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalPackages || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalMembers || 0}</div>
            <p className="text-xs text-muted-foreground">{summary?.totalActiveMembers || 0} active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary?.totalActiveMembers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.totalMembers ? Math.round((summary.totalActiveMembers / summary.totalMembers) * 100) : 0}%
              active rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{summary?.totalPotentialRevenue?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Membership Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Member Distribution by Package</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="active" stackId="a" fill="#10b981" name="Active" />
                <Bar dataKey="inactive" stackId="a" fill="#ef4444" name="Inactive" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed Package Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Package Details</h3>
        {data.map((pkg) => (
          <Card key={pkg.packageId} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader onClick={() => setExpandedPackage(expandedPackage === pkg.packageId ? null : pkg.packageId)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    <CardTitle className="text-lg">{pkg.packageName}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      ₹{pkg.price} / {pkg.billingCycle}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-8 text-right">
                  <div>
                    <p className="text-2xl font-bold text-primary">{pkg.totalMembers}</p>
                    <p className="text-xs text-muted-foreground">Total Members</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-green-600">{pkg.activeMembers}</p>
                    <p className="text-xs text-muted-foreground">Active</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-red-500">{pkg.inactiveMembers}</p>
                    <p className="text-xs text-muted-foreground">Inactive</p>
                  </div>
                </div>
              </div>
            </CardHeader>

            {/* Features */}
            {pkg.features && pkg.features.length > 0 && (
              <CardContent className="pt-0">
                <div className="flex gap-2 flex-wrap">
                  {pkg.features.map((feature) => (
                    <Badge key={feature} variant="secondary">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            )}

            {/* Expanded Member List */}
            {expandedPackage === pkg.packageId && (
              <CardContent className="pt-0">
                <div className="mt-4 pt-4 border-t">
                  <h4 className="font-semibold mb-3">Members in this package</h4>
                  {pkg.members.length > 0 ? (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {pkg.members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-2 hover:bg-muted rounded">
                          <div>
                            <p className="font-medium">{member.name}</p>
                            <p className="text-sm text-muted-foreground">{member.email}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm">{member.phone}</p>
                            <Badge variant={member.status === "active" ? "default" : "secondary"}>
                              {member.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <AlertCircle className="h-4 w-4" />
                      No members in this package
                    </div>
                  )}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
