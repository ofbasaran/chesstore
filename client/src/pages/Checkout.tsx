import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[70vh] bg-gray-900">
      <div className="mx-auto max-w-5xl px-4 py-10">{children}</div>
    </div>
  );
}

interface CartItem {
  productId: string;
  productName: string;
  unitPrice: number;
  quantity: number;
}

interface CartResponse {
  items: CartItem[];
  totalPrice: number;
}

interface OrderResponse {
  id: string;
}

type Step = "form" | "processing" | "success" | "failed" | "pending_confirmation";

const formatPrice = (value: number) =>
  new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

function StepIndicator({ active }: { active: 1 | 2 | 3 }) {
  const steps = [
    { n: 1, label: "Teslimat" },
    { n: 2, label: "İşleniyor" },
    { n: 3, label: "Onay" },
  ];
  return (
    <div className="mx-auto mb-10 flex max-w-md items-center">
      {steps.map((s, i) => {
        const isActive = active >= s.n;
        return (
          <div key={s.n} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold transition-colors ${
                  isActive ? "bg-yellow-500 text-gray-900" : "bg-gray-700 text-gray-400"
                }`}
              >
                {s.n}
              </div>
              <span
                className={`mt-2 text-xs font-medium transition-colors ${
                  isActive ? "text-yellow-400" : "text-gray-500"
                }`}
              >
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`mx-2 h-0.5 flex-1 rounded transition-colors ${active > s.n ? "bg-yellow-500" : "bg-gray-700"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function Checkout() {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartResponse | null>(null);
  const [shippingAddress, setShippingAddress] = useState("");
  const [step, setStep] = useState<Step>("form");
  const [orderId, setOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<CartResponse>("/cart/api/cart").then((res) => setCart(res.data));
  }, []);

  // ---- Saga polling logic (KORUNDU / preserved as-is) ----
  const pollPaymentStatus = async (id: string, attempts = 0) => {
    if (attempts > 15) {
      setStep("pending_confirmation");
      return;
    }
    try {
      const res = await api.get(`/payments/api/payments/order/${id}`);
      const status = res.data.status;
      if (status === 1) {
        try {
          await api.delete("/cart/api/cart");
        } catch {
          console.error("Sepet temizlenemedi.");
        }
        setStep("success");
        return;
      }
      if (status === 2) {
        setStep("failed");
        setError(res.data.failureReason || "Ödeme başarısız oldu.");
        return;
      }
      setTimeout(() => pollPaymentStatus(id, attempts + 1), 2000);
    } catch {
      setTimeout(() => pollPaymentStatus(id, attempts + 1), 2000);
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!shippingAddress.trim()) {
      setError("Lütfen teslimat adresi girin.");
      return;
    }
    setError(null);
    setStep("processing");
    try {
      const res = await api.post<OrderResponse>("/orders/api/orders/checkout", {
        shippingAddress,
      });
      setOrderId(res.data.id);
      pollPaymentStatus(res.data.id);
    } catch (err: any) {
      setStep("failed");
      setError(err?.response?.data?.message || "Sipariş oluşturulamadı.");
    }
  };
  // ---- end preserved logic ----

  if (!cart) {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-28">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-gray-700 border-t-yellow-500" />
          <p className="mt-4 text-sm text-gray-400">Yükleniyor...</p>
        </div>
      </Shell>
    );
  }

  if (cart.items.length === 0 && step === "form") {
    return (
      <Shell>
        <div className="flex flex-col items-center justify-center py-28 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-800 text-5xl">🛒</div>
          <h2 className="mt-6 text-2xl font-bold text-white">Sepetiniz boş</h2>
          <button
            onClick={() => navigate("/")}
            className="mt-8 rounded-xl bg-yellow-500 px-8 py-3 font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-95"
          >
            Alışverişe Devam Et
          </button>
        </div>
      </Shell>
    );
  }

  // ---- Status screens ----
  if (step === "processing") {
    return (
      <Shell>
        <StepIndicator active={2} />
        <div className="mx-auto flex max-w-md flex-col items-center justify-center py-20 text-center">
          <div className="relative flex h-20 w-20 items-center justify-center">
            <div className="h-20 w-20 animate-spin rounded-full border-4 border-gray-700 border-t-yellow-500" />
            <span className="absolute text-2xl">♟</span>
          </div>
          <h2 className="mt-8 text-xl font-bold text-white">Siparişiniz işleniyor</h2>
          <p className="mt-2 text-sm text-gray-400">Ödemeniz alınıyor, lütfen sayfayı kapatmayın...</p>
        </div>
      </Shell>
    );
  }

  if (step === "success" && orderId) {
    return (
      <Shell>
        <StepIndicator active={3} />
        <div className="mx-auto flex max-w-md flex-col items-center justify-center py-16 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/15 ring-4 ring-emerald-500/20">
            <svg className="h-12 w-12 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="mt-8 text-2xl font-bold text-white">Siparişiniz onaylandı!</h2>
          <p className="mt-2 text-sm text-gray-400">Sipariş No: <span className="font-mono text-gray-300">#{orderId.slice(0, 8).toUpperCase()}</span></p>
          <div className="mt-8 flex gap-3">
            <button
              onClick={() => navigate("/orders")}
              className="rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-95"
            >
              Siparişlerime Git
            </button>
            <button
              onClick={() => navigate("/")}
              className="rounded-xl border border-gray-700 px-6 py-3 font-medium text-gray-300 transition-colors hover:border-gray-500 hover:text-white"
            >
              Alışverişe Devam Et
            </button>
          </div>
        </div>
      </Shell>
    );
  }

  if (step === "pending_confirmation") {
    return (
      <Shell>
        <div className="mx-auto flex max-w-md flex-col items-center justify-center py-24 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-amber-500/15 ring-4 ring-amber-500/20">
            <svg className="h-12 w-12 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <circle cx="12" cy="12" r="9" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 7v5l3 2" />
            </svg>
          </div>
          <h2 className="mt-8 text-2xl font-bold text-white">Siparişiniz alındı</h2>
          <p className="mt-2 max-w-sm text-sm text-gray-400">
            Ödemeniz işleniyor. Bu işlem biraz zaman alabilir — durumu Siparişlerim sayfasından takip edebilirsiniz.
          </p>
          <button
            onClick={() => navigate("/orders")}
            className="mt-8 rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-95"
          >
            Siparişlerim
          </button>
        </div>
      </Shell>
    );
  }

  if (step === "failed") {
    return (
      <Shell>
        <div className="mx-auto flex max-w-md flex-col items-center justify-center py-24 text-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-red-500/15 ring-4 ring-red-500/20">
            <svg className="h-12 w-12 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-8 text-2xl font-bold text-white">Bir hata oluştu</h2>
          <p className="mt-2 max-w-sm text-sm text-gray-400">{error}</p>
          <button
            onClick={() => setStep("form")}
            className="mt-8 rounded-xl bg-yellow-500 px-6 py-3 font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-95"
          >
            Tekrar Dene
          </button>
        </div>
      </Shell>
    );
  }

  // ---- Form step ----
  return (
    <Shell>
      <h1 className="mb-8 text-2xl font-bold text-white">Ödeme</h1>
      <StepIndicator active={1} />
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* Address form */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl border border-white/5 bg-gray-800/60 p-6">
            <h2 className="mb-5 text-lg font-bold text-white">Teslimat Bilgileri</h2>
            <form onSubmit={handleCheckout} className="space-y-5">
              <div>
                <label className="mb-2 block text-xs font-medium uppercase tracking-widest text-gray-400">
                  Teslimat Adresi
                </label>
                <textarea
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  rows={5}
                  placeholder="Ad Soyad, açık adres, şehir, posta kodu..."
                  className="w-full rounded-xl border border-gray-700 bg-gray-900 p-4 text-sm text-white placeholder-gray-500 outline-none transition-colors focus:border-yellow-500"
                />
              </div>
              {error && (
                <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                  {error}
                </div>
              )}
              <button
                type="submit"
                className="w-full rounded-xl bg-yellow-500 py-3.5 font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-95"
              >
                Siparişi Tamamla
              </button>
            </form>
          </div>
        </div>

        {/* Order summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-2xl border border-white/5 bg-gray-800/60 p-6">
            <h2 className="mb-5 text-lg font-bold text-white">Sipariş Özeti</h2>
            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.productId} className="flex justify-between text-sm">
                  <span className="text-gray-300">
                    {item.productName} <span className="text-gray-500">× {item.quantity}</span>
                  </span>
                  <span className="text-gray-200">₺{formatPrice(item.unitPrice * item.quantity)}</span>
                </div>
              ))}
            </div>
            <div className="my-4 border-t border-gray-700" />
            <div className="flex justify-between text-base font-bold text-white">
              <span>Toplam</span>
              <span>₺{formatPrice(cart.totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
