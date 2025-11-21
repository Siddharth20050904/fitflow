'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BillingTable } from './billing-table'
import { Plus, Download, Filter } from 'lucide-react'
import toast from 'react-hot-toast'
import { fetchMembers } from '@/app/api/member/fetchMembers'
import { createBill } from '@/app/api/billing/createBill'
import { useSession } from 'next-auth/react'

type Member = {
  id: string
  name: string
  email: string
}

export function BillingPage() {
  const [showForm, setShowForm] = useState(false)
  const [members, setMembers] = useState<Member[]>([])

  const [memberId, setMemberId] = useState('')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [status, setStatus] = useState('pending')
  const [paidDate, setPaidDate] = useState('')

  const { data: session } = useSession()
  const [adminId, setAdminId] = useState<string | null>(null)

  useEffect(() => {
    if (session?.user?.id) setAdminId(session.user.id)
  }, [session])

  // Fetch Members
  useEffect(() => {
    const load = async () => {
      if (!adminId) return
      const res = await fetchMembers(adminId)

      if (res.ok) setMembers(res.members)
      else toast.error(res.message)
    }
    load()
  }, [adminId])

  const handleBillSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    console.log({ memberId, amount, dueDate, status, paidDate })

    if (!memberId || !amount || !dueDate || !status) {
      toast.error("Please fill all required fields")
      return
    }

    const res = await createBill({
      adminId: adminId!,
      memberId,
      amount: Number(amount),
      dueDate: new Date(dueDate),
      status,
      paidDate: status === 'paid' ? new Date(paidDate) : null,
    })

    if (res.ok) {
      toast.success("Bill created successfully")
      setShowForm(false)
      setMemberId('')
      setAmount('')
      setDueDate('')
      setStatus('pending')
      setPaidDate('')
    } else {
      toast.error(res.message)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Billing</h1>
          <p className="text-muted-foreground">Create and manage member bills</p>
        </div>

        <Button className="bg-primary text-primary-foreground" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Bill
        </Button>
      </div>

      {/* Buttons */}
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

      {/* BILL CREATION MODAL */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowForm(false)}
        >
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative animate-in text-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">Create Bill</h2>

            <form className="space-y-4" onSubmit={handleBillSubmit}>
              {/* Member */}
              <div>
                <label className="text-md font-medium">Select Member</label>
                <select
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  value={memberId}
                  onChange={(e) => setMemberId(e.target.value)}
                >
                  <option value="" disabled>Select member</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="text-md font-medium">Amount</label>
                <Input
                  type="number"
                  className="mt-1 border-black"
                  placeholder="Enter amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="text-md font-medium">Due Date</label>
                <Input
                  type="date"
                  className="mt-1 border-black"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              {/* Status */}
              <div>
                <label className="text-md font-medium">Status</label>
                <select
                  className="mt-1 w-full border rounded-md px-3 py-2"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              {/* Paid Date (Only if status = paid) */}
              {status === 'paid' && (
                <div>
                  <label className="text-md font-medium">Paid Date</label>
                  <Input
                    type="date"
                    className="mt-1 border-black"
                    value={paidDate}
                    onChange={(e) => setPaidDate(e.target.value)}
                  />
                </div>
              )}

              <Button className="w-full mt-2">Submit</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
