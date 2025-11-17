'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const mockBills = [
  { id: 'B001', member: 'John Doe', amount: 5000, package: 'Premium', dueDate: '2024-12-15', status: 'paid', paidDate: '2024-12-10' },
  { id: 'B002', member: 'Jane Smith', amount: 3000, package: 'Basic', dueDate: '2024-12-20', status: 'pending', paidDate: null },
  { id: 'B003', member: 'Bob Johnson', amount: 4000, package: 'Standard', dueDate: '2024-11-30', status: 'overdue', paidDate: null },
]

export function BillingTable() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Bills</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="text-left py-3 px-4 text-sm font-semibold">Bill ID</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Member</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Package</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Due Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {mockBills.map((bill) => (
                <tr key={bill.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4 font-mono text-sm">{bill.id}</td>
                  <td className="py-3 px-4">{bill.member}</td>
                  <td className="py-3 px-4 font-semibold">₹{bill.amount}</td>
                  <td className="py-3 px-4 text-sm">{bill.package}</td>
                  <td className="py-3 px-4 text-sm">{bill.dueDate}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      bill.status === 'paid'
                        ? 'bg-green-100 text-green-700'
                        : bill.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {bill.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
