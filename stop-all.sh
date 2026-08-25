#!/bin/bash

# ─────────────────────────────────────────────
#  ChessStore — Tüm servisleri durduran script
# ─────────────────────────────────────────────

LOG_DIR="$(cd "$(dirname "$0")" && pwd)/logs"
PID_FILE="$LOG_DIR/.pids"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

if [ -f "$PID_FILE" ]; then
  echo -e "${RED}🛑 Servisler durduruluyor...${NC}"
  while read -r PID; do
    kill "$PID" 2>/dev/null && echo "  PID $PID durduruldu"
  done < "$PID_FILE"
  rm -f "$PID_FILE"
  echo -e "${GREEN} Tüm servisler durduruldu.${NC}"
else
  # PID dosyası yoksa dotnet süreçlerini bul ve kapat
  echo -e "${RED} dotnet süreçleri kapatılıyor...${NC}"
  pkill -f "dotnet run" 2>/dev/null
  pkill -f "Identity.API" 2>/dev/null
  pkill -f "Catalog.API" 2>/dev/null
  pkill -f "Cart.API" 2>/dev/null
  pkill -f "Order.API" 2>/dev/null
  pkill -f "Payment.API" 2>/dev/null
  pkill -f "Notification.API" 2>/dev/null
  pkill -f "ApiGateway" 2>/dev/null
  echo -e "${GREEN} Tüm dotnet süreçleri durduruldu.${NC}"
fi
