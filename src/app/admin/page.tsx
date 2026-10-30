// src/app/admin/page.tsx – Admin dashboard home

import { prisma } from "@/lib/prisma";

export default async function AdminDashboardPage() {
  const [productCount, orderCount, draftCount] = await Promise.all([
    prisma.product.count({ where: { status: "published" } }),
    prisma.order.count(),
    prisma.product.count({ where: { status: "draft" } }),
  ]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-semibold text-stone-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <StatCard label="Published Products" value={productCount} />
        <StatCard label="Draft Products" value={draftCount} />
        <StatCard label="Orders" value={orderCount} />
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        <strong>Demo mode:</strong> This store is in local development. Orders are labelled as test orders. 
        Payment processing is not active. Configure credentials in <code>.env.local</code> before launch.
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-sm">
      <p className="text-sm text-stone-500 mb-1">{label}</p>
      <p className="text-3xl font-bold text-stone-800">{value}</p>
    </div>
  );
}
