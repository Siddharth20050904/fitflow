'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { AlertCircle } from 'lucide-react'

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your gym account and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gym Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gym-name">Gym Name</Label>
                <Input id="gym-name" defaultValue="FitFlow Gym" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gym-email">Gym Email</Label>
                <Input id="gym-email" type="email" defaultValue="owner@fitflow.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gym-phone">Phone</Label>
                <Input id="gym-phone" defaultValue="+91 9876543210" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="gym-address">Address</Label>
                <textarea
                  id="gym-address"
                  defaultValue="123 Fitness Street, Downtown, City - 123456"
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
              </div>

              <Button className="bg-primary text-primary-foreground">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment Methods</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { type: 'Bank Transfer', last4: '****1234', isDefault: true },
                { type: 'Credit Card', last4: '****5678', isDefault: false },
              ].map((method) => (
                <div key={method.last4} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{method.type}</p>
                    <p className="text-sm text-muted-foreground">{method.last4}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    {method.isDefault && (
                      <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700">
                        Default
                      </span>
                    )}
                    <Button variant="outline" size="sm">
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing Plans</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <p className="font-medium">Professional Plan</p>
                  <p className="text-sm text-muted-foreground">₹9,999/month</p>
                </div>
                <Button variant="outline" disabled>
                  Current Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Payment Notifications', desc: 'Get alerts when members make payments' },
                { label: 'Daily Reports', desc: 'Receive daily summary reports' },
                { label: 'Overdue Alerts', desc: 'Alert for overdue member payments' },
                { label: 'New Member Signup', desc: 'Notify when new members join' },
              ].map((notif) => (
                <label key={notif.label} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{notif.label}</p>
                    <p className="text-sm text-muted-foreground">{notif.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked className="h-4 w-4" />
                </label>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <Input id="current-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input id="new-password" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm Password</Label>
                <Input id="confirm-password" type="password" />
              </div>

              <Button className="bg-primary text-primary-foreground">
                Update Password
              </Button>
            </CardContent>
          </Card>

          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <CardTitle className="text-yellow-900">Two-Factor Authentication</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-yellow-800 mb-4">
                Add an extra layer of security to your account
              </p>
              <Button className="bg-primary text-primary-foreground">
                Enable 2FA
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
