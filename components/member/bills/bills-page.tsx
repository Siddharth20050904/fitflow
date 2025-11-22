"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Eye, AlertCircle } from "lucide-react"
import { useSession } from "next-auth/react"

type Bill = {
  id: string
  date: string
  amount: number
  packageName?: string
  status: string
  paidDate?: string
  receipt?: boolean
  dueDate?: string
}

export function MemberBillsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [bills, setBills] = useState<Bill[]>([])
  const { data: session } = useSession()

  useEffect(() => {
    const loadBills = async () => {
      if (!session?.user?.id) return
      try {
        const response = await fetch("/api/member/fetchMemberBills", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ memberId: session.user.id }),
        })
        const data = await response.json()
        if (data.ok) {
          setBills(data.bills)
        }
      } catch (error) {
        console.error("Failed to load bills:", error)
        // Fallback to mock data if API fails
        setBills([
          {
            id: "B001",
            date: "Nov 15, 2024",
            amount: 5000,
            packageName: "Premium",
            status: "paid",
            paidDate: "Nov 12, 2024",
            receipt: true,
          },
        ])
      }
    }
    loadBills()
  }, [session])

  const filteredBills = bills.filter((bill) => {
    if (activeTab === "paid") return bill.status === "paid"
    if (activeTab === "pending") return bill.status === "pending"
    return true
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bills & Receipts</h1>
        <p className="text-muted-foreground">View and download your billing history</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Bills</TabsTrigger>
          <TabsTrigger value="paid">Paid</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredBills.map((bill) => (
            <Card key={bill.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                      <h3 className="font-semibold text-lg">Bill #{bill.id}</h3>
                      <span
                        className={`text-xs px-3 py-1 rounded-full font-medium ${
                          bill.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {bill.status.toUpperCase()}
                      </span>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Bill Date</p>
                        <p className="text-sm font-medium">{bill.date}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Amount</p>
                        <p className="text-lg font-bold text-primary">₹{bill.amount.toLocaleString()}</p>
                      </div>
                      {bill.packageName && (
                        <div>
                          <p className="text-xs text-muted-foreground">Package</p>
                          <p className="text-sm font-medium">{bill.packageName}</p>
                        </div>
                      )}
                      {bill.paidDate && (
                        <div>
                          <p className="text-xs text-muted-foreground">Paid Date</p>
                          <p className="text-sm font-medium">{bill.paidDate}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2 flex-col">
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    {bill.receipt && (
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Receipt
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {filteredBills.length === 0 && (
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-muted-foreground">No bills found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Pending Bill Alert */}
      {bills.some((b) => b.status === "pending") && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900">Pending Bill</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  You have a pending bill. Please make the payment to keep your membership active.
                </p>
                <Button className="mt-3 bg-primary text-primary-foreground">Pay Now</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
