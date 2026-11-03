// src/app/admin/(dashboard)/orders/page.tsx – Orders management dashboard
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import OrdersListClient, { OrderData } from "@/components/admin/orders/OrdersListClient";

export const metadata = {
  title: "Orders – MAHIRAANI Admin",
  robots: { index: false, follow: false },
};

export const instant = false;

export default async function AdminOrdersPage() {
  await connection();

  const orders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      items: true,
      events: { orderBy: { createdAt: "desc" } },
    },
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-stone-800">Orders</h1>
          <p className="text-xs text-stone-500 mt-1">
            Track web customer orders, shipping labels, payments, and dispatch status
          </p>
        </div>
      </div>

      <OrdersListClient initialOrders={orders as unknown as OrderData[]} />
    </div>
  );
}

