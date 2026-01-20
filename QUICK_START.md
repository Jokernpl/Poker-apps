# 🚀 QUICK START - Poker App

## Setup Locale (Da PC)

### 1. Clone Repository
\`\`\`bash
git clone https://github.com/Jokernpl/Poker-apps.git
cd Poker-apps
\`\`\`

### 2. Installa Docker + Docker Compose
- **Windows/Mac:** https://www.docker.com/products/docker-desktop
- **Linux:** \`sudo apt install docker.io docker-compose\`

### 3. Avvia Con Docker
\`\`\`bash
docker-compose up
\`\`\`

### 4. Accedi
- **Web:** http://localhost:3000
- **Backend:** http://localhost:3001
- **Database:** PostgreSQL on localhost:5432

---

## 📱 Accedo da Cellulare

### Da Browser Mobile

1. **Scopri l'IP del PC:**
   - **Windows:** \`ipconfig\` → IPv4 Address
   - **Mac:** \`ifconfig\` → inet (non 127.0.0.1)
   - **Linux:** \`hostname -I\`

2. **Nel cellulare apri:**
   - \`http://[IP_DEL_PC]:3000\`
   - Esempio: \`http://192.168.1.100:3000\`

3. **Registrati e Gioca!**

---

## 🧪 Test API

\`\`\`bash
# Health check
curl http://localhost:3001/api/health

# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Pass123!","username":"TestUser"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Pass123!"}'
\`\`\`

---

## 📦 Structure

\`\`\`
Poker-apps/
├── backend/          # Node.js + Express
├── frontend/         # React + Vite
├── docker-compose.yml
└── README.md
\`\`\`

---

## 🔗 URLs

| Servizio | URL | Note |
|----------|-----|------|
| Web App | http://localhost:3000 | Frontend React |
| Backend API | http://localhost:3001 | Socket.io + REST |
| Database | localhost:5432 | PostgreSQL |
| Redis | localhost:6379 | Cache/Sessions |

---

## ⚠️ Troubleshooting

**Port already in use?**
\`\`\`bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
lsof -ti:3001 | xargs kill -9
\`\`\`

**Docker not working?**
\`\`\`bash
docker-compose down -v
docker-compose up --build
\`\`\`

---

**Enjoy your Poker App! ♠️**
