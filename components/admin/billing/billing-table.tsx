"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { fetchBills } from "@/app/api/billing/fetchBills"
import { updateBillStatus } from "@/app/api/billing/updateBillStatus"
import { CheckCircle } from "lucide-react"
import toast from "react-hot-toast"

type Bill = {
  member: string
  amount: number
  dueDate: string
  status: string
  id: string
  paidDate: string | null
  packageName?: string
}

export function BillingTable(props: { addedBill: Bill | null }) {
  const [bills, setBills] = useState<Bill[]>([])
  const [adminId, setAdminId] = useState<string>("")
  const [updatingBillId, setUpdatingBillId] = useState<string | null>(null)
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

  const handleMarkAsPaid = async (billId: string) => {
    setUpdatingBillId(billId)
    try {
      const res = await updateBillStatus({
        billId,
        status: "paid",
        paidDate: new Date(),
      })

      if (res.ok && res.bill) {
        setBills((prev) =>
          prev.map((bill) =>
            bill.id === billId ? { ...bill, status: res.bill!.status, paidDate: res.bill!.paidDate } : bill,
          ),
        )
        toast.success(res.message)
      } else {
        toast.error(res.message)
      }
    } catch {
      toast.error("An error occurred while updating bill status")
    } finally {
      setUpdatingBillId(null)
    }
  }

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
                <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
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
                  <td className="py-3 px-0">
                    {(bill.status === "pending" || bill.status === "overdue") && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-green-600 border-green-600 hover:bg-green-50 hover:text-green-700 bg-transparent"
                            disabled={updatingBillId === bill.id}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            {updatingBillId === bill.id ? "Updating..." : "Mark as Paid"}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirm Payment</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to mark this bill as paid?
                              <br />
                              <span className="font-medium">
                                Member: {bill.member} | Amount: ₹{bill.amount}
                              </span>
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleMarkAsPaid(bill.id)}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              Confirm
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
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
