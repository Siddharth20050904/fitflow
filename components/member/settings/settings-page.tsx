"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
import { fetchMemberProfile, updateMemberProfile } from "@/app/api/member/settings"
import { Loader2 } from "lucide-react"
import toast from "react-hot-toast"

type Profile = {
  id: string
  name: string
  email: string
  phone: string
  status: string
  joinDate: string
  gymName: string
}

export function MemberSettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: "",
    phone: "",
  })
  const { data: session } = useSession()

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.user?.id) return
      try {
        const result = await fetchMemberProfile(session.user.id)
        if (result.ok && result.profile) {
          setProfile(result.profile)
          setForm({
            name: result.profile.name,
            phone: result.profile.phone,
          })
        }
      } catch (error) {
        console.error("Failed to load profile:", error)
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [session])

  const handleSave = async () => {
    if (!session?.user?.id) return

    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    setSaving(true)
    try {
      const result = await updateMemberProfile(session.user.id, form)
      if (result.ok && result.profile) {
        setProfile((prev) => (prev ? { ...prev, ...result.profile } : null))
        toast.success("Profile updated successfully")
      } else {
        toast.error(result.message || "Failed to update profile")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setSaving(false)
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
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your profile and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full-name">Full Name</Label>
                <Input
                  id="full-name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={profile?.email || ""} disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="membership-id">Membership ID</Label>
                <Input id="membership-id" value={profile?.id || ""} disabled className="bg-muted font-mono text-sm" />
              </div>

              <Button className="bg-primary text-primary-foreground" onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="membership" className="space-y-6 mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Membership Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Gym</p>
                  <p className="font-medium">{profile?.gymName || "N/A"}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Member Since</p>
                  <p className="font-medium">{profile?.joinDate || "N/A"}</p>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Status</p>
                  <span
                    className={`inline-block mt-1 text-xs px-2 py-1 rounded-full capitalize ${
                      profile?.status === "active"
                        ? "bg-green-100 text-green-700"
                        : profile?.status === "suspended"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {profile?.status || "N/A"}
                  </span>
                </div>
                <div className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">Member ID</p>
                  <p className="font-mono text-sm">{profile?.id || "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
