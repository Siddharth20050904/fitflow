"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { sendLoginMail } from "@/app/api/handleMails/sendLogin"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { TestTube, Loader2 } from "lucide-react"
import toast from "react-hot-toast"

export function AdminLoginForm() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isTestLoading, setIsTestLoading] = useState(false)

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
    } catch {
      toast.error("Unexpected error occurred")
    }

    setIsLoading(false)
  }

  const handleTestLogin = async () => {
    setIsTestLoading(true)
    try {
      const result = await signIn("credentials", {
        type: "ADMIN",
        token: "TEST_ADMIN_TOKEN",
        redirect: false,
      })

      if (result?.ok) {
        toast.success("Logged in as test admin!")
        router.push("/admin/dashboard")
      } else {
        toast.error("Test login failed. Please try again.")
      }
    } catch {
      toast.error("Test login failed. Please try again.")
    }
    setIsTestLoading(false)
  }

  return (
    <div className="space-y-6">
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
          {isLoading ? "Sending..." : "Send Login Link"}
        </Button>
      </form>

      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground text-center mb-3">For demo/testing purposes:</p>
        <Button
          type="button"
          variant="outline"
          onClick={handleTestLogin}
          disabled={isTestLoading}
          className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950 bg-transparent"
        >
          {isTestLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <TestTube className="w-4 h-4 mr-2" />}
          Login as Test Admin
        </Button>
        <p className="text-xs text-muted-foreground text-center mt-2">Email: testuser@mail.com</p>
      </div>
    </div>
  )
}
