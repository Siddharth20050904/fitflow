"use client"

import { useState, useEffect } from "react"
import { Menu, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { signOut } from "next-auth/react"
import { useSession } from "next-auth/react"
import { getAdminProfile } from "@/app/api/admin/profile"

interface AdminHeaderProps {
  onMenuClick: () => void
}

interface AdminInfo {
  name: string
  email: string
}

export function AdminHeader({ onMenuClick }: AdminHeaderProps) {
  const [adminInfo, setAdminInfo] = useState<AdminInfo | null>(null)
  const [isOpen, setIsOpen] = useState(false);
  const [adminId, setAdminId] = useState<string | null>(null);
  const {data: session} = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      setAdminId(session.user.id);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    const fetchAdminInfo = async () => {
      try {
        if(!adminId) return;
        const res = await getAdminProfile(adminId);
        setAdminInfo(res);
      } catch (error) {
        console.error("Failed to fetch admin profile:", error);
      }
    }
    fetchAdminInfo()
  }, [adminId])

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/admin/login" })
  }

  return (
    <header className="border-b border-border bg-card">
      <div className="px-6 py-4 flex items-center justify-between">
        <Button variant="ghost" size="icon" onClick={onMenuClick} className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>

        <div className="flex items-center gap-4 ml-auto">
          <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-64 p-0" sideOffset={8}>
              <div className="p-4 border-b border-border">
                <p className="font-semibold text-foreground">{adminInfo?.name || "Admin User"}</p>
                <p className="text-sm text-muted-foreground truncate">{adminInfo?.email || "Loading..."}</p>
              </div>
              <div className="p-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>
    </header>
  )
}
