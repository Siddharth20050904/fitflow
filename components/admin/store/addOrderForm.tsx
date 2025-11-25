"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createOrder, StoreOrder, updateOrder } from "@/app/api/store/orders";
import { useSession } from "next-auth/react";
import { fetchMembers } from "@/app/api/member/fetchMembers";
import { getProducts } from "@/app/api/store/products";

type Member = {
  id: string;
  name: string;
};

type Product = {
  id: string;
  name: string;
  price: number;
};

type OrderItem = {
  productId: string;
  quantity: number;
};

export default function AddOrderForm({
  open,
  setOpen,
  editing = false,
  order = null,
  onOrderSaved
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  editing?: boolean;
  order?: StoreOrder | null;
  onOrderSaved: (o: StoreOrder) => void;
}) {
  const [members, setMembers] = useState<Member[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [selectedMember, setSelectedMember] = useState<string>("");
  const [status, setStatus] = useState(order?.status || "pending");
  const [paymentStatus, setPaymentStatus] = useState(order?.paymentStatus || "pending");
  const [items, setItems] = useState<OrderItem[]>(order?.items || []);

  const { data: session } = useSession();
  const [adminId, setAdminId] = useState<string>("");

  useEffect(() => {
    if (session?.user?.id) setAdminId(session.user.id);
  }, [session]);

  useEffect(() => {
    async function loadData() {
      const [m, p] = await Promise.all([
        await fetchMembers(adminId),
        await getProducts()
      ]);

      setMembers(m.members || []);
      setProducts(p.products || []);
    }
    loadData();
  }, [adminId]);

  function setQty(productId: string, qty: number) {
    setItems((prev) => {
      const exists = prev.find((i) => i.productId === productId);
      if (exists) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, quantity: qty } : i
        );
      }
      return [...prev, { productId, quantity: qty }];
    });
  }

  const totalAmount = items.reduce((sum, it) => {
    const p = products.find((x) => x.id === it.productId);
    return sum + (p?.price || 0) * it.quantity;
  }, 0);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!selectedMember) {
      alert("Select a member");
      return;
    }

    const memberObj = members.find((m) => m.id === selectedMember);

    const payload = {
      memberId: selectedMember,
      memberName: memberObj?.name || "",
      status,
      paymentStatus,
      totalAmount,
      items
    };

    let result;
    if (editing && order)
      result = await updateOrder({ orderId: order.id, ...payload });
    else result = await createOrder({ adminId, ...payload });

    if (result.ok && result.order) {
      onOrderSaved(result.order);
      setOpen(false);
    } else {
      console.error(result.message);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={() => setOpen(false)}
    >
      <div
        className="bg-card rounded-xl shadow-xl p-6 w-full max-w-md relative animate-in max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
          onClick={() => setOpen(false)}
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">
          {editing ? "Edit Order" : "Create Order"}
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* MEMBER */}
          <div>
            <label className="text-md font-medium">Select Member</label>
            <select
              className="mt-1 w-full border rounded-md px-3 py-2"
              value={selectedMember}
              onChange={(e) => setSelectedMember(e.target.value)}
            >
              <option value="">Select member</option>
              {members.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* PRODUCTS */}
          <div>
            <label className="text-md font-medium">Products</label>

            <div className="mt-2 space-y-3 max-h-60 overflow-y-auto border rounded-md p-3">
              {products.map((p) => {
                const quantity = items.find((i) => i.productId === p.id)?.quantity || "";
                return (
                  <div
                    key={p.id}
                    className="flex items-center justify-between border rounded-lg p-2 bg-white"
                  >
                    <div>
                      <p className="font-medium">{p.name}</p>
                      <p className="text-xs text-muted-foreground">₹{p.price}</p>
                    </div>

                    <Input
                      type="number"
                      min={0}
                      className="w-20"
                      placeholder="Qty"
                      value={quantity}
                      onChange={(e) => setQty(p.id, Number(e.target.value))}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* STATUS */}
          <div>
            <label className="text-md font-medium">Order Status</label>
            <select
              className="mt-1 w-full border rounded-md px-3 py-2"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          {/* PAYMENT STATUS */}
          <div>
            <label className="text-md font-medium">Payment Status</label>
            <select
              className="mt-1 w-full border rounded-md px-3 py-2"
              value={paymentStatus}
              onChange={(e) => setPaymentStatus(e.target.value)}
            >
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          {/* TOTAL */}
          <div className="text-lg font-semibold pt-1">
            Total Amount: ₹{totalAmount}
          </div>

          <Button className="w-full mt-2">
            {editing ? "Save Changes" : "Create Order"}
          </Button>
        </form>
      </div>
    </div>
  );
}
