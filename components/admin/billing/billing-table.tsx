"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { fetchBills } from "@/app/api/billing/fetchBills"

type Bill = {
  member: string
  amount: number
  dueDate: string
  status: string
  id: string
  paidDate: string | null
  packageName?: string
}

export function BillingTable(props: {
  addedBill: Bill | null
}) {
  const [bills, setBills] = useState<Bill[]>([])
  const [adminId, setAdminId] = useState<string>("")
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user?.id) setAdminId(session.user.id)
  }, [session])

  useEffect(() => {
    const bill = props.addedBill
    if (!bill) return
    setBills((prev) => [bill, ...prev])
  }, [props.addedBill])

  useEffect(() => {
    const loadBills = async () => {
      if (!adminId) return
      const res = await fetchBills(adminId)
      if (res.success) {
        setBills(res.data)
      }
    }
    loadBills()
  }, [adminId])

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
                <th className="text-left py-3 px-4 text-sm font-semibold">Member</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Package</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Amount</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Due Date</th>
                <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {bills.map((bill) => (
                <tr key={bill.id} className="border-b hover:bg-muted/50">
                  <td className="py-3 px-4">{bill.member}</td>
                  <td className="py-3 px-4 text-sm">{bill.packageName || "—"}</td>
                  <td className="py-3 px-4 font-semibold">₹{bill.amount}</td>
                  <td className="py-3 px-4 text-sm">{bill.dueDate}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        bill.status === "paid"
                          ? "bg-green-100 text-green-700"
                          : bill.status === "pending"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
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
