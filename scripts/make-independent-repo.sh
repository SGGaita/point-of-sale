#!/usr/bin/env bash
# Retarget this clone to a new GitHub repo under YOUR account so work
# does not push to the live SGGaita/point-of-sale repository.
#
# Usage:
#   ./scripts/make-independent-repo.sh YOUR_USERNAME/my-pos
#   ./scripts/make-independent-repo.sh YOUR_USERNAME/my-pos --keep-upstream
#   ./scripts/make-independent-repo.sh YOUR_USERNAME/my-pos --create
#
# Prerequisites:
#   - Run on your machine (logged into GitHub as yourself)
#   - gh CLI authenticated: gh auth login
#   - Target repo either already exists (empty) or pass --create
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

TARGET="${1:-}"
KEEP_UPSTREAM=false
CREATE_REPO=false

for arg in "${@:2}"; do
  case "$arg" in
    --keep-upstream) KEEP_UPSTREAM=true ;;
    --create) CREATE_REPO=true ;;
    *)
      echo "Unknown option: $arg"
      echo "Usage: $0 OWNER/REPO [--create] [--keep-upstream]"
      exit 1
      ;;
  esac
done

if [[ -z "$TARGET" || "$TARGET" != */* ]]; then
  echo "Usage: $0 OWNER/REPO [--create] [--keep-upstream]"
  echo "Example: $0 josephngotho/my-pos --create"
  exit 1
fi

OWNER="${TARGET%%/*}"
REPO="${TARGET#*/}"
ORIGIN_URL="https://github.com/${OWNER}/${REPO}.git"
LIVE_URL="https://github.com/SGGaita/point-of-sale.git"

if [[ "$(gh api user --jq .login 2>/dev/null || true)" == "cursor" ]]; then
  echo "Warning: gh appears to be the Cursor integration, not your personal account."
  echo "Run this script on your own machine after: gh auth login"
fi

CURRENT_ORIGIN="$(git remote get-url origin 2>/dev/null || true)"
if [[ "$CURRENT_ORIGIN" == *"SGGaita/point-of-sale"* ]] || [[ "$CURRENT_ORIGIN" == *"sggaita/point-of-sale"* ]]; then
  echo "==> Renaming live remote origin → upstream"
  git remote rename origin upstream
elif git remote get-url origin >/dev/null 2>&1; then
  echo "==> origin already set to: $(git remote get-url origin)"
  echo "    Refusing to overwrite. Remove or rename it first if this is wrong."
  exit 1
fi

if [[ "$CREATE_REPO" == true ]]; then
  echo "==> Creating private repo ${OWNER}/${REPO}"
  gh repo create "${OWNER}/${REPO}" --private --description "Independent POS development copy"
fi

if ! git remote get-url origin >/dev/null 2>&1; then
  echo "==> Adding origin → ${ORIGIN_URL}"
  git remote add origin "$ORIGIN_URL"
fi

BRANCH="$(git rev-parse --abbrev-ref HEAD)"
echo "==> Pushing branch '${BRANCH}' to origin"
git push -u origin "$BRANCH"

# Also push main if we are not on it and it exists locally
if [[ "$BRANCH" != "main" ]] && git show-ref --verify --quiet refs/heads/main; then
  echo "==> Also pushing main"
  git push origin main || true
fi

if [[ "$KEEP_UPSTREAM" == false ]] && git remote get-url upstream >/dev/null 2>&1; then
  echo "==> Removing upstream remote (full independence)"
  echo "    Pass --keep-upstream if you want a read-only link to the live repo."
  git remote remove upstream
elif git remote get-url upstream >/dev/null 2>&1; then
  git remote set-url upstream "$LIVE_URL"
  echo "==> Kept upstream (read-only): $LIVE_URL"
  echo "    Never: git push upstream ..."
fi

echo
echo "Remotes:"
git remote -v
echo
echo "Next (required so you do not hit the live database):"
echo "  1. Create a NEW Supabase project"
echo "  2. Copy web/.env.example → web/.env and mobile/.env.example → mobile/.env"
echo "  3. Put only the NEW project credentials in those files"
echo "  4. cd web && npm install && npm run prisma:generate && npm run prisma:push && npm run dev"
echo
echo "See docs/INDEPENDENT_PROJECT.md for the full checklist."
