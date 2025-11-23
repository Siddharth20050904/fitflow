"use server"

export type ReportExportData = {
  title?: string

  // Financial Summary
  billCount?: number
  totalRevenue?: number
  totalCollected?: number
  pendingAmount?: number
  collectionRate?: number
  bills?: {
    id: string
    memberId: string
    amount: number
    status: string
    packageName: string
    date: string
    memberName?: string // Payment report also sends memberName
  }[]

  // Member Activity
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

  // Payment Collection
  paidBills?: number
  totalBills?: number
  pendingBills?: number
  totalPending?: number

  // Membership Analysis
  totalPackages?: number
  packages?: {
    id?: string
    name: string
    price: number
    billingCycle: string
    memberCount: number
    bills: {
      name: string
      email: string
      status: string
    }[]
  }[]
}


export const exportReportExcel = async (
    reportData: ReportExportData) => {
  try {
    // This creates a simple Excel-like format (TSV that can be opened in Excel)
    let excel = ""

    if (reportData.title) {
      excel += `${reportData.title}\n\n`
    }

    // Financial Summary
    if (reportData.billCount !== undefined) {
      excel += "FINANCIAL SUMMARY\n"
      excel += `Total Revenue\t${reportData.totalRevenue}\n`
      excel += `Total Collected\t${reportData.totalCollected}\n`
      excel += `Pending Amount\t${reportData.pendingAmount}\n`
      excel += `Collection Rate\t${reportData.collectionRate}%\n\n`

      excel += "BILL DETAILS\n"
      excel += "Bill ID\tMember ID\tAmount\tStatus\tPackage\tDate\n"
      reportData.bills?.forEach((bill: {id: string, memberId: string, amount: number, status: string, packageName: string, date: string}) => {
        excel += `${bill.id}\t${bill.memberId}\t${bill.amount}\t${bill.status}\t${bill.packageName}\t${bill.date}\n`
      })
    }

    // Member Activity
    if (reportData.totalMembers !== undefined && reportData.members) {
      excel += "MEMBER ACTIVITY\n"
      excel += `Total Members\t${reportData.totalMembers}\n`
      excel += `Active Members\t${reportData.activeMembers}\n`
      excel += `Inactive Members\t${reportData.inactiveMembers}\n\n`

      excel += "MEMBER DETAILS\n"
      excel += "ID\tName\tEmail\tPhone\tPackage\tStatus\tJoin Date\tBills Count\n"
      reportData.members.forEach((member: {id: string, name: string, email: string, phone: string, packageName: string, status: string, joinDate: string, billsCount: number}) => {
        excel += `${member.id}\t${member.name}\t${member.email}\t${member.phone}\t${member.packageName}\t${member.status}\t${member.joinDate}\t${member.billsCount}\n`
      })
    }

    // Payment Collection
    if (reportData.paidBills !== undefined) {
      excel += "PAYMENT COLLECTION\n"
      excel += `Total Bills\t${reportData.totalBills}\n`
      excel += `Paid Bills\t${reportData.paidBills}\n`
      excel += `Pending Bills\t${reportData.pendingBills}\n`
      excel += `Total Collected\t${reportData.totalCollected}\n`
      excel += `Total Pending\t${reportData.totalPending}\n`
      excel += `Collection Rate\t${reportData.collectionRate}%\n\n`

      excel += "PAYMENT DETAILS\n"
      excel += "Bill ID\tMember Name\tAmount\tStatus\tPackage\tDate\n"
      reportData.bills?.forEach((bill: {id: string, memberName?: string, amount: number, status: string, packageName: string, date: string}) => {
        excel += `${bill.id}\t${bill.memberName}\t${bill.amount}\t${bill.status}\t${bill.packageName}\t${bill.date}\n`
      })
    }

    // Membership Analysis
    if (reportData.packages) {
      excel += "MEMBERSHIP ANALYSIS\n"
      excel += `Total Packages\t${reportData.totalPackages}\n`
      excel += `Total Members\t${reportData.totalMembers}\n\n`

      excel += "PACKAGE DETAILS\n"
      excel += "Package Name\tPrice\tBilling Cycle\tMember Count\n"
      reportData.packages.forEach((pkg: {id?: string, name: string, price: number, billingCycle: string, memberCount: number, bills: {name: string, email: string, status: string}[]}) => {
        excel += `${pkg.name}\t${pkg.price}\t${pkg.billingCycle}\t${pkg.memberCount}\n`
      })

      excel += "\nMEMBER DETAILS BY PACKAGE\n"
      reportData.packages.forEach((pkg: {id?: string, name: string, price: number, billingCycle: string, memberCount: number, bills: {name: string, email: string, status: string}[]}) => {
        excel += `\n${pkg.name}\n`
        excel += "Member Name\tEmail\tStatus\n"
        pkg.bills.forEach((member: {name: string, email: string, status: string}) => {
          excel += `${member.name}\t${member.email}\t${member.status}\n`
        })
      })
    }

    return { success: true, data: excel, filename: `report_${Date.now()}.xlsx` }
  } catch (error) {
    console.error("Error exporting Excel:", error)
    return { success: false, data: null, message: "Error exporting Excel" }
  }
}
