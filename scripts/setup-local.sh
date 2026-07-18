#!/usr/bin/env bash
# Bootstrap local development for web and/or mobile.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET="${1:-all}"

setup_web() {
  echo "==> Setting up web/"
  cd "$ROOT/web"
  if [[ ! -f .env ]]; then
    cp .env.example .env
    echo "    Created web/.env from .env.example — edit credentials before running."
  else
    echo "    web/.env already exists — leaving it unchanged."
  fi
  npm install
  npm run prisma:generate
  echo "    Web ready. Run: cd web && npm run dev"
}

setup_mobile() {
  echo "==> Setting up mobile/"
  cd "$ROOT/mobile"
  if [[ ! -f .env ]]; then
    cp .env.example .env
    echo "    Created mobile/.env from .env.example — edit credentials before running."
  else
    echo "    mobile/.env already exists — leaving it unchanged."
  fi
  npm install
  echo "    Mobile ready. Run: cd mobile && npm start"
}

case "$TARGET" in
  web) setup_web ;;
  mobile) setup_mobile ;;
  all)
    setup_web
    setup_mobile
    ;;
  *)
    echo "Usage: $0 [all|web|mobile]"
    exit 1
    ;;
esac

echo "==> Done."
