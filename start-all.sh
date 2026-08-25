#!/bin/bash

# ─────────────────────────────────────────────
#  ChessStore — Tüm servisleri başlatan script
# ─────────────────────────────────────────────

ROOT="$(cd "$(dirname "$0")" && pwd)/src/Services"
LOG_DIR="$(cd "$(dirname "$0")" && pwd)/logs"
mkdir -p "$LOG_DIR"

# Renk kodları
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${YELLOW} ChessStore servisleri başlatılıyor...${NC}"
echo ""

# Servis listesi (klasör adı)
SERVICES=(
  "Identity/Identity.API"
  "Catalog/Catalog.API"
  "Cart/Cart.API"
  "Order/Order.API"
  "Payment/Payment.API"
  "Notification/Notification.API"
  "ApiGateway"
)

PIDS=()

for SERVICE in "${SERVICES[@]}"; do
  SERVICE_PATH="$ROOT/$SERVICE"
  SERVICE_NAME=$(basename "$SERVICE")
  LOG_FILE="$LOG_DIR/$SERVICE_NAME.log"

  if [ ! -d "$SERVICE_PATH" ]; then
    echo -e "${RED}⚠️  Klasör bulunamadı: $SERVICE_PATH${NC}"
    continue
  fi

  echo -e "${GREEN}▶ $SERVICE_NAME${NC} başlatılıyor... (log: logs/$SERVICE_NAME.log)"
  (cd "$SERVICE_PATH" && dotnet run > "$LOG_FILE" 2>&1) &
  PIDS+=($!)
done

echo ""
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN} Tüm servisler arka planda başlatıldı!${NC}"
echo ""
echo "📋 Logları izlemek için:"
echo "   tail -f logs/Identity.API.log"
echo "   tail -f logs/Catalog.API.log"
echo "   tail -f logs/ApiGateway.log"
echo "   tail -f logs/*.log        (hepsi birden)"
echo ""
echo " Durdurmak için:"
echo "   ./stop-all.sh"
echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# PID'leri kaydet (stop-all.sh için)
printf '%s\n' "${PIDS[@]}" > "$LOG_DIR/.pids"

# Ctrl+C ile hepsini kapat
trap 'echo ""; echo "Servisler durduruluyor..."; kill "${PIDS[@]}" 2>/dev/null; exit 0' SIGINT SIGTERM

# Bekle (servisler arka planda çalışmaya devam eder)
wait
