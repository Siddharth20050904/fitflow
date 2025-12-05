'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CreditCard, FileText, Calendar, AlertCircle } from 'lucide-react'
import { fetchMemberDashboard } from '@/app/api/member/fetchDashboard';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type Data = {
    memberStatus: string;
    memberName: string;
    joinDate: string;
    currentPackage: {
        name: string;
        price: number;
        billingCycle: string;
    } | null;
    nextBillDue: {
        date: string;
        amount: number;
    } | null;
    outstandingBalance: number;
    recentBills: {
        id: string;
        date: string;
        amount: number;
        status: string;
        packageName: string | undefined;
    }[];
}

export function MemberDashboard() {
  const [dashboardData, setDashboardData] = useState<Data | null>(null);
  const {data: session} = useSession(); 
  const [memberId, setMemberId] = useState<string | null>(null);
  const [fetching, setFetching] = useState<boolean>(false);

  useEffect(() => {
    if (session?.user?.id) {
      setMemberId(session.user.id);
    }
  }, [session?.user?.id]);
  useEffect(() => {
    async function loadDashboard() {
      if(!memberId) return;
      setFetching(true);
      const response = await fetchMemberDashboard(memberId);
      if (response.ok) {
        setDashboardData(response.dashboard ?? null);
      }
      setFetching(false);
    }
    loadDashboard();
  }, [memberId]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Welcome back!</h1>
        <p className="text-muted-foreground">Here&apos;s your membership overview</p>
      </div>

      {/* Member Status Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Membership Status</CardTitle>
            <CreditCard className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{fetching ? 'Loading...' : dashboardData?.memberStatus}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Package</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fetching ? 'Loading...' : dashboardData?.currentPackage?.name}</div>
            <p className="text-xs text-muted-foreground">{fetching ? 'Loading...' : `₹${dashboardData?.currentPackage?.price}/${dashboardData?.currentPackage?.billingCycle}`}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Bill Due</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fetching ? 'Loading...' : dashboardData?.nextBillDue?.date}</div>
            <p className="text-xs text-muted-foreground">{fetching ? 'Loading...' : `₹${dashboardData?.nextBillDue?.amount}`}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
            <AlertCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fetching ? 'Loading...' : `₹${dashboardData?.outstandingBalance}`}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bills */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Bills</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {fetching ? 'Loading...' : dashboardData?.recentBills.map((bill) => (
              <div key={bill.id} className="flex items-center justify-between">
                <div>
                  <p className="font-medium">{bill.packageName}</p>
                  <p className="text-sm text-muted-foreground">{bill.date}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">₹{bill.amount}</p>
                  <p className={`text-sm ${bill.status === 'paid' ? 'text-green-500' : bill.status === 'pending' ? 'text-yellow-500' : 'text-red-500'}`}>
                    {bill.status.charAt(0).toUpperCase() + bill.status.slice(1)}
                  </p>
                </div>
              </div>
            ))} 
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
