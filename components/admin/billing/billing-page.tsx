'use client'

import { Button } from '@/components/ui/button'
import { Plus, Download, Filter } from 'lucide-react'
import { BillingTable } from './billing-table'

export function BillingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="text-muted-foreground">Create and manage member bills and fee packages</p>
        </div>
        <Button className="bg-primary text-primary-foreground">
          <Plus className="h-4 w-4 mr-2" />
          Create Bill
        </Button>
      </div>

      <div className="flex gap-2">
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filter
        </Button>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      <BillingTable />
    </div>
  )
}
