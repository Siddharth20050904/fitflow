"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, FileText, Bell, ShoppingBag, Settings, LogOut } from "lucide-react"
import { Dumbbell } from "lucide-react"
import { signOut } from "next-auth/react"

interface MemberSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MemberSidebar({ open, onOpenChange }: MemberSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/member/dashboard" },
    { icon: FileText, label: "Bills & Receipts", href: "/member/bills" },
    { icon: Bell, label: "Notifications", href: "/member/notifications" },
    { icon: ShoppingBag, label: "Supplement Store", href: "/member/store" },
    { icon: Settings, label: "Settings", href: "/member/settings" },
  ]

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/member/login" })
  }

  return (
    <>
      {/* Mobile Overlay */}
      {open && <div className="fixed inset-0 bg-black/50 md:hidden z-40" onClick={() => onOpenChange(false)} />}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed md:relative z-50 w-64 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:translate-x-0",
          !open && "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 p-6 border-b border-sidebar-border">
            <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center">
              <Dumbbell className="h-5 w-5 text-sidebar-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-sidebar-foreground">FitFlow</span>
          </Link>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground"
                      : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-sidebar-border">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
