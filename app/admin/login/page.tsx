'use client'

import { AdminLoginForm } from '@/components/admin/login-form'
import Link from 'next/link'
import { Dumbbell } from 'lucide-react'

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-card rounded-xl shadow-xl p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="h-12 w-12 rounded-lg bg-primary flex items-center justify-center">
              <Dumbbell className="h-7 w-7 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold text-foreground ml-3">FitFlow</span>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2">Gym Owner Portal</h1>
          <p className="text-center text-muted-foreground mb-8">Sign in to your account</p>
          
          <AdminLoginForm />
          
          <p className="text-center text-sm text-muted-foreground mt-6">
            Looking for member login?{' '}
            <Link href="/member/login" className="text-primary hover:underline font-semibold">
              Go here
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
