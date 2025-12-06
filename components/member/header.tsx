"use client"

import { useState, useEffect } from "react"
import { Menu, User, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { signOut, useSession } from "next-auth/react"
import { getMemberProfile } from "@/app/api/member/profile"

interface MemberHeaderProps {
  onMenuClick: () => void
}

interface MemberInfo {
  name: string
  email: string
  phone: string
  currentPackage: string | null
  status: string
}

export function MemberHeader({ onMenuClick }: MemberHeaderProps) {
  const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null)
  const [isOpen, setIsOpen] = useState(false);
  const [memberId, setMemberId] = useState<string | null>(null);
  const {data: session} = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      setMemberId(session.user.id as string);
    }
  }, [session]);

  useEffect(() => {
    const fetchMemberInfo = async () => {
      try {
        if (!memberId) return;
        const data = await getMemberProfile(memberId) // Replace "memberId" with the actual member ID
        if(!data) {
          console.error("No member data returned")
          return
        }
        setMemberInfo({
          name: data.name,
          email: data.email,
          phone: data.phone,
          currentPackage: data.bills.length > 0 ? data.bills[0].package!.name : 'No Package',
          status: data.status,
        })
        console.log("Fetched member info:", data)
      }catch (error) {
        console.error("Failed to fetch member info:", error)
      }
    }
    fetchMemberInfo()
  }, [memberId])

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/member/login" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500/10 text-green-500 border-green-500/20"
      case "inactive":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
      case "suspended":
        return "bg-red-500/10 text-red-500 border-red-500/20"
      default:
        return "bg-muted text-muted-foreground"
    }
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
            <PopoverContent align="end" className="w-72 p-0" sideOffset={8}>
              <div className="p-4 border-b border-border">
                <div className="flex items-center justify-between mb-1">
                  <p className="font-semibold text-foreground">{memberInfo?.name || "Member"}</p>
                  {memberInfo?.status && (
                    <Badge variant="outline" className={`text-xs capitalize ${getStatusColor(memberInfo.status)}`}>
                      {memberInfo.status}
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{memberInfo?.email || "Loading..."}</p>
              </div>

              <div className="p-4 border-b border-border space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Phone</span>
                  <span className="text-foreground">{memberInfo?.phone || "N/A"}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Package</span>
                  <span className="text-foreground font-medium">{memberInfo?.currentPackage || "No Package"}</span>
                </div>
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
