import { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, EffectFade } from "swiper/modules";
import { motion, AnimatePresence } from "framer-motion";
import "swiper/css";
import "swiper/css/pagination";

interface Slide {
  title: string;
  subtitle: string;
  piece: string;
  cta: string;
}

const slides: Slide[] = [
  {
    title: "Ustalar İçin Tasarlandı",
    subtitle: "Turnuva standardı satranç takımları",
    piece: "♔",
    cta: "Koleksiyonu Keşfet",
  },
  {
    title: "Premium Taş Setleri",
    subtitle: "El işçiliği ahşap ve metal taşlar",
    piece: "♛",
    cta: "Şimdi Al",
  },
  {
    title: "Rakibini Mat Et",
    subtitle: "Profesyonel turnuva ekipmanları",
    piece: "♞",
    cta: "Keşfet",
  },
];

export default function HeroSlider() {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="relative w-full overflow-hidden border-b border-white/5">
      <Swiper
        modules={[Autoplay, Pagination, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        autoplay={{ delay: 5000, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        loop
        onSlideChange={(sw) => setActiveIndex(sw.realIndex)}
        className="hero-swiper"
      >
        {slides.map((slide, i) => (
          <SwiperSlide key={i}>
            <div className="relative bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
              {/* decorative glow */}
              <div className="pointer-events-none absolute -right-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-yellow-500/10 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-32 left-10 h-80 w-80 rounded-full bg-yellow-600/5 blur-3xl" />

              <div className="relative mx-auto flex min-h-[420px] max-w-7xl flex-col items-center justify-between gap-8 px-4 py-16 md:flex-row md:py-24">
                {/* Text */}
                <div className="max-w-xl text-center md:text-left">
                  <AnimatePresence mode="wait">
                    {activeIndex === i && (
                      <motion.div
                        key={`text-${i}`}
                        initial={{ opacity: 0, y: 24 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -24 }}
                        transition={{ duration: 0.55, ease: "easeOut" }}
                      >
                        <span className="inline-block rounded-full border border-yellow-500/30 bg-yellow-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-yellow-400">
                          Yeni Sezon
                        </span>
                        <h1 className="mt-5 text-4xl font-bold leading-tight text-white md:text-5xl lg:text-6xl">
                          {slide.title}
                        </h1>
                        <p className="mt-4 text-lg text-gray-400">{slide.subtitle}</p>
                        <a
                          href="#urunler"
                          className="mt-8 inline-block rounded-xl bg-yellow-500 px-8 py-3 font-semibold text-gray-900 transition-all hover:bg-yellow-400 active:scale-95"
                        >
                          {slide.cta}
                        </a>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Piece */}
                <div className="relative">
                  <AnimatePresence mode="wait">
                    {activeIndex === i && (
                      <motion.span
                        key={`piece-${i}`}
                        initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
                        animate={{ opacity: 1, scale: 1, rotate: 0 }}
                        exit={{ opacity: 0, scale: 0.6, rotate: 10 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="block text-[9rem] leading-none text-yellow-400 drop-shadow-[0_0_35px_rgba(245,158,11,0.4)] md:text-[13rem]"
                      >
                        {slide.piece}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      <style>{`
        .hero-swiper .swiper-pagination-bullet {
          background: rgba(255,255,255,0.4);
          opacity: 1;
          width: 10px;
          height: 10px;
          transition: all 0.3s;
        }
        .hero-swiper .swiper-pagination-bullet-active {
          background: #f59e0b;
          width: 28px;
          border-radius: 5px;
        }
      `}</style>
    </section>
  );
}
