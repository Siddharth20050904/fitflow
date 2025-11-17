'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Bell, Trash2, Archive } from 'lucide-react'

const mockNotifications = [
  {
    id: 1,
    title: 'Bill Payment Due',
    message: 'Your premium membership bill of ₹5,000 is due on Dec 15, 2024',
    type: 'payment',
    date: '2024-12-01',
    read: false,
  },
  {
    id: 2,
    title: 'Payment Received',
    message: 'Thank you! We received your payment of ₹5,000. Receipt has been sent to your email.',
    type: 'success',
    date: '2024-11-12',
    read: true,
  },
  {
    id: 3,
    title: 'Special Offer',
    message: 'Enjoy 20% off on annual membership renewal. Offer valid till Dec 31, 2024',
    type: 'offer',
    date: '2024-11-10',
    read: true,
  },
  {
    id: 4,
    title: 'Membership Reminder',
    message: 'Your membership will expire in 15 days. Renew now to avoid service interruption.',
    type: 'reminder',
    date: '2024-11-05',
    read: true,
  },
]

export function MemberNotificationsPage() {
  const [activeTab, setActiveTab] = useState('all')
  const [notifications, setNotifications] = useState(mockNotifications)

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === 'unread') return !notif.read
    return true
  })

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'bg-yellow-100 text-yellow-700 border-yellow-300'
      case 'success':
        return 'bg-green-100 text-green-700 border-green-300'
      case 'offer':
        return 'bg-blue-100 text-blue-700 border-blue-300'
      case 'reminder':
        return 'bg-purple-100 text-purple-700 border-purple-300'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Stay updated with your membership and billing notifications</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Notifications</TabsTrigger>
          <TabsTrigger value="unread">Unread</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <Card 
                key={notif.id}
                className={`border-l-4 ${getTypeColor(notif.type)} transition-all hover:shadow-lg ${!notif.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Bell className="h-5 w-5 flex-shrink-0" />
                        <h3 className={`font-semibold ${!notif.read ? 'text-base' : 'text-base'}`}>
                          {notif.title}
                        </h3>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{notif.message}</p>
                      <p className="text-xs text-muted-foreground">{notif.date}</p>
                    </div>
                    <div className="flex gap-2 flex-col flex-shrink-0">
                      <Button variant="ghost" size="sm">
                        <Archive className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12 text-center">
                <Bell className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground">No notifications</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
