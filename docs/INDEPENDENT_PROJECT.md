# Make this an independent project (safe for the live app)

Use this when the POS is already live and you want your own copy to develop and test **without touching the live repo, database, or deployment**.

This cloud environment cannot create a repository under your personal GitHub account. Run the steps below on **your machine** while logged into GitHub as yourself.

## What “independent” means

| Concern | Live project (leave alone) | Your independent copy |
|---------|----------------------------|------------------------|
| GitHub repo | `SGGaita/point-of-sale` | **Your** repo (fork or new) |
| Database | Production Supabase | **New** Supabase project |
| Web deploy | Existing Vercel (or similar) | Optional separate deploy |
| Mobile API URL | Production web URL | Your local or your deploy URL |
| Git remotes | — | `origin` points only at **your** repo |

Pushing commits to your own repo never changes the live GitHub repo. Using a **separate Supabase project** ensures you never write production data by accident.

---

## Path A — Recommended: new repo under your account (no fork link)

Creates a full code copy with **no** GitHub “fork” relationship to the live project.

### 1. Clone the live code locally

```bash
git clone https://github.com/SGGaita/point-of-sale.git
cd point-of-sale
```

Optional: check out the local-setup branch if you want those docs/scripts first:

```bash
git fetch origin
git checkout cursor/local-dev-setup-856c
# or merge that PR into main first, then stay on main
```

### 2. Create an empty repo on your GitHub account

Pick a new name (example: `my-pos` or `point-of-sale-dev`):

```bash
# Requires: gh auth login  (as YOU)
gh repo create YOUR_GITHUB_USERNAME/my-pos --private --description "Independent POS development copy"
```

Or create an empty repository in the GitHub UI (do **not** add a README/license if you will push an existing clone).

### 3. Point this folder at your new repo only

```bash
# Keep a read-only pointer to the original (optional)
git remote rename origin upstream
git remote set-url upstream https://github.com/SGGaita/point-of-sale.git

# Your independent repo becomes origin
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/my-pos.git

# Push all branches/tags you care about
git push -u origin main
# optional: git push origin --all && git push origin --tags
```

For **full** independence (no easy pull from live), drop the upstream remote:

```bash
git remote remove upstream
```

Verify remotes:

```bash
git remote -v
# origin should be YOUR repo only
```

Helper script (same steps, interactive):

```bash
./scripts/make-independent-repo.sh YOUR_GITHUB_USERNAME/my-pos
```

### 4. Create a new Supabase project (do not reuse production)

1. [supabase.com/dashboard](https://supabase.com/dashboard) → **New project**
2. Save the database password
3. Copy Project URL + anon key (Settings → API)
4. Copy the Postgres URI (Settings → Database)

```bash
cd web
cp .env.example .env
# Fill with YOUR new project credentials only
# NEXT_PUBLIC_APP_URL=http://localhost:3000

npm install
npm run prisma:generate
npm run prisma:push    # schema goes to YOUR new DB
npm run prisma:seed    # optional
npm run dev
```

```bash
cd mobile
cp .env.example .env
# SUPABASE_* = same new project
# APP_API_URL=http://YOUR_LAN_IP:3000
npm install
```

### 5. Develop only against your copy

```bash
git checkout -b feature/my-change
# ... work ...
git push -u origin feature/my-change
```

Open PRs against **your** repo. Never set `origin` back to `SGGaita/point-of-sale` unless you intentionally intend to contribute upstream.

---

## Path B — GitHub Fork button

Use this if you want GitHub’s “fork” UI and the option to open PRs back to the live repo later.

1. Open https://github.com/SGGaita/point-of-sale → **Fork** → your account.
2. Clone **your fork** (not the original):

```bash
git clone https://github.com/YOUR_GITHUB_USERNAME/point-of-sale.git
cd point-of-sale
```

3. Still create a **new Supabase project** and local `.env` files (same as Path A step 4).
4. To avoid accidental pushes to live, confirm:

```bash
git remote -v
# origin  → your fork
# upstream → SGGaita/point-of-sale (read-only; do not push here)
```

Only push to `origin`.

---

## Safety checklist

- [ ] `git remote -v` shows `origin` = **your** repo
- [ ] You do **not** push to `SGGaita/point-of-sale`
- [ ] `web/.env` and `mobile/.env` use a **new** Supabase project (not production)
- [ ] Production Vercel/env vars were not overwritten
- [ ] Mobile `APP_API_URL` points at localhost/LAN or **your** deploy URL

## If you only need local experiments (no GitHub fork yet)

You can clone the live repo and work on a branch without pushing:

```bash
git clone https://github.com/SGGaita/point-of-sale.git
cd point-of-sale
git checkout -b local-experiment
# use a separate Supabase project in .env
```

Until you push, the live GitHub repo is unchanged. Still use a separate database so local API calls cannot alter production data.
