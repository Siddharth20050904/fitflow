'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, BarChart3, TrendingUp, Users } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Label } from '@/components/ui/label'

const revenueData = [
  { month: 'Jan', revenue: 4000, paid: 3500, pending: 500 },
  { month: 'Feb', revenue: 3000, paid: 2800, pending: 200 },
  { month: 'Mar', revenue: 2000, paid: 1900, pending: 100 },
  { month: 'Apr', revenue: 2780, paid: 2600, pending: 180 },
  { month: 'May', revenue: 1890, paid: 1750, pending: 140 },
  { month: 'Jun', revenue: 2390, paid: 2200, pending: 190 },
]

const membershipData = [
  { name: 'Premium', value: 450 },
  { name: 'Standard', value: 320 },
  { name: 'Basic', value: 464 },
]

const COLORS = ['#2a4b8c', '#6ba3d4', '#9cc8e3']

export function AdminReportsPage() {
  const [activeTab, setActiveTab] = useState('overview')

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
                <div className="text-2xl font-bold">₹16,060</div>
                <p className="text-xs text-muted-foreground">+12% from last year</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Collection Rate</CardTitle>
                <BarChart3 className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">94.2%</div>
                <p className="text-xs text-muted-foreground">Payments on time</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Members</CardTitle>
                <Users className="h-4 w-4 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">1,234</div>
                <p className="text-xs text-muted-foreground">+5% this month</p>
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
                  <span className="font-semibold">₹15,350</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span>Pending Payments</span>
                  <span className="font-semibold">₹890</span>
                </div>
                <div className="flex justify-between items-center pb-2 border-b">
                  <span>Overdue Payments</span>
                  <span className="font-semibold text-destructive">₹220</span>
                </div>
                <div className="flex justify-between items-center pt-2">
                  <span>Collection Rate</span>
                  <span className="font-semibold">94.2%</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Revenue by Package</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Premium', revenue: '₹8,500', percentage: '52%' },
                  { name: 'Standard', revenue: '₹5,200', percentage: '32%' },
                  { name: 'Basic', revenue: '₹2,360', percentage: '16%' },
                ].map((item) => (
                  <div key={item.name} className="flex justify-between items-center pb-2 border-b">
                    <span>{item.name}</span>
                    <div className="text-right">
                      <div className="font-semibold">{item.revenue}</div>
                      <div className="text-xs text-muted-foreground">{item.percentage}</div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="members" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Membership Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={membershipData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }) => `${name}: ${value}`}
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {membershipData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Member Statistics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Total Members', value: '1,234' },
                  { label: 'Active This Month', value: '1,150' },
                  { label: 'New Joiners', value: '43' },
                  { label: 'Inactive Members', value: '84' },
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
                {[
                  { month: 'January', change: '+45 members' },
                  { month: 'February', change: '+38 members' },
                  { month: 'March', change: '+52 members' },
                  { month: 'April', change: '+29 members' },
                ].map((trend) => (
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
