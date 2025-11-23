"use server"

export const exportReportCSV = async (reportData: {
  title?: string
  billCount?: number
  totalRevenue?: number
  totalPackages?: number
  totalCollected?: number
  pendingAmount?: number
  collectionRate?: number
  bills?: {
    id: string
    memberName?: string
    memberId?: string
    amount: number
    status: string
    packageName: string
    date: string
  }[]
  totalMembers?: number
  activeMembers?: number
  inactiveMembers?: number
  members?: {
    id: string
    name: string
    email: string
    phone: string
    packageName: string
    status: string
    joinDate: string
    billsCount: number
  }[]
  paidBills?: number
  totalBills?: number
  pendingBills?: number
  totalPending?: number
  packages?: {
    name: string
    price: number
    billingCycle: string
    memberCount: number
    members: { name: string; email: string; status: string }[]
  }[]
}) => {
  try {
    let csv = ""

    if (reportData.title) {
      csv += `${reportData.title}\n\n`
    }

    // Financial Summary
    if (reportData.billCount !== undefined) {
      csv += "FINANCIAL SUMMARY\n"
      csv += `Total Revenue,${reportData.totalRevenue}\n`
      csv += `Total Collected,${reportData.totalCollected}\n`
      csv += `Pending Amount,${reportData.pendingAmount}\n`
      csv += `Collection Rate,${reportData.collectionRate}%\n\n`

      csv += "BILL DETAILS\n"
      csv += "Bill ID,Member ID,Amount,Status,Package,Date\n"
      reportData.bills?.forEach(
        (bill: {
          id: string
          memberId?: string
          memberName?: string
          amount: number
          status: string
          packageName: string
          date: string
        }) => {
          csv += `${bill.id},${bill.memberId},${bill.amount},${bill.status},${bill.packageName},"${bill.date}"\n`
        },
      )
    }

    // Member Activity
    if (reportData.totalMembers !== undefined && reportData.members) {
      csv += "MEMBER ACTIVITY\n"
      csv += `Total Members,${reportData.totalMembers}\n`
      csv += `Active Members,${reportData.activeMembers}\n`
      csv += `Inactive Members,${reportData.inactiveMembers}\n\n`

      csv += "MEMBER DETAILS\n"
      csv += "ID,Name,Email,Phone,Package,Status,Join Date,Bills Count\n"
      reportData.members.forEach(
        (member: {
          id: string
          name: string
          email: string
          phone: string
          packageName: string
          status: string
          joinDate: string
          billsCount: number
        }) => {
          csv += `${member.id},"${member.name}",${member.email},${member.phone},${member.packageName},${member.status},"${member.joinDate}",${member.billsCount}\n`
        },
      )
    }

    // Payment Collection
    if (reportData.paidBills !== undefined) {
      csv += "PAYMENT COLLECTION\n"
      csv += `Total Bills,${reportData.totalBills}\n`
      csv += `Paid Bills,${reportData.paidBills}\n`
      csv += `Pending Bills,${reportData.pendingBills}\n`
      csv += `Total Collected,${reportData.totalCollected}\n`
      csv += `Total Pending,${reportData.totalPending}\n`
      csv += `Collection Rate,${reportData.collectionRate}%\n\n`

      csv += "PAYMENT DETAILS\n"
      csv += "Bill ID,Member Name,Amount,Status,Package,Date\n"
      reportData.bills?.forEach(
        (bill: {
          id: string
          memberName?: string
          amount: number
          status: string
          packageName: string
          date: string
        }) => {
          csv += `${bill.id},"${bill.memberName}",${bill.amount},${bill.status},${bill.packageName},"${bill.date}"\n`
        },
      )
    }

    // Membership Analysis
    if (reportData.packages) {
      csv += "MEMBERSHIP ANALYSIS\n"
      csv += `Total Packages,${reportData.totalPackages}\n`
      csv += `Total Members,${reportData.totalMembers}\n\n`

      csv += "PACKAGE DETAILS\n"
      csv += "Package Name,Price,Billing Cycle,Member Count\n"
      reportData.packages.forEach(
        (pkg: {
          name: string
          price: number
          billingCycle: string
          memberCount: number
          members: { name: string; email: string; status: string }[]
        }) => {
          csv += `"${pkg.name}",${pkg.price},${pkg.billingCycle},${pkg.memberCount}\n`
        },
      )

      csv += "\nMEMBER DETAILS BY PACKAGE\n"
      reportData.packages.forEach(
        (pkg: {
          name: string
          price: number
          billingCycle: string
          memberCount: number
          members: { name: string; email: string; status: string }[]
        }) => {
          csv += `\n${pkg.name}\n`
          csv += "Member Name,Email,Status\n"
          pkg.members.forEach((member: { name: string; email: string; status: string }) => {
            csv += `"${member.name}",${member.email},${member.status}\n`
          })
        },
      )
    }

    return { success: true, data: csv, filename: `report_${Date.now()}.csv` }
  } catch (error) {
    console.error("Error exporting CSV:", error)
    return { success: false, data: null, message: "Error exporting CSV" }
  }
}
