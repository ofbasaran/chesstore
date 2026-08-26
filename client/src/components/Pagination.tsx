interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  // Sayfaları hesapla: her zaman ilk + son + mevcut ±2 göster
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
    const range = (from: number, to: number) =>
      Array.from({ length: to - from + 1 }, (_, i) => from + i);

    if (totalPages <= 7) {
      return range(1, totalPages);
    }

    const left = Math.max(2, currentPage - 1);
    const right = Math.min(totalPages - 1, currentPage + 1);

    pages.push(1);
    if (left > 2) pages.push("...");
    pages.push(...range(left, right));
    if (right < totalPages - 1) pages.push("...");
    pages.push(totalPages);

    return pages;
  };

  return (
    <div className="mt-10 flex items-center justify-center gap-1.5">
      {/* Önceki */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-gray-300 transition-colors hover:border-yellow-500 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Önceki sayfa"
      >
        ‹
      </button>

      {/* Sayfa numaraları */}
      {getPageNumbers().map((page, i) =>
        page === "..." ? (
          <span key={`dots-${i}`} className="flex h-9 w-9 items-center justify-center text-gray-600">
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page as number)}
            className={`flex h-9 w-9 items-center justify-center rounded-lg text-sm font-medium transition-all ${
              currentPage === page
                ? "bg-yellow-500 text-gray-900 shadow-[0_0_12px_rgba(245,158,11,0.4)]"
                : "border border-gray-700 bg-gray-800 text-gray-300 hover:border-yellow-500 hover:text-yellow-400"
            }`}
          >
            {page}
          </button>
        )
      )}

      {/* Sonraki */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-9 w-9 items-center justify-center rounded-lg border border-gray-700 bg-gray-800 text-gray-300 transition-colors hover:border-yellow-500 hover:text-yellow-400 disabled:cursor-not-allowed disabled:opacity-30"
        aria-label="Sonraki sayfa"
      >
        ›
      </button>
    </div>
  );
}
