"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Search, Plus, Edit2, Trash2 } from "lucide-react";
import { addMember } from "@/app/api/admin/addMember";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import { fetchMembers } from "@/app/api/member/fetchMembers";

type Member = {
  id: string
  name: string
  email: string
  number: string
  status: string
  joinDate: Date
}

export function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [inputName, setInputName] = useState("");
  const [inputNumber, setInputNumber] = useState("");
  const [inputEmail, setInputEmail] = useState("");
  const [inputStatus, setInputStatus] = useState("active");
  const [inputDate, setInputDate] = useState("");

  const {data: session} = useSession();
  const [adminId, setAdminId] = useState<string | null>(null);


  useEffect(() => {
    if (session?.user?.id) {
      setAdminId(session.user.id);
    }
  }, [session]);

  useEffect(() => {
    const fetchData = async () => {
      if (adminId) {
        try {
          const response = await fetchMembers(adminId);
          if (response.ok) {
            setMembers(response.members.map((member) => ({
              id: member.id,
              name: member.name,
              email: member.email,
              number: member.phone,
              status: member.status,
              joinDate: new Date(member.joinDate)
            })));
          } else {
            toast.error(response.message);
          }
        } catch{
          toast.error("Failed to fetch members. Please try again later.");
        }
      }
    };

    fetchData();
  }, [adminId]);


  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async(e : React.FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const res = await addMember(inputName, inputEmail, inputStatus, inputNumber, new Date(inputDate), adminId!);
    if(res.ok){
      const addedMember = res.addedMember;
      setMembers((prevItems)=>[...prevItems, {
        id: addedMember!.id,
        name: addedMember!.name,
        email: addedMember!.email,
        number: addedMember!.phone,
        status: addedMember!.status,
        joinDate: addedMember!.joinDate
      }]);

      toast.success(res.message)
    }else{
      toast.error(res.message)
    }
    setShowForm(false);
  }

  return (
    <div className="space-y-6 relative">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Members</h1>
          <p className="text-muted-foreground">Manage gym members and their information</p>
        </div>
        <Button className="bg-primary text-primary-foreground" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Add Member
        </Button>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 bg-input px-3 py-2 rounded-lg">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="border-0 bg-transparent outline-none"
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Name</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Email</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Phone</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Join Date</th>
                  <th className="text-left py-3 px-4 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => (
                  <tr key={member.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4">{member.name}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{member.email}</td>
                    <td className="py-3 px-4 text-sm">{member.number}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          member.status === "active"
                            ? "bg-green-100 text-green-700"
                            : member.status === "inactive"
                            ? "bg-gray-100 text-gray-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {member.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm">{member.joinDate.getFullYear()}-{member.joinDate.getMonth() + 1}-{member.joinDate.getDate()}</td>
                    <td className="py-3 px-4 flex gap-2">
                      <button className="p-1 hover:bg-muted rounded transition-colors">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="p-1 hover:bg-muted rounded transition-colors text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal Background */}
      {showForm && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={() => setShowForm(false)}
        >
          {/* Form Card */}
          <div
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md relative animate-in text-lg"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button */}
            <button
              className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              onClick={() => setShowForm(false)}
            >
              ✕
            </button>

            <h2 className="text-xl font-semibold mb-4">Add Member</h2>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="text-md font-medium">Name</label>
                <Input className="mt-1 border-black" placeholder="Enter name" value={inputName} onChange={(e)=>setInputName(e.target.value)}/>
              </div>

              <div>
                <label className="text-md font-medium">Email</label>
                <Input className="mt-1 border-black" placeholder="Enter email" value={inputEmail} onChange={(e)=>setInputEmail(e.target.value)}/>
              </div>

              <div>
                <label className="text-md font-medium">Phone Number</label>
                <Input className="mt-1 border-black" type="text" placeholder="Enter phone number" value={inputNumber} onChange={(e)=>setInputNumber(e.target.value)}/>
              </div>

              <div>
                <label className="text-sm font-medium">Status</label>
               <select
                className="mt-1 w-full text-md border rounded-md bg-background px-3 py-2"
                value={inputStatus}
                onChange={(e) => setInputStatus(e.target.value)}
              >
                <option value="" disabled>Select status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>

              </div>

              <div>
                <label className="text-md font-medium">Joining Date</label>
                <Input className="mt-1 border-black" type="date" value={inputDate} onChange={(e)=>setInputDate(e.target.value)}/>
              </div>

              <Button className="w-full mt-2">Submit</Button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
