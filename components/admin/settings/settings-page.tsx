'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { fetchGymInfo } from '@/app/api/settings/fetchGymInfo'
import { postGymInfo } from '@/app/api/settings/postGymInfo'
import toast from 'react-hot-toast'

type GymInfo = {
  name: string;
  email: string;
  phone: string;
  address: string;
}

export function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [form, setForm] = useState<GymInfo>({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadGymInfo() {
      const gym = await fetchGymInfo();
      if (gym) {
        setForm({
          name: gym.name || '',
          email: gym.email || '',
          phone: gym.phone || '',
          address: gym.address || ''
        });
      }
    }
    loadGymInfo();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your gym account and preferences</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gym Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="gym-name">Gym Name</Label>
                <Input id="gym-name" value={form.name} onChange={(e)=>{setForm({...form, name: e.target.value})}}/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gym-email">Gym Email</Label>
                <Input id="gym-email" type="email" value={form.email} onChange={(e)=>{setForm({...form, email: e.target.value})}}/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gym-phone">Phone</Label>
                <Input id="gym-phone" value={form.phone} onChange={(e)=>{setForm({...form, phone: e.target.value})}}/>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gym-address">Address</Label>
                <textarea
                  id="gym-address"
                  value={form.address} onChange={(e)=>{setForm({...form, address: e.target.value})}}
                  className="w-full px-3 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
                  rows={3}
                />
              </div>

              <Button className={`bg-primary text-primary-foreground ${submitting ? 'opacity-50 cursor-not-allowed' : ''}`} disabled={submitting} onClick={async()=>{
                setSubmitting(true);
                if(form.name === '' || form.email === '' || form.phone === '' || form.address === ''){
                  toast.error('Please fill in all fields.');
                  setSubmitting(false);
                  return;
                }
                const result = await postGymInfo(form);
                if(result.ok){
                  toast.success('Gym information saved successfully!');
                } else {
                  toast.error('Failed to save gym information.');
                }

                setForm({...form,
                  name: result.gym.name || '',
                  email: result.gym.email || '',
                  phone: result.gym.phone || '',
                  address: result.gym.address || ''
                });
                setSubmitting(false);
              }}>
                Save Changes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing" className="text-center p-5 space-y-6">
          <h5>To be implemented...</h5>
        </TabsContent>
      </Tabs>
    </div>
  )
}
