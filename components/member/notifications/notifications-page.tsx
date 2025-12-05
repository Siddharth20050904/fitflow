"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Bell, Trash2, Check, CheckCheck, Loader2 } from "lucide-react"
import { useSession } from "next-auth/react"
import {
  fetchMemberNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "@/app/api/member/fetchNotifications"
import toast from "react-hot-toast"

type Notification = {
  id: string
  title: string
  message: string
  type: string
  date: string
  read: boolean
}

export function MemberNotificationsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  useEffect(() => {
    const loadNotifications = async () => {
      if (!session?.user?.id) return
      try {
        const result = await fetchMemberNotifications(session.user.id)
        if (result.ok) {
          setNotifications(result.notifications)
        }
      } catch (error) {
        console.error("Failed to load notifications:", error)
      } finally {
        setLoading(false)
      }
    }
    loadNotifications()
  }, [session])

  const handleMarkRead = async (notificationId: string) => {
    const result = await markNotificationRead(notificationId)
    if (result.ok) {
      setNotifications((prev) => prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n)))
    }
  }

  const handleMarkAllRead = async () => {
    if (!session?.user?.id) return
    const result = await markAllNotificationsRead(session.user.id)
    if (result.ok) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      toast.success("All notifications marked as read")
    }
  }

  const handleDelete = async (notificationId: string) => {
    const result = await deleteNotification(notificationId)
    if (result.ok) {
      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      toast.success("Notification deleted")
    } else {
      toast.error("Failed to delete notification")
    }
  }

  const filteredNotifications = notifications.filter((notif) => {
    if (activeTab === "unread") return !notif.read
    return true
  })

  const unreadCount = notifications.filter((n) => !n.read).length

  const getTypeColor = (type: string) => {
    switch (type) {
      case "payment_reminder":
      case "Monthly Fee":
        return "bg-yellow-100 text-yellow-700 border-yellow-300"
      case "payment_confirmation":
        return "bg-green-100 text-green-700 border-green-300"
      case "special_offer":
      case "Special Offer":
        return "bg-blue-100 text-blue-700 border-blue-300"
      case "suspension_notice":
      case "Overdue Payment":
        return "bg-red-100 text-red-700 border-red-300"
      default:
        return "bg-gray-100 text-gray-700 border-gray-300"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">Stay updated with your membership and billing notifications</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllRead}>
            <CheckCheck className="h-4 w-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All ({notifications.length})</TabsTrigger>
          <TabsTrigger value="unread">Unread {unreadCount > 0 && `(${unreadCount})`}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <Card
                key={notif.id}
                className={`border-l-4 ${getTypeColor(notif.type)} transition-all hover:shadow-lg ${!notif.read ? "bg-blue-50 dark:bg-blue-950/20" : ""}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Bell className="h-5 w-5 flex-shrink-0" />
                        <h3 className="font-semibold">{notif.title}</h3>
                        {!notif.read && <span className="h-2 w-2 rounded-full bg-blue-500" />}
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{notif.message}</p>
                      <p className="text-xs text-muted-foreground">{notif.date}</p>
                    </div>
                    <div className="flex gap-2 flex-col flex-shrink-0">
                      {!notif.read && (
                        <Button variant="ghost" size="sm" onClick={() => handleMarkRead(notif.id)} title="Mark as read">
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(notif.id)}
                        title="Delete"
                      >
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
                <p className="text-muted-foreground">
                  {activeTab === "unread" ? "No unread notifications" : "No notifications"}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
