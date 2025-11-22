"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, BarChart3, TrendingUp, Users } from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Label } from "@/components/ui/label"
import { MembershipDistributionReport } from "./membership-distribution"
import { RevenueByPackageReport } from "./revenue-by-package"
import { getOverviewStats } from "@/app/api/reports/overviewStats"
import { getMonthlyRevenueTrend } from "@/app/api/reports/monthlyRevenueTrend"
import { getPaymentSummary } from "@/app/api/reports/paymentSummary"
import { getMemberStatistics } from "@/app/api/reports/memberStatistics"

type OverviewStats = {
  totalRevenue: number
  collectionRate: number
  totalMembers: number
  activeMembers: number
  newJoiners: number
  revenueGrowth: number
  memberGrowth: number
}

type RevenueData = {
  month: string
  revenue: number
  paid: number
  pending: number
}

type PaymentSummary = {
  totalCollected: number
  pendingPayments: number
  overduePayments: number
  collectionRate: number
}

type MemberStats = {
  totalMembers: number
  activeThisMonth: number
  newJoiners: number
  inactiveMembers: number
  monthlyTrends: Array<{
    month: string
    change: string
  }>
}

export function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [overviewStats, setOverviewStats] = useState<OverviewStats>()
  const [revenueData, setRevenueData] = useState<RevenueData[]>([])
  const [paymentSummary, setPaymentSummary] = useState<PaymentSummary | null>(null)
  const [memberStats, setMemberStats] = useState<MemberStats | null>(null)
  const { data: session } = useSession()
  const [adminId, setAdminId] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.id) setAdminId(session.user.id)
  }, [session])

  useEffect(() => {
    const fetchAllData = async () => {
      if (!adminId) return

      try {
        setLoading(true)
        const [overview, revenue, payment, members] = await Promise.all([
          getOverviewStats(adminId),
          getMonthlyRevenueTrend(adminId),
          getPaymentSummary(adminId),
          getMemberStatistics(adminId),
        ])

        if (overview.success && overview.data && overview.data.totalRevenue !== undefined) setOverviewStats(overview.data)
        if (revenue.success) setRevenueData(revenue.data)
        if (payment.success && payment.data && payment.data.totalCollected !== undefined) setPaymentSummary(payment.data)
        if (members.success && members.data && members.data.totalMembers !== undefined) setMemberStats(members.data)
      } catch (error) {
        console.error("Error fetching reports data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAllData()
  }, [adminId])

  if (loading) {
    return <div className="text-center py-12">Loading reports...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground">View and export gym analytics and reports</p>
        </div>
        <Button className="bg-primary text-primary-foreground">
          <Download className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="custom">Custom Report</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue (YTD)</CardTitle>
                <TrendingUp className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{overviewStats?.totalRevenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">+{overviewStats?.revenueGrowth}% from last year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewStats?.collectionRate}%</div>
                <p className="text-xs text-muted-foreground">Payments on time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{overviewStats?.totalMembers}</div>
                <p className="text-xs text-muted-foreground">+{overviewStats?.memberGrowth}% this month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue vs Payments (Last 6 Months)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="paid" stackId="a" fill="#2a4b8c" />
                  <Bar dataKey="pending" stackId="a" fill="#fbbf24" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Revenue Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="revenue" stroke="#2a4b8c" strokeWidth={2} />
                  <Line type="monotone" dataKey="paid" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center pb-2 border-b">
                  <span>Total Collected</span>
                  <span className="font-semibold">₹{paymentSummary?.totalCollected.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span>Pending Payments</span>
                  <span className="font-semibold">₹{paymentSummary?.pendingPayments.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span>Overdue Payments</span>
                  <span className="font-semibold text-destructive">
                    ₹{paymentSummary?.overduePayments.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span>Collection Rate</span>
                  <span className="font-semibold">{paymentSummary?.collectionRate}%</span>
                </div>
              </CardContent>
            </Card>

            <RevenueByPackageReport adminId={adminId!} />
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <MembershipDistributionReport adminId={adminId!} />

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Member Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Total Members", value: memberStats?.totalMembers || 0 },
                  { label: "Active This Month", value: memberStats?.activeThisMonth || 0 },
                  { label: "New Joiners", value: memberStats?.newJoiners || 0 },
                  { label: "Inactive Members", value: memberStats?.inactiveMembers || 0 },
                ].map((stat) => (
                  <div key={stat.label} className="flex justify-between items-center pb-2 border-b">
                    <span>{stat.label}</span>
                    <span className="font-semibold">{stat.value}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Membership Trends</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {memberStats?.monthlyTrends?.map((trend : { month: string; change: string }) => (
                  <div key={trend.month} className="flex justify-between items-center pb-2 border-b">
                    <span>{trend.month}</span>
                    <span className="font-semibold text-primary">{trend.change}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Generate Custom Report</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-type">Report Type</Label>
                  <select
                    id="report-type"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option>Financial Summary</option>
                    <option>Member Activity</option>
                    <option>Payment Collection</option>
                    <option>Membership Analysis</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date-range">Date Range</Label>
                  <select
                    id="date-range"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option>Last 30 Days</option>
                    <option>Last Quarter</option>
                    <option>Last 6 Months</option>
                    <option>This Year</option>
                    <option>Custom Range</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Export Format</Label>
                  <select
                    id="format"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option>PDF</option>
                    <option>Excel</option>
                    <option>CSV</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="includes">Include</Label>
                  <div className="flex gap-4 mt-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Charts</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked />
                      <span className="text-sm">Tables</span>
                    </label>
                  </div>
                </div>
              </div>

              <Button className="bg-primary text-primary-foreground">
                <Download className="h-4 w-4 mr-2" />
                Generate & Download
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
