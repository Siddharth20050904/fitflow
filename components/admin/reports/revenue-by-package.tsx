"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, DollarSign } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"
import { getRevenueByPackage } from "@/app/api/reports/revenueByPackage"

interface RevenueData {
  packageId: string
  packageName: string
  totalBills: number
  paidBills: number
  pendingBills: number
  totalRevenue: number
  collectedRevenue: number
  pendingRevenue: number
  collectionRate: number
}

type Totals = {
  totalRevenue: number
  collectedRevenue: number
  pendingRevenue: number
  overallCollectionRate: number
}

type ChartData = {
  name: string
  collected: number
  pending: number
}

export function RevenueByPackageReport({ adminId }: { adminId: string }) {
  const [data, setData] = useState<RevenueData[]>([])
  const [totals, setTotals] = useState<Totals | null>(null)
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState<ChartData[]>([])

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const result = await getRevenueByPackage(adminId)
      if (result.success && result.data) {
        setData(result.data.packages)
        setTotals(result.data.totals)
        // Prepare chart data
        setChartData(
          result.data.packages.map((pkg) => ({
            name: pkg.packageName,
            collected: pkg.collectedRevenue,
            pending: pkg.pendingRevenue,
          })),
        )
      }
      setLoading(false)
    }
    fetchData()
  }, [adminId])

  if (loading) {
    return <div className="flex items-center justify-center h-96">Loading revenue data...</div>
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totals?.totalRevenue?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collected Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{totals?.collectedRevenue?.toLocaleString() || 0}</div>
            <p className="text-xs text-muted-foreground">
              Collection rate: {totals?.overallCollectionRate?.toFixed(1)}%
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">₹{totals?.pendingRevenue?.toLocaleString() || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Revenue Chart */}
      {chartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Package</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip formatter={(value) => `₹${value?.toLocaleString()}`} />
                <Legend />
                <Bar dataKey="collected" fill="#10b981" name="Collected" />
                <Bar dataKey="pending" fill="#fbbf24" name="Pending" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed Table */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Details by Package</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Package</th>
                  <th className="text-center py-2 px-2">Total Bills</th>
                  <th className="text-center py-2 px-2">Paid</th>
                  <th className="text-center py-2 px-2">Pending</th>
                  <th className="text-right py-2 px-2">Total Revenue</th>
                  <th className="text-right py-2 px-2">Collected</th>
                  <th className="text-right py-2 px-2">Pending</th>
                  <th className="text-center py-2 px-2">Collection Rate</th>
                </tr>
              </thead>
              <tbody>
                {data.map((pkg) => (
                  <tr key={pkg.packageId} className="border-b hover:bg-muted/50">
                    <td className="py-2 px-2 font-medium">{pkg.packageName}</td>
                    <td className="text-center py-2 px-2">{pkg.totalBills}</td>
                    <td className="text-center py-2 px-2 text-green-600">{pkg.paidBills}</td>
                    <td className="text-center py-2 px-2 text-yellow-600">{pkg.pendingBills}</td>
                    <td className="text-right py-2 px-2">₹{pkg.totalRevenue?.toLocaleString()}</td>
                    <td className="text-right py-2 px-2 text-green-600">₹{pkg.collectedRevenue?.toLocaleString()}</td>
                    <td className="text-right py-2 px-2 text-yellow-600">₹{pkg.pendingRevenue?.toLocaleString()}</td>
                    <td className="text-center py-2 px-2">{pkg.collectionRate?.toFixed(1)}%</td>
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
