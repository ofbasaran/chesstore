import { motion } from "framer-motion";

interface ShowcaseItem {
  label: string;
  piece: string;
  description: string;
  href: string;
  gradient: string;
}

const ITEMS: ShowcaseItem[] = [
  {
    label: "Satranç Tahtaları",
    piece: "♔",
    description: "El yapımı ahşap ve katlanır tahtalar",
    href: "/?category=tahtalar",
    gradient: "from-amber-950/80 via-amber-900/60 to-yellow-900/40",
  },
  {
    label: "Taş Setleri",
    piece: "♛",
    description: "Turnuva standardı ahşap ve metal taşlar",
    href: "/?category=taslar",
    gradient: "from-gray-950/80 via-gray-900/60 to-gray-800/40",
  },
  {
    label: "Kitap & Eğitim",
    piece: "♞",
    description: "Başlangıçtan büyüstata stratejilerine",
    href: "/?category=kitaplar",
    gradient: "from-emerald-950/80 via-emerald-900/60 to-teal-900/40",
  },
];

export default function CategoryShowcase() {
  return (
    <section className="mx-auto hidden max-w-7xl px-4 py-10 md:block">
      <div className="grid grid-cols-3 gap-4">
        {ITEMS.map((item, i) => (
          <motion.a
            key={item.label}
            href={item.href}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.1 }}
            className="group relative flex h-52 flex-col items-center justify-center overflow-hidden rounded-2xl border border-white/5 bg-gray-900 text-center transition-all duration-300 hover:border-yellow-500/40 hover:shadow-xl hover:shadow-black/40"
          >
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${item.gradient} opacity-60 transition-opacity duration-300 group-hover:opacity-80`} />

            {/* Glow */}
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="h-32 w-32 rounded-full bg-yellow-500/5 blur-2xl transition-all duration-300 group-hover:bg-yellow-500/15 group-hover:blur-3xl" />
            </div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center gap-3">
              <span className="text-5xl text-yellow-400 drop-shadow-[0_0_16px_rgba(245,158,11,0.5)] transition-transform duration-300 group-hover:scale-110">
                {item.piece}
              </span>
              <h3 className="text-lg font-bold text-white">{item.label}</h3>
              <p className="text-xs text-gray-400">{item.description}</p>
              <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-yellow-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                Keşfet <span>→</span>
              </span>
            </div>
          </motion.a>
        ))}
      </div>
    </section>
  );
}
