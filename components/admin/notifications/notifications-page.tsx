"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Send, CheckCircle } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sendNotification } from "@/app/api/handleMails/sendCustomNotification"
import { useEffect, useState } from "react"
import { useSession } from "next-auth/react"
import toast from "react-hot-toast"

export function AdminNotificationsPage() {
  const [adminId, setAdminId] = useState("")
  const { data: session } = useSession()
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [type, setType] = useState("Monthly Fee")
  const [recipients, setRecipients] = useState("All Members")
  const [lastSentCount, setLastSentCount] = useState<number | null>(null)

  useEffect(() => {
    if (session?.user?.id) {
      setAdminId(session.user.id)
    }
  }, [session])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!adminId) {
      toast.error("Admin ID not found. Please log in again.")
      return
    }

    const result = await sendNotification(title, message, type, recipients, adminId)

    if (result.success) {
      toast.success(`Notification sent to ${result.count} member(s) and saved to database!`)
      setLastSentCount(result.count || 0)
      setTitle("")
      setMessage("")
      setType("Monthly Fee")
      setRecipients("All Members")
    } else {
      toast.error(result.error || "Failed to send notification.")
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground">Manage and schedule notifications for members</p>
      </div>

      {lastSentCount !== null && (
        <Card className="bg-emerald-50 border-emerald-200 dark:bg-emerald-950/20 dark:border-emerald-800">
          <CardContent className="flex items-center gap-3 py-4">
            <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <p className="font-medium text-emerald-800 dark:text-emerald-200">Notifications sent successfully!</p>
              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                {lastSentCount} member(s) received an email and in-app notification.
              </p>
            </div>
            <Button variant="ghost" size="sm" className="ml-auto" onClick={() => setLastSentCount(null)}>
              Dismiss
            </Button>
          </CardContent>
        </Card>
      )}

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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <textarea
              id="message"
              placeholder="Enter your notification message..."
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Notification Type</Label>
              <select
                id="type"
                className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                value={type}
                onChange={(e) => setType(e.target.value)}
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
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
              >
                <option>All Members</option>
                <option>Active Members Only</option>
                <option>Members with Pending Bills</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <Button className="bg-primary text-primary-foreground" onClick={handleSubmit}>
              <Send className="h-4 w-4 mr-2" />
              Send Notification
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Notifications will be sent via email and saved to member accounts for in-app viewing.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
