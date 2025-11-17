'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useState } from "react"

export function MemberSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input id="full-name" defaultValue="John Doe" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" defaultValue="john@example.com" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" defaultValue="555-0101" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="membership-id">Membership ID</Label>
                <Input id="membership-id" defaultValue="MEM-2024-001" disabled />
              </div>

              <Button className="bg-primary text-primary-foreground">
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { label: 'Bill Payment Reminders', desc: 'Get reminded before bills are due' },
                { label: 'Payment Receipts', desc: 'Email receipt after payment' },
                { label: 'Promotional Offers', desc: 'Receive special offers and discounts' },
                { label: 'Gym Updates', desc: 'Get gym announcements and news' },
              ].map((pref) => (
                <label key={pref.label} className="flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{pref.label}</p>
                    <p className="text-sm text-muted-foreground">{pref.desc}</p>
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
                <Label htmlFor="current-pwd">Current Password</Label>
                <Input id="current-pwd" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="new-pwd">New Password</Label>
                <Input id="new-pwd" type="password" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-pwd">Confirm Password</Label>
                <Input id="confirm-pwd" type="password" />
              </div>

              <Button className="bg-primary text-primary-foreground">
                Update Password
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
