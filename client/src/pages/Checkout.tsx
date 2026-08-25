
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axiosInstance";

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

  if (!cart) return <p>Yükleniyor...</p>;
  if (cart.items.length === 0 && step === "form") {
    return (
      <div className="max-w-xl mx-auto py-24 text-center">
        <p className="text-gray-500">Sepetiniz boş.</p>
        <button onClick={() => navigate("/")} className="mt-4 px-6 py-2 bg-gray-900 text-white">
          Alışverişe Devam Et
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-4 grid md:grid-cols-2 gap-10">
      <div>
        <h2 className="text-lg font-semibold mb-4">Sipariş Özeti</h2>
        <div className="divide-y divide-gray-200 border-t border-b border-gray-200">
          {cart.items.map((item: CartItem) => (
            <div key={item.productId} className="flex justify-between py-3 text-sm">
              <span>{item.productName} × {item.quantity}</span>
              <span>{(item.unitPrice * item.quantity).toFixed(2)} TL</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between font-semibold text-lg mt-4">
          <span>Toplam</span>
          <span>{cart.totalPrice.toFixed(2)} TL</span>
        </div>
      </div>

      <div>
        {step === "form" && (
          <form onSubmit={handleCheckout} className="space-y-4">
            <div>
              <label className="text-xs uppercase tracking-widest text-gray-500">
                Teslimat Adresi
              </label>
              <textarea
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={4}
                className="w-full border border-gray-300 mt-1 p-2 text-sm"
              />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <button type="submit" className="w-full bg-gray-900 text-white py-3 font-medium hover:bg-gray-700">
              Siparişi Tamamla
            </button>
          </form>
        )}

        {step === "processing" && (
          <div className="text-center py-12">
            <p className="text-gray-600">Ödemeniz işleniyor, lütfen bekleyin...</p>
          </div>
        )}

        {step === "pending_confirmation" && orderId && (
  <div className="text-center py-12">
    <p className="text-gray-700 font-semibold mb-2">Siparişiniz alındı</p>
    <p className="text-sm text-gray-500 mb-6">
      Ödemeniz işleniyor. Bu işlem biraz zaman alabilir — durumu Sepet
      sayfasından takip edebilirsiniz.
    </p>
    <button onClick={() => navigate("/orders")} className="px-6 py-2 bg-gray-900 text-white">
      Siparişlerim
    </button>
  </div>
)}

        {step === "success" && orderId && (
          <div className="text-center py-12">
            <p className="text-green-700 font-semibold mb-2">Siparişiniz alındı!</p>
            <p className="text-sm text-gray-500 mb-6">Sipariş No: {orderId}</p>
            <button onClick={() => navigate("/orders")} className="px-6 py-2 bg-gray-900 text-white">
              Siparişlerim
            </button>
          </div>
        )}

        {step === "failed" && (
          <div className="text-center py-12">
            <p className="text-red-600 font-semibold mb-2">Bir hata oluştu</p>
            <p className="text-sm text-gray-500 mb-6">{error}</p>
            <button onClick={() => setStep("form")} className="px-6 py-2 bg-gray-900 text-white">
              Tekrar Dene
            </button>
          </div>
        )}
      </div>
    </div>
  );
}