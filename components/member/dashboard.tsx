'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CreditCard, FileText, Calendar, AlertCircle } from 'lucide-react'

export function MemberDashboard() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">Here&apos;s your membership overview</p>
      </div>

      {/* Member Status Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Active</div>
            <p className="text-xs text-muted-foreground">Valid until Dec 2024</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Package</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Premium</div>
            <p className="text-xs text-muted-foreground">₹5,000/month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Bill Due</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Dec 15</div>
            <p className="text-xs text-muted-foreground">₹5,000</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹0</div>
            <p className="text-xs text-muted-foreground">All paid up!</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto flex-col py-4">
              <FileText className="h-5 w-5 mb-2" />
              <span>View Bills</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4">
              <FileText className="h-5 w-5 mb-2" />
              <span>Download Receipt</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4">
              <CreditCard className="h-5 w-5 mb-2" />
              <span>Pay Now</span>
            </Button>
            <Button variant="outline" className="h-auto flex-col py-4">
              <Calendar className="h-5 w-5 mb-2" />
              <span>Upgrade Plan</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Bills */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { id: 'B001', date: 'Nov 15, 2024', amount: '₹5,000', status: 'Paid' },
              { id: 'B002', date: 'Oct 15, 2024', amount: '₹5,000', status: 'Paid' },
              { id: 'B003', date: 'Sep 15, 2024', amount: '₹5,000', status: 'Paid' },
            ].map((bill) => (
              <div key={bill.id} className="flex items-center justify-between pb-4 border-b last:border-0">
                <div>
                  <p className="font-medium">{bill.id}</p>
                  <p className="text-sm text-muted-foreground">{bill.date}</p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold">{bill.amount}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                    {bill.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
