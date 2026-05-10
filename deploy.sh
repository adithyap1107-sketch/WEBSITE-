#!/bin/bash
# ════════════════════════════════════════════════════
#   AgriShare — GitHub Deploy Script
#   Run this once to push to GitHub, then deploy
#   on Render.com following the README instructions.
# ════════════════════════════════════════════════════

set -e

echo ""
echo "🌾 AgriShare — GitHub Deployment Setup"
echo "════════════════════════════════════════"
echo ""

# ── Step 1: Check git ────────────────────────────────
if ! command -v git &> /dev/null; then
  echo "❌ Git is not installed. Install it first: https://git-scm.com"
  exit 1
fi

# ── Step 2: Get GitHub details ───────────────────────
read -p "Enter your GitHub username: " GH_USER
if [ -z "$GH_USER" ]; then echo "❌ Username required"; exit 1; fi

REPO_NAME="agrishare"
REPO_URL="https://github.com/$GH_USER/$REPO_NAME.git"

echo ""
echo "📋 Before continuing, make sure you have:"
echo "   1. Created a new EMPTY repo at: https://github.com/new"
echo "      Name it: $REPO_NAME"
echo "      ⚠️  Do NOT add README, .gitignore, or license (keep it empty)"
echo ""
read -p "Press Enter once repo is created..."

# ── Step 3: Init git ─────────────────────────────────
cd "$(dirname "$0")"

if [ ! -d ".git" ]; then
  git init
  echo "✅ Git initialized"
fi

git config user.email "${GH_USER}@users.noreply.github.com" 2>/dev/null || true
git config user.name "$GH_USER" 2>/dev/null || true

# ── Step 4: Stage & commit ───────────────────────────
git add -A
git commit -m "🌾 AgriShare v1.0 — Full stack agricultural platform

Features:
- Token-based fractional equipment ownership
- Equipment rental marketplace with calendar booking
- Labour hire system with worker profiles
- List Your Equipment with earnings calculator
- JWT auth (register/login)
- REST API: /api/equipment /api/labour /api/bookings /api/listings
- SQLite database (sql.js, zero native deps)
- Dark theme responsive frontend
- Render.com deploy-ready" 2>/dev/null || git commit --allow-empty -m "🌾 AgriShare update"

# ── Step 5: Push ─────────────────────────────────────
git branch -M main
git remote remove origin 2>/dev/null || true
git remote add origin "$REPO_URL"

echo ""
echo "⬆️  Pushing to $REPO_URL ..."
echo "   You may be asked for your GitHub credentials."
echo "   Use a Personal Access Token (PAT) as password:"
echo "   → https://github.com/settings/tokens/new"
echo "   (Select: repo scope)"
echo ""

git push -u origin main

echo ""
echo "════════════════════════════════════════════════"
echo "✅ Code pushed to GitHub!"
echo ""
echo "🌐 NEXT: Deploy to Render.com (FREE)"
echo "════════════════════════════════════════════════"
echo ""
echo "1. Go to: https://render.com  (sign up with GitHub)"
echo "2. Click: New + → Web Service"
echo "3. Connect repo: $GH_USER/$REPO_NAME"
echo "4. Settings:"
echo "   Build Command:  npm install"
echo "   Start Command:  npm start"
echo "   Runtime:        Node"
echo ""
echo "5. Environment Variables (add these):"
echo "   NODE_ENV   = production"
echo "   JWT_SECRET = (click Generate in Render dashboard)"
echo "   DB_PATH    = /opt/render/project/src/backend/db/agrishare.db"
echo ""
echo "6. Disk (for persistent database):"
echo "   Mount Path = /opt/render/project/src/backend/db"
echo "   Size       = 1 GB"
echo ""
echo "7. Click: Create Web Service"
echo ""
echo "⏳ Render will build & deploy in ~3 minutes."
echo "🌐 Your site: https://$REPO_NAME.onrender.com"
echo ""
echo "🔑 Demo login: phone=9999999999 / password=admin123"
echo "════════════════════════════════════════════════"
