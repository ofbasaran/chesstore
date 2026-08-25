import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/navigation";

interface Product {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
  categoryName: string;
  stockQuantity: number;
}

interface FeaturedSliderProps {
  products: Product[];
}

const formatPrice = (value: number) =>
  new Intl.NumberFormat("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(value);

function FeaturedCard({ product }: { product: Product }) {
  const [imgError, setImgError] = useState(false);
  return (
    <Link
      to={`/product/${product.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/5 bg-gray-800/60 shadow-lg shadow-black/30 transition-all duration-300 hover:-translate-y-1.5 hover:border-yellow-500/40"
    >
      <div className="relative aspect-square overflow-hidden bg-gray-900">
        {!imgError && product.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={product.name}
            onError={() => setImgError(true)}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-6xl text-gray-700">♟</div>
        )}
        {product.categoryName && (
          <span className="absolute left-3 top-3 rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-widest text-yellow-400 backdrop-blur">
            {product.categoryName}
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h3 className="line-clamp-1 font-semibold text-white transition-colors group-hover:text-yellow-400">
          {product.name}
        </h3>
        <span className="mt-3 text-lg font-bold text-white">₺{formatPrice(product.price)}</span>
      </div>
    </Link>
  );
}

export default function FeaturedSlider({ products }: FeaturedSliderProps) {
  const prevRef = useRef<HTMLButtonElement>(null);
  const nextRef = useRef<HTMLButtonElement>(null);
  const [swiper, setSwiper] = useState<SwiperType | null>(null);

  if (!products || products.length === 0) return null;

  return (
    <div className="relative">
      <Swiper
        modules={[Autoplay, Navigation]}
        spaceBetween={20}
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        onSwiper={setSwiper}
        onBeforeInit={(sw) => {
          // @ts-expect-error swiper navigation refs
          sw.params.navigation.prevEl = prevRef.current;
          // @ts-expect-error swiper navigation refs
          sw.params.navigation.nextEl = nextRef.current;
        }}
        navigation={{ prevEl: prevRef.current, nextEl: nextRef.current }}
        breakpoints={{
          0: { slidesPerView: 1.2 },
          640: { slidesPerView: 2.5 },
          1024: { slidesPerView: 4 },
        }}
        className="!pb-2"
      >
        {products.map((p) => (
          <SwiperSlide key={p.id} className="!h-auto">
            <FeaturedCard product={p} />
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom navigation buttons */}
      <button
        ref={prevRef}
        onClick={() => swiper?.slidePrev()}
        aria-label="Önceki"
        className="absolute -left-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-yellow-500 text-gray-900 shadow-lg transition-all hover:bg-yellow-400 active:scale-90"
      >
        ‹
      </button>
      <button
        ref={nextRef}
        onClick={() => swiper?.slideNext()}
        aria-label="Sonraki"
        className="absolute -right-3 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-yellow-500 text-gray-900 shadow-lg transition-all hover:bg-yellow-400 active:scale-90"
      >
        ›
      </button>
    </div>
  );
}
