'use client'

import { MemberSidebar } from '@/components/member/sidebar'
import { MemberHeader } from '@/components/member/header'
import { useState } from 'react'
import { usePathname } from 'next/navigation'

export default function MemberLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname();


  return (
    <div className="flex h-screen bg-background">
      {pathname!=="/member/login" &&
        <MemberSidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />}
      <div className="flex-1 flex flex-col overflow-hidden">
        {pathname!=="/member/login" && <MemberHeader onMenuClick={() => setSidebarOpen(!sidebarOpen)} />}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
