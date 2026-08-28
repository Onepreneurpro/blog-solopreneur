#!/bin/bash
# ==============================================================================
# SCRIPT D'INSTALLATION AUTOMATIQUE ET DE DÉPLOIEMENT SOLOPRENEUR&CO (NEXT.JS)
# Dépôt: https://github.com/Onepreneurpro/blog-solopreneur.git
# Domaine: https://onepreneur.pro (VPS Contabo 169.58.248.216)
# ==============================================================================

set -e

echo "🚀 [1/7] Mise à jour du système Ubuntu 24.04..."
sudo apt update && sudo apt upgrade -y

echo "📦 [2/7] Installation des dépendances (Node.js 20, Nginx, Certbot, Git)..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git build-essential nginx certbot python3-certbot-nginx

echo "⚙️ [3/7] Installation globale de PM2..."
sudo npm install -g pm2

echo "📥 [4/7] Configuration des variables d environnement .env..."
cat << 'EOF' > .env
NEXT_PUBLIC_APP_URL="https://onepreneur.pro"
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="solopreneur_secret_key_prod_2026_x984"
NODE_ENV="production"
EOF

echo "📦 [5/7] Installation des packages npm & compilation Next.js..."
npm install
npx prisma db push
npx prisma generate
npm run build

echo "⚡ [6/7] Démarrage du serveur PM2 & Nginx Reverse Proxy..."
pm2 delete solopreneur-blog || true
pm2 start npm --name "solopreneur-blog" -- start -- -p 3000
pm2 save

cat << 'EOF' | sudo tee /etc/nginx/sites-available/solopreneur
server {
    listen 80;
    server_name onepreneur.pro www.onepreneur.pro 169.58.248.216;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/solopreneur /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx

echo "🔒 [7/7] Activation du Certificat SSL HTTPS Gratuit (Certbot)..."
sudo certbot --nginx -d onepreneur.pro -d www.onepreneur.pro --redirect --agree-tos -m admin@onepreneur.pro --non-interactive || true

echo "🎉 FÉLICITATIONS ! Déploiement terminé avec succès sur https://onepreneur.pro !"
