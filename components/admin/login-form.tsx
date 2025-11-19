'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { sendLoginMail } from '@/app/api/handleMails/sendLogin'
import toast from 'react-hot-toast'

export function AdminLoginForm() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const res = await sendLoginMail(email, "ADMIN")

      if (res.success) {
        toast.success("Login link sent to your email!")
      } else {
        toast.error(res.message || "Failed to send email")
      }
    } catch{
      toast.error("Unexpected error occurred")
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="owner@gym.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <Button
        type="submit"
        className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
        disabled={isLoading}
      >
        {isLoading ? 'Sending...' : 'Send Login Link'}
      </Button>
    </form>
  )
}
