'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { LayoutDashboard, Users, Wallet, Bell, BarChart3, ShoppingBag, Settings, LogOut } from 'lucide-react'
import { Dumbbell } from 'lucide-react'

interface AdminSidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AdminSidebar({ open, onOpenChange }: AdminSidebarProps) {
  const pathname = usePathname()

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin/dashboard' },
    { icon: Users, label: 'Members', href: '/admin/members' },
    { icon: Wallet, label: 'Billing', href: '/admin/billing' },
    { icon: Bell, label: 'Notifications', href: '/admin/notifications' },
    { icon: BarChart3, label: 'Reports', href: '/admin/reports' },
    { icon: ShoppingBag, label: 'Supplement Store', href: '/admin/store' },
    { icon: Settings, label: 'Settings', href: '/admin/settings' },
  ]

  return (
    <>
      {/* Mobile Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 md:hidden z-40"
          onClick={() => onOpenChange(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed md:relative z-50 w-64 h-screen bg-sidebar border-r border-sidebar-border transition-transform duration-300 md:translate-x-0',
          !open && '-translate-x-full md:translate-x-0'
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
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors text-sm font-medium',
                    isActive
                      ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
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
            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors">
              <LogOut className="h-5 w-5" />
              Logout
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}
