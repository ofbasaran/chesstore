import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import { Link } from "react-router-dom";
import "swiper/css";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  categoryName: string;
  stockQuantity: number;
}

interface Tab {
  label: string;
  categoryKeyword: string; // categoryName'de aranacak anahtar kelime (boş = hepsi)
}

interface TabProductSliderProps {
  products: Product[];
  tabs?: Tab[];
  title?: string;
}

const DEFAULT_TABS: Tab[] = [
  { label: "Tümü", categoryKeyword: "" },
  { label: "Tahtalar", categoryKeyword: "tahta" },
  { label: "Taşlar", categoryKeyword: "taş" },
  { label: "Aksesuarlar", categoryKeyword: "aksesuar" },
];

const formatPrice = (value: number) =>
  new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

export default function TabProductSlider({
  products,
  tabs = DEFAULT_TABS,
  title = "Kategoriye Göre Ürünler",
}: TabProductSliderProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);

  if (!products || products.length === 0) return null;

  const activeTabDef = tabs[activeTab];
  const filtered =
    !activeTabDef.categoryKeyword
      ? products
      : products.filter((p) =>
          p.categoryName?.toLowerCase().includes(activeTabDef.categoryKeyword.toLowerCase())
        );

  // Eğer filtrede ürün yoksa hepsini göster
  const displayed = filtered.length > 0 ? filtered : products;

  return (
    <section className="mx-auto max-w-7xl px-4 py-10">
      {/* Başlık + sekmeler */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h2 className="text-2xl font-bold text-white">{title}</h2>
        <div className="flex gap-1.5">
          {tabs.map((tab, i) => (
            <button
              key={tab.label}
              onClick={() => { setActiveTab(i); swiper?.slideTo(0); }}
              className={`relative rounded-full px-4 py-1.5 text-sm font-semibold transition-all duration-200 ${
                activeTab === i
                  ? "bg-yellow-500 text-gray-900 shadow-[0_0_12px_rgba(245,158,11,0.35)]"
                  : "border border-gray-700 bg-gray-800 text-gray-300 hover:border-yellow-500/50 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Slider */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          <Swiper
            modules={[Autoplay]}
            spaceBetween={16}
            loop={displayed.length > 4}
            autoplay={{ delay: 3500, disableOnInteraction: false }}
            onSwiper={setSwiper}
            breakpoints={{
              0:    { slidesPerView: 1.4 },
              480:  { slidesPerView: 2.2 },
              768:  { slidesPerView: 3.2 },
              1024: { slidesPerView: 4.5 },
            }}
            className="!pb-1"
          >
            {displayed.map((p) => (
              <SwiperSlide key={p.id} className="!h-auto">
                <Link
                  to={`/product/${p.id}`}
                  className="group flex h-full flex-col overflow-hidden rounded-xl border border-white/5 bg-gray-800/60 transition-all duration-300 hover:-translate-y-1 hover:border-yellow-500/40"
                >
                  <div className="relative aspect-square overflow-hidden bg-gray-900">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-5xl text-gray-700">♟</div>
                    )}
                    {p.categoryName && (
                      <span className="absolute left-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-widest text-yellow-400 backdrop-blur">
                        {p.categoryName}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <p className="line-clamp-1 text-sm font-semibold text-white transition-colors group-hover:text-yellow-400">
                      {p.name}
                    </p>
                    <p className="mt-1 text-base font-bold text-white">₺{formatPrice(p.price)}</p>
                    <p className="text-[10px] text-gray-500">KDV Dahil</p>
                  </div>
                </Link>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Nav buttons */}
          <button
            onClick={() => swiper?.slidePrev()}
            aria-label="Önceki"
            className="absolute -left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-yellow-500 text-gray-900 shadow-lg transition-all hover:bg-yellow-400 active:scale-90"
          >
            ‹
          </button>
          <button
            onClick={() => swiper?.slideNext()}
            aria-label="Sonraki"
            className="absolute -right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-yellow-500 text-gray-900 shadow-lg transition-all hover:bg-yellow-400 active:scale-90"
          >
            ›
          </button>
        </motion.div>
      </AnimatePresence>
    </section>
  );
}
