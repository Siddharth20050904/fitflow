"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Download, Loader2 } from "lucide-react"
import { generateCustomReport } from "@/app/api/reports/generateCustomReport"
import { exportReportCSV } from "@/app/api/reports/exportReportCSV"
import { exportReportExcel } from "@/app/api/reports/exportReportExcel"

interface CustomReportSectionProps {
  adminId: string
}

export type ReportExportData = Partial<{
  title: string
  billCount: number
  totalRevenue: number
  totalPackages: number
  totalCollected: number
  pendingAmount: number
  collectionRate: number
  totalMembers: number
  activeMembers: number
  inactiveMembers: number

  bills: {
    id: string
    memberId?: string
    memberName?: string
    amount: number
    status: string
    packageName: string
    date: string
  }[]

  members: {
    id: string
    name: string
    email: string
    phone: string
    packageName: string
    status: string
    joinDate: string
    billsCount: number
  }[]

  packages: {
    name: string
    price: number
    billingCycle: string
    memberCount: number
    members: {
      name: string
      email: string
      status: string
    }[]
  }[]
}>



export function CustomReportSection({ adminId }: CustomReportSectionProps) {
  const [reportType, setReportType] = useState("financial")
  const [dateRange, setDateRange] = useState("last30days")
  const [format, setFormat] = useState("pdf")
  const [loading, setLoading] = useState(false)

  const handleGenerateReport = async () => {
    try {
      setLoading(true)

      // Generate report data
      const reportResponse = await generateCustomReport(adminId, {
        reportType,
        dateRange,
      })

      if (!reportResponse.success || !reportResponse.data) {
        alert("Error generating report")
        return
      }

      const reportData = reportResponse.data
      console.log("Generated Report Data:", reportData)

      // Export in selected format
      let exportResponse = null

      switch (format) {
        case "csv":
          exportResponse = await exportReportCSV(reportData)
          break
        default:
          exportResponse = await exportReportExcel(reportData)
          break
      }

      if (exportResponse.success && exportResponse.data) {
        // Create blob and download
        const blob = new Blob([exportResponse.data], {
          type: format === "csv" ? "text/csv" : format === "excel" ? "application/vnd.ms-excel" : "text/plain",
        })

        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = exportResponse.filename
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)

        alert("Report downloaded successfully!")
      } else {
        alert("Error exporting report")
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error generating report")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Generate Custom Report</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="report-type">Report Type</Label>
            <select
              id="report-type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="financial">Financial Summary</option>
              <option value="member">Member Activity</option>
              <option value="payment">Payment Collection</option>
              <option value="membership">Membership Analysis</option>
            </select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date-range">Date Range</Label>
            <select
              id="date-range"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="last30days">Last 30 Days</option>
              <option value="lastquarter">Last Quarter</option>
              <option value="last6months">Last 6 Months</option>
              <option value="thisyear">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="format">Export Format</Label>
            <select
              id="format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="excel">Excel</option>
              <option value="csv">CSV</option>
            </select>
          </div>
        </div>

        <Button onClick={handleGenerateReport} disabled={loading} className="bg-primary text-primary-foreground w-full">
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Generate & Download
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}
