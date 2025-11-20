'use client'

import { AdminSidebar } from '@/components/admin/sidebar'
import { AdminHeader } from '@/components/admin/header'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const path = usePathname();

  return (
    <div className="flex h-screen bg-background">
      {path!=="/admin/login" ? <AdminSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} /> : <></>}
      <div className="flex-1 flex flex-col overflow-hidden">
         {path!=="/admin/login" ? <AdminHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} /> : <></>}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
