import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LandingHeader } from '@/components/landing/header'
import { FeatureGrid } from '@/components/landing/feature-grid'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <LandingHeader />
      
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="text-center mb-20">
            <h1 className="text-5xl font-bold tracking-tight text-foreground mb-4">
              FitFlow
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Complete gym management system for owners and members
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/admin/login">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  Gym Owner Login
                </Button>
              </Link>
              <Link href="/member/login">
                <Button size="lg" variant="outline">
                  Member Login
                </Button>
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <FeatureGrid />

          {/* Benefits Section */}
          <div className="mt-20 grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Digital Receipts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  All receipts stored securely in digital format. Never lose track of payment records again.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Smart Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Members receive payment reminders, and owners get real-time payment notifications.
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Scalable Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Future-ready with nutrition, personal training, and supplement store features.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </main>
  )
}
