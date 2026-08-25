import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

interface OrderItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  status: number;
  totalAmount: number;
  shippingAddress: string;
  createdAt: string;
  failureReason: string | null;
  items: OrderItem[];
}

const STATUS_MAP: Record<number, { label: string; className: string; dot: string }> = {
  0: { label: "Beklemede", className: "bg-gray-500/15 text-gray-300 border-gray-500/30", dot: "bg-gray-400" }, // Pending
  1: { label: "Stok Rezerve Edildi", className: "bg-blue-500/15 text-blue-300 border-blue-500/30", dot: "bg-blue-400" }, // StockReserved
  2: { label: "Ödeme İşleniyor", className: "bg-yellow-500/15 text-yellow-300 border-yellow-500/30", dot: "bg-yellow-400" }, // PaymentProcessing
  3: { label: "Ödeme Tamamlandı", className: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30", dot: "bg-cyan-400" }, // PaymentCompleted
  4: { label: "Onaylandı", className: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30", dot: "bg-emerald-400" }, // Confirmed
  5: { label: "İptal Edildi", className: "bg-red-500/15 text-red-300 border-red-500/30", dot: "bg-red-400" }, // Cancelled
  6: { label: "Başarısız", className: "bg-red-500/15 text-red-300 border-red-500/30", dot: "bg-red-400" }, // Failed
};

function getStatusInfo(status: number) {
  return STATUS_MAP[status] ?? { label: "Bilinmiyor", className: "bg-gray-500/15 text-gray-300 border-gray-500/30", dot: "bg-gray-400" };
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<Order[]>("/orders/api/orders")
      .then((res) => {
        setOrders(res.data);
        if (res.data.length > 0) setExpanded(res.data[0].id);
      })
      .finally(() => setLoading(false));
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-[70vh] bg-gray-900">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-32">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-yellow-500" />
          <p className="mt-4 text-sm text-gray-400">Siparişleriniz yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Empty state
  if (orders.length === 0) {
    return (
      <div className="min-h-[70vh] bg-gray-900">
        <div className="mx-auto flex max-w-4xl flex-col items-center justify-center px-4 py-28 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-800 text-5xl">📦</div>
          <h2 className="mt-6 text-2xl font-bold text-white">Henüz siparişiniz yok</h2>
          <p className="mt-2 max-w-sm text-sm text-gray-400">
            İlk siparişinizi vermek için premium satranç koleksiyonumuzu keşfedin.
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-8 rounded-xl bg-yellow-500 px-8 py-3 font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-95"
          >
            Alışverişe Başla
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[70vh] bg-gray-900">
      <div className="mx-auto max-w-4xl px-4 py-10">
        <h1 className="mb-1 text-2xl font-bold text-white">Siparişlerim</h1>
        <p className="mb-8 text-sm text-gray-400">{orders.length} sipariş</p>

        <div className="space-y-4">
          {orders.map((order) => {
            const status = getStatusInfo(order.status);
            const isOpen = expanded === order.id;
            return (
              <div key={order.id} className="overflow-hidden rounded-2xl border border-white/5 bg-gray-800/60">
                {/* Header */}
                <button
                  onClick={() => setExpanded(isOpen ? null : order.id)}
                  className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-gray-800"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-white">
                        #{order.id.slice(0, 8).toUpperCase()}
                      </span>
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${status.className}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-white">₺{formatPrice(order.totalAmount)}</span>
                    <span className={`text-gray-500 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}>▾</span>
                  </div>
                </button>

                {/* Details */}
                {isOpen && (
                  <div className="border-t border-gray-700/60 px-5 pb-5 pt-4">
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.productId} className="flex items-center justify-between text-sm">
                          <span className="text-gray-300">
                            {item.productName} <span className="text-gray-500">× {item.quantity}</span>
                          </span>
                          <span className="text-gray-200">₺{formatPrice(item.subtotal)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 border-t border-gray-700/60 pt-4">
                      <div className="flex items-start gap-2 text-xs text-gray-400">
                        <span className="mt-0.5">📍</span>
                        <span>{order.shippingAddress}</span>
                      </div>
                      <div className="mt-3 flex justify-between text-sm font-bold text-white">
                        <span>Toplam</span>
                        <span>₺{formatPrice(order.totalAmount)}</span>
                      </div>
                    </div>

                    {order.failureReason && (
                      <div className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                        {order.failureReason}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
