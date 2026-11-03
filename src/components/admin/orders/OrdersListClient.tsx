"use client";

import { useState } from "react";
import { formatINR } from "@/lib/money";
import {
  Package,
  Search,
  ChevronRight,
  X,
  CheckCircle2,
  Clock,
  AlertCircle,
  MessageCircle,
  Star,
  Copy,
  Check,
} from "lucide-react";

export type OrderItemData = {
  id: string;
  productId: string;
  snapshotName: string;
  snapshotVariantName: string | null;
  snapshotSku: string | null;
  snapshotUnitPaise: number;
  quantity: number;
};

export type OrderEventData = {
  id: string;
  type: string;
  note: string | null;
  createdAt: string | Date;
};

export type OrderData = {
  id: string;
  reference: string;
  accessToken: string;
  isTest: boolean;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  pincode: string;
  country: string;
  subtotalPaise: number;
  shippingPaise: number;
  discountPaise: number;
  taxPaise: number;
  totalPaise: number;
  paymentStatus: string;
  fulfilmentStatus: string;
  cancelReason: string | null;
  paymentProvider: string | null;
  paymentOrderId: string | null;
  paymentId: string | null;
  courierName: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  items: OrderItemData[];
  events?: OrderEventData[];
};

export default function OrdersListClient({
  initialOrders = [],
}: {
  initialOrders: OrderData[];
}) {
  const [orders, setOrders] = useState<OrderData[]>(initialOrders);
  const [activeTab, setActiveTab] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateMsg, setUpdateMsg] = useState("");
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);

  const handleCopyLink = async (url: string, itemId: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedItemId(itemId);
      setTimeout(() => setCopiedItemId(null), 2500);
    } catch {
      // fallback
    }
  };

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    if (activeTab === "unfulfilled" && o.fulfilmentStatus !== "unfulfilled") return false;
    if (activeTab === "shipped" && o.fulfilmentStatus !== "shipped") return false;
    if (activeTab === "delivered" && o.fulfilmentStatus !== "delivered") return false;
    if (activeTab === "cancelled" && o.fulfilmentStatus !== "cancelled") return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = o.reference.toLowerCase().includes(q);
      const matchName = o.customerName.toLowerCase().includes(q);
      const matchEmail = o.customerEmail.toLowerCase().includes(q);
      const matchPhone = o.customerPhone.includes(q);
      return matchRef || matchName || matchEmail || matchPhone;
    }
    return true;
  });

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid")
    .reduce((sum, o) => sum + o.totalPaise, 0);
  const unfulfilledCount = orders.filter((o) => o.fulfilmentStatus === "unfulfilled").length;

  async function handleStatusUpdate(newStatus: string) {
    if (!selectedOrder) return;
    setIsUpdating(true);
    setUpdateMsg("");

    try {
      const res = await fetch(`/api/admin/orders/${selectedOrder.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fulfilmentStatus: newStatus,
          note: `Fulfilment status changed to ${newStatus}`,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setOrders((prev) => prev.map((o) => (o.id === data.order.id ? data.order : o)));
        setSelectedOrder(data.order);
        setUpdateMsg("Status updated successfully.");
      }
    } catch {
      setUpdateMsg("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  }

  function getStatusBadge(status: string) {
    switch (status) {
      case "delivered":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">Delivered</span>;
      case "shipped":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">Shipped</span>;
      case "packed":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">Packed</span>;
      case "cancelled":
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">Cancelled</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-stone-700 border border-stone-200">Unfulfilled</span>;
    }
  }

  function getPaymentBadge(status: string) {
    switch (status) {
      case "paid":
        return <span className="text-emerald-700 font-medium text-xs flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Paid</span>;
      case "failed":
        return <span className="text-red-700 font-medium text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> Failed</span>;
      case "refunded":
        return <span className="text-purple-700 font-medium text-xs">Refunded</span>;
      default:
        return <span className="text-amber-700 font-medium text-xs flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Pending</span>;
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-1">Total Web Orders</p>
          <p className="text-2xl font-bold text-stone-800">{orders.length}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-1">Pending Fulfilment</p>
          <p className="text-2xl font-bold text-amber-600">{unfulfilledCount}</p>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-5 shadow-xs">
          <p className="text-xs uppercase tracking-wider text-stone-500 font-medium mb-1">Total Online Revenue</p>
          <p className="text-2xl font-bold text-[#6B2737]">{formatINR(totalRevenue)}</p>
        </div>
      </div>

      {/* Search & Tabs Controls */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
            {[
              { id: "all", label: "All Orders" },
              { id: "unfulfilled", label: "Unfulfilled" },
              { id: "shipped", label: "Shipped" },
              { id: "delivered", label: "Delivered" },
              { id: "cancelled", label: "Cancelled" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? "bg-stone-900 text-white"
                    : "text-stone-600 hover:bg-stone-100"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search reference, name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-stone-200 rounded-lg focus:outline-hidden focus:border-stone-400"
            />
          </div>
        </div>
      </div>

      {/* Orders List Table or Empty State */}
      {filteredOrders.length === 0 ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-xs">
          <div className="w-14 h-14 rounded-full bg-stone-100 text-stone-500 mx-auto flex items-center justify-center mb-4">
            <Package className="w-7 h-7" />
          </div>
          <h3 className="font-serif text-2xl text-stone-900 mb-2">No Web Orders Recorded Yet</h3>
          <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-6 font-light">
            Orders placed through the online web checkout will automatically appear here in real-time with customer address, payment verification, line items, and courier tracking controls.
          </p>

          <div className="p-4 bg-[#FAF8F4] border border-[#E8DCC8] rounded-xl text-left text-xs text-stone-700 space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#6B2737]">
              <MessageCircle className="w-4 h-4 text-[#25D366]" />
              <span>WhatsApp Concierge Orders</span>
            </div>
            <p className="text-[11px] text-stone-600 leading-normal">
              Orders currently placed directly by customers via WhatsApp are confirmed and managed inside your WhatsApp Business chats. Once online payment gateway checkout (Razorpay / UPI) is connected, web orders will populate this dashboard.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px] border-b border-stone-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Order Ref</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Customer</th>
                  <th className="py-3 px-4">Items</th>
                  <th className="py-3 px-4">Total</th>
                  <th className="py-3 px-4">Payment</th>
                  <th className="py-3 px-4">Fulfilment</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-stone-900">
                      {order.reference}
                      {order.isTest && (
                        <span className="ml-1.5 px-1.5 py-0.5 text-[9px] bg-amber-100 text-amber-800 rounded font-sans">
                          Test
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-stone-500 whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-medium text-stone-900">{order.customerName}</p>
                      <p className="text-[11px] text-stone-400">{order.city}, {order.state}</p>
                    </td>
                    <td className="py-3 px-4">{order.items.length} item(s)</td>
                    <td className="py-3 px-4 font-semibold text-stone-900">
                      {formatINR(order.totalPaise)}
                    </td>
                    <td className="py-3 px-4">{getPaymentBadge(order.paymentStatus)}</td>
                    <td className="py-3 px-4">{getStatusBadge(order.fulfilmentStatus)}</td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        className="inline-flex items-center gap-1 text-stone-700 hover:text-stone-950 font-medium bg-stone-100 hover:bg-stone-200 px-2.5 py-1 rounded-md transition-colors"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details Drawer / Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div
            className="fixed inset-0 bg-stone-900/50 backdrop-blur-xs transition-opacity"
            onClick={() => setSelectedOrder(null)}
          />

          <div className="relative w-full max-w-lg bg-white shadow-2xl flex flex-col z-10 overflow-y-auto">
            {/* Header */}
            <div className="p-5 border-b border-stone-200 flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <span className="font-mono text-sm font-bold text-stone-900">
                  {selectedOrder.reference}
                </span>
                <p className="text-xs text-stone-500">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString("en-IN")}
                </p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 text-stone-400 hover:text-stone-700 rounded-lg hover:bg-stone-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6 flex-1 text-xs text-stone-700">
              {updateMsg && (
                <div className="p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200">
                  {updateMsg}
                </div>
              )}

              {/* Status Update Control */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
                <label className="block text-[11px] uppercase tracking-wider font-semibold text-stone-600">
                  Update Fulfilment Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {["unfulfilled", "packed", "shipped", "delivered", "cancelled"].map((st) => (
                    <button
                      key={st}
                      disabled={isUpdating}
                      onClick={() => handleStatusUpdate(st)}
                      className={`px-3 py-1.5 rounded-lg text-xs capitalize font-medium transition-colors ${
                        selectedOrder.fulfilmentStatus === st
                          ? "bg-stone-900 text-white"
                          : "bg-white text-stone-700 border border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customer Contact */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                  Customer & Shipping Address
                </h4>
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200/80 leading-relaxed">
                  <p className="font-semibold text-stone-900">{selectedOrder.customerName}</p>
                  <p>{selectedOrder.customerEmail} • {selectedOrder.customerPhone}</p>
                  <p className="text-stone-600 mt-1">
                    {selectedOrder.addressLine1}
                    {selectedOrder.addressLine2 ? `, ${selectedOrder.addressLine2}` : ""},<br />
                    {selectedOrder.city}, {selectedOrder.state} – {selectedOrder.pincode}, {selectedOrder.country}
                  </p>
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <h4 className="text-[11px] uppercase tracking-wider font-semibold text-stone-500">
                  Items Purchased ({selectedOrder.items.length})
                </h4>
                <div className="border border-stone-200 rounded-xl divide-y divide-stone-100 overflow-hidden">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-3 flex items-center justify-between">
                      <div>
                        <p className="font-medium text-stone-900">{item.snapshotName}</p>
                        {item.snapshotVariantName && (
                          <p className="text-[11px] text-stone-500">Variant: {item.snapshotVariantName}</p>
                        )}
                        <p className="text-[11px] text-stone-400">Qty: {item.quantity} × {formatINR(item.snapshotUnitPaise)}</p>
                      </div>
                      <span className="font-semibold text-stone-900">
                        {formatINR(item.snapshotUnitPaise * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review Invitations (Delivered Orders Only) */}
              {selectedOrder.fulfilmentStatus === "delivered" && (
                <div className="p-4 bg-[#FBF7EE] border border-[#EADBBD] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-[#B8922A] fill-[#B8922A]" />
                      <span className="font-semibold text-stone-900 text-xs">Customer Review Invitations</span>
                    </div>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-medium">
                      Delivered
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 leading-relaxed">
                    Generate secure, one-click review links for this delivered purchase. Links pre-authenticate the patron and permit verified review submission for that specific piece.
                  </p>

                  <div className="space-y-2 pt-1">
                    {selectedOrder.items.map((item) => {
                      const origin = typeof window !== "undefined" ? window.location.origin : "";
                      const reviewUrl = `${origin}/reviews/write?order=${selectedOrder.id}&token=${selectedOrder.accessToken}&product=${item.productId}`;
                      const waText = encodeURIComponent(
                        `Namaste ${selectedOrder.customerName}, your MAHIRAANI order (${selectedOrder.reference}) has been delivered! We would cherish your review of the ${item.snapshotName}:\n\n${reviewUrl}`
                      );
                      const cleanPhone = selectedOrder.customerPhone.replace(/[^0-9]/g, "");
                      const waPhone = cleanPhone.startsWith("91") ? cleanPhone : `91${cleanPhone}`;
                      const waLink = `https://wa.me/${waPhone}?text=${waText}`;

                      return (
                        <div
                          key={item.id}
                          className="p-3 bg-white border border-stone-200 rounded-lg flex flex-col gap-2"
                        >
                          <div className="flex items-center justify-between">
                            <p className="font-medium text-stone-900 text-xs">{item.snapshotName}</p>
                            <span className="text-[10px] text-stone-400">One-click token authenticated</span>
                          </div>
                          <p className="text-[10px] text-stone-400 font-mono truncate select-all bg-stone-50 p-1.5 rounded border border-stone-100">
                            {reviewUrl}
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleCopyLink(reviewUrl, item.id)}
                              className="flex-1 py-1.5 px-2.5 text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-md transition-colors flex items-center justify-center gap-1.5"
                            >
                              {copiedItemId === item.id ? (
                                <>
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                  <span className="text-emerald-700 font-semibold">Copied to Clipboard</span>
                                </>
                              ) : (
                                <>
                                  <Copy className="w-3.5 h-3.5" />
                                  <span>Copy Review Link</span>
                                </>
                              )}
                            </button>
                            <a
                              href={waLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="py-1.5 px-3 text-[11px] font-medium bg-[#25D366] hover:bg-[#1fae53] text-white rounded-md transition-colors flex items-center gap-1.5"
                            >
                              <MessageCircle className="w-3.5 h-3.5 fill-current" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Order Financials Breakdown */}
              <div className="space-y-1.5 border-t border-stone-200 pt-4">
                <div className="flex justify-between text-stone-500">
                  <span>Subtotal</span>
                  <span>{formatINR(selectedOrder.subtotalPaise)}</span>
                </div>
                <div className="flex justify-between text-stone-500">
                  <span>Shipping</span>
                  <span>{selectedOrder.shippingPaise === 0 ? "FREE" : formatINR(selectedOrder.shippingPaise)}</span>
                </div>
                <div className="flex justify-between font-bold text-stone-900 text-sm pt-2 border-t border-stone-100">
                  <span>Total Paid</span>
                  <span className="text-[#6B2737]">{formatINR(selectedOrder.totalPaise)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
