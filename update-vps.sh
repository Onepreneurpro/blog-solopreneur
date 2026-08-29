#!/bin/bash
# ==============================================================================
# SCRIPT DE MISE À JOUR RAPIDE SOLOPRENEUR&CO SUR VPS CONTABO
# ==============================================================================

set -e

echo "🚀 [1/4] Récupération du dernier code depuis GitHub (main)..."
git pull origin main

echo "📦 [2/4] Installation des nouvelles dépendances & Prisma..."
npm install
npx prisma db push
npx prisma generate

echo "🏗️ [3/4] Recompilation du projet Next.js..."
npm run build

echo "⚡ [4/4] Redémarrage du serveur PM2..."
pm2 restart solopreneur-blog

echo "🎉 MISE À JOUR EN LIGNE RÉUSSIE SUR https://onepreneur.pro !"
