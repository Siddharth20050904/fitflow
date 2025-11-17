import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Zap, BarChart3, Shield, Bell, Wallet } from 'lucide-react'

export function FeatureGrid() {
  const features = [
    {
      icon: Users,
      title: 'Member Management',
      description: 'Add, update, and delete gym members with ease'
    },
    {
      icon: Wallet,
      title: 'Billing System',
      description: 'Create bills and assign fee packages automatically'
    },
    {
      icon: Bell,
      title: 'Notifications',
      description: 'Monthly alerts for members and payment updates for owners'
    },
    {
      icon: BarChart3,
      title: 'Reports & Export',
      description: 'Generate detailed reports and export data'
    },
    {
      icon: Shield,
      title: 'Digital Receipts',
      description: 'Secure storage of all payment receipts'
    },
    {
      icon: Zap,
      title: 'Future Ready',
      description: 'Built for nutrition, training, and shop features'
    },
  ]

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {features.map((feature) => {
        const Icon = feature.icon
        return (
          <Card key={feature.title} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Icon className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">{feature.description}</p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
