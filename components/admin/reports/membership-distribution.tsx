"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, TrendingUp, UserCheck } from "lucide-react"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts"
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
  members: {
    id: string
    name: string
    email: string
    phone: string
    status: string
    joinDate: string
  }[]
}

type Summary = {
  totalPackages: number
  totalMembers: number
  totalActiveMembers: number
  totalInactiveMembers: number
  totalPotentialRevenue: number
}

type ChartData = {
  name: string
  value: number
}

export function MembershipDistributionReport({ adminId }: { adminId: string }) {
  const [data, setData] = useState<PackageMembershipData[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<ChartData[]>([])

  const COLORS = ["#2a4b8c", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

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
            value: pkg.totalMembers,
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
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalMembers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <UserCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{summary?.totalActiveMembers || 0}</div>
            <p className="text-xs text-muted-foreground">
              {summary?.totalMembers ? Math.round((summary.totalActiveMembers / summary.totalMembers) * 100) : 0}%
              active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactive Members</CardTitle>
            <Users className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{summary?.totalInactiveMembers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Packages</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.totalPackages || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Membership Distribution Chart */}
      {chartData.length > 0 && (
        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Members by Package (Pie Chart)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Active vs Inactive by Package</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={data.map((pkg) => ({
                    name: pkg.packageName,
                    active: pkg.activeMembers,
                    inactive: pkg.inactiveMembers,
                  }))}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="active" fill="#10b981" name="Active" />
                  <Bar dataKey="inactive" fill="#fbbf24" name="Inactive" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Membership Details by Package</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Package</th>
                  <th className="text-center py-2 px-2">Price</th>
                  <th className="text-center py-2 px-2">Cycle</th>
                  <th className="text-center py-2 px-2">Total</th>
                  <th className="text-center py-2 px-2">Active</th>
                  <th className="text-center py-2 px-2">Inactive</th>
                </tr>
              </thead>
              <tbody>
                {data.map((pkg) => (
                  <tr key={pkg.packageId} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">{pkg.packageName}</td>
                    <td className="text-center py-2 px-2">₹{pkg.price?.toLocaleString()}</td>
                    <td className="text-center py-2 px-2">{pkg.billingCycle}</td>
                    <td className="text-center py-2 px-2 font-semibold">{pkg.totalMembers}</td>
                    <td className="text-center py-2 px-2 text-green-600">{pkg.activeMembers}</td>
                    <td className="text-center py-2 px-2 text-yellow-600">{pkg.inactiveMembers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
