"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Download, Eye, AlertCircle, Loader2, X } from "lucide-react"
import { useSession } from "next-auth/react"
import { fetchMemberBills, fetchBillDetails } from "@/app/api/member/fetchMemberBills"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

type Bill = {
  id: string
  date: string
  amount: number
  packageName: string
  status: string
  paidDate: string | null
  dueDate: string
  receipt: {
    id: string
    receiptNo: string
    amount: number
    paymentMethod: string | null
  } | null
}

type BillDetails = {
  id: string
  amount: number
  status: string
  dueDate: string
  paidDate: string | null
  createdAt: string
  package: {
    name: string
    description: string | null
    billingCycle: string
  } | null
  member: {
    name: string
    email: string
    phone: string
  }
  gym: {
    name: string
    email: string
  }
  receipt: {
    receiptNo: string
    amount: number
    paymentMethod: string | null
  } | null
}

export function MemberBillsPage() {
  const [activeTab, setActiveTab] = useState("all")
  const [bills, setBills] = useState<Bill[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBill, setSelectedBill] = useState<BillDetails | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(false)
  const { data: session } = useSession()

  useEffect(() => {
    const loadBills = async () => {
      if (!session?.user?.id) return
      try {
        const result = await fetchMemberBills(session.user.id)
        if (result.ok) {
          setBills(result.bills)
        }
      } catch (error) {
        console.error("Failed to load bills:", error)
      } finally {
        setLoading(false)
      }
    }
    loadBills()
  }, [session])

  const handleViewBill = async (billId: string) => {
    setLoadingDetails(true)
    setViewDialogOpen(true)
    try {
      const result = await fetchBillDetails(billId)
      if (result.ok && result.bill) {
        setSelectedBill(result.bill)
      }
    } catch (error) {
      console.error("Failed to load bill details:", error)
    } finally {
      setLoadingDetails(false)
    }
  }

  const filteredBills = bills.filter((bill) => {
    if (activeTab === "paid") return bill.status === "paid"
    if (activeTab === "pending") return bill.status === "pending" || bill.status === "overdue"
    return true
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Bills & Receipts</h1>
        <p className="text-muted-foreground">View and download your billing history</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Bills ({bills.length})</TabsTrigger>
          <TabsTrigger value="paid">Paid ({bills.filter((b) => b.status === "paid").length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({bills.filter((b) => b.status !== "paid").length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-4">
          {filteredBills.length > 0 ? (
            filteredBills.map((bill) => (
              <Card key={bill.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-3">
                        <h3 className="font-semibold text-lg">{bill.packageName}</h3>
                        <span
                          className={`text-xs px-3 py-1 rounded-full font-medium ${
                            bill.status === "paid"
                              ? "bg-green-100 text-green-700"
                              : bill.status === "overdue"
                                ? "bg-red-100 text-red-700"
                                : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {bill.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div>
                          <p className="text-xs text-muted-foreground">Bill Date</p>
                          <p className="text-sm font-medium">{bill.date}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Due Date</p>
                          <p className="text-sm font-medium">{bill.dueDate}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Amount</p>
                          <p className="text-lg font-bold text-primary">₹{bill.amount.toLocaleString()}</p>
                        </div>
                        {bill.paidDate && (
                          <div>
                            <p className="text-xs text-muted-foreground">Paid Date</p>
                            <p className="text-sm font-medium">{bill.paidDate}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2 flex-col">
                      <Button variant="outline" size="sm" onClick={() => handleViewBill(bill.id)}>
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
            ))
          ) : (
            <Card className="border-dashed">
              <CardContent className="pt-12 pb-12 text-center">
                <p className="text-muted-foreground">No bills found</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Pending Bill Alert */}
      {bills.some((b) => b.status === "pending" || b.status === "overdue") && (
        <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">Pending Payment</h3>
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mt-1">
                  You have pending bills. Please make the payment to keep your membership active.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Bill Details Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Bill Details</DialogTitle>
          </DialogHeader>
          {loadingDetails ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : selectedBill ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Package</p>
                  <p className="font-medium">{selectedBill.package?.name || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Billing Cycle</p>
                  <p className="font-medium capitalize">{selectedBill.package?.billingCycle || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Amount</p>
                  <p className="font-bold text-primary">₹{selectedBill.amount.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  <span
                    className={`text-xs px-2 py-1 rounded-full ${
                      selectedBill.status === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {selectedBill.status.toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Created</p>
                  <p className="font-medium">{selectedBill.createdAt}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Due Date</p>
                  <p className="font-medium">{selectedBill.dueDate}</p>
                </div>
                {selectedBill.paidDate && (
                  <div>
                    <p className="text-xs text-muted-foreground">Paid Date</p>
                    <p className="font-medium">{selectedBill.paidDate}</p>
                  </div>
                )}
              </div>

              {selectedBill.receipt && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold mb-2">Receipt Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground">Receipt No</p>
                      <p className="font-medium">{selectedBill.receipt.receiptNo}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Payment Method</p>
                      <p className="font-medium capitalize">{selectedBill.receipt.paymentMethod || "N/A"}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="outline" onClick={() => setViewDialogOpen(false)}>
                  <X className="h-4 w-4 mr-2" />
                  Close
                </Button>
                {selectedBill.receipt && (
                  <Button>
                    <Download className="h-4 w-4 mr-2" />
                    Download Receipt
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <p className="text-center py-4 text-muted-foreground">Failed to load bill details</p>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
