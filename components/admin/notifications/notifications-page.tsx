'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Send, Clock, CheckCircle, Trash2 } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const mockNotifications = [
  {
    id: 1,
    title: 'Monthly Fee Reminder',
    message: 'Remind all members about their upcoming monthly fees',
    type: 'monthly',
    status: 'sent',
    sentDate: '2024-11-01',
    recipients: 1234,
  },
  {
    id: 2,
    title: 'Overdue Payment Alert',
    message: 'Alert for members with pending bills',
    type: 'overdue',
    status: 'scheduled',
    sentDate: '2024-12-01',
    recipients: 45,
  },
]

export function AdminNotificationsPage() {
  const [activeTab, setActiveTab] = useState('manage')
  const [notifications, setNotifications] = useState(mockNotifications)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Manage and schedule notifications for members</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="manage">Manage Notifications</TabsTrigger>
          <TabsTrigger value="create">Create New</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="manage" className="space-y-6">
          <div className="flex justify-end">
            <Button 
              className="bg-primary text-primary-foreground"
              onClick={() => setActiveTab('create')}
            >
              <Plus className="h-4 w-4 mr-2" />
              New Notification
            </Button>
          </div>

          <div className="space-y-4">
            {notifications.map((notif) => (
              <Card key={notif.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-semibold">{notif.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{notif.message}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-muted">
                          Type: {notif.type}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notif.status === 'sent'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {notif.status}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {notif.recipients} recipients
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {notif.sentDate}
                        </span>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="create" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Create New Notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Notification Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Monthly Fee Reminder"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <textarea
                  id="message"
                  placeholder="Enter your notification message..."
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={4}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Notification Type</Label>
                  <select
                    id="type"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option>Monthly Fee</option>
                    <option>Overdue Payment</option>
                    <option>General Announcement</option>
                    <option>Special Offer</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="recipients">Send To</Label>
                  <select
                    id="recipients"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option>All Members</option>
                    <option>Active Members Only</option>
                    <option>Members with Pending Bills</option>
                  </select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="schedule">Schedule</Label>
                  <select
                    id="schedule"
                    className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option>Send Immediately</option>
                    <option>Schedule for Later</option>
                    <option>Recurring Monthly</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="date">Date & Time (if scheduled)</Label>
                  <Input type="datetime-local" id="date" />
                </div>
              </div>

              <div className="flex gap-3">
                <Button className="bg-primary text-primary-foreground">
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </Button>
                <Button variant="outline">
                  <Clock className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { name: 'Monthly Fee Reminder', desc: 'Remind members about their upcoming fees' },
              { name: 'Overdue Payment Alert', desc: 'Alert about pending or overdue bills' },
              { name: 'Welcome Message', desc: 'Welcome new gym members' },
              { name: 'Special Offer', desc: 'Announce special promotions or discounts' },
            ].map((template) => (
              <Card key={template.name} className="hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <h3 className="font-semibold">{template.name}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{template.desc}</p>
                  <Button variant="outline" className="w-full mt-4">
                    Use Template
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
