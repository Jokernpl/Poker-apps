# 🎰 POKER APP - SETUP GUIDE

## Prerequisiti

- **Node.js** 18+ (scarica da https://nodejs.org/)
- **Docker + Docker Compose** (scarica da https://www.docker.com/products/docker-desktop)
- **Git**

## 🚀 Quick Start Locale (Development)

### 1️⃣ Clone del repo
```bash
git clone <TUO_REPO_URL>
cd poker-app
```

### 2️⃣ Setup variabili d'ambiente
```bash
# Backend
cp backend/.env.example backend/.env

# Modifica backend/.env se necessario (di solito non serve per development)
```

### 3️⃣ Avvia con Docker Compose
```bash
docker-compose up
```

Questo avvierà:
- ✅ PostgreSQL (porta 5432)
- ✅ Redis (porta 6379)
- ✅ Backend Express (porta 3001)
- ✅ Frontend React (porta 3000)

Attendere che i servizi siano pronti (circa 30 secondi).

### 4️⃣ Test della connessione
```bash
# Backend health check
curl http://localhost:3001/health

# Response atteso:
# {"status":"OK","timestamp":"2026-01-20T..."}
```

### 5️⃣ Accedi all'app
```
🌍 Frontend: http://localhost:3000
🔌 Backend API: http://localhost:3001
📊 Database: localhost:5432
```

---

## 📱 Setup Senza Docker (Alternativo)

### Backend
```bash
cd backend
npm install
npm run dev
```

**Prerequisiti:**
- PostgreSQL in locale (o connection string in .env)
- Redis in locale (o disabilitare)

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## 🛑 Problemi Comuni

### "Cannot connect to database"
```bash
# Verifica che PostgreSQL sia avviato
docker logs poker_postgres

# Riavvia i servizi
docker-compose restart postgres
```

### "Port 3001 already in use"
```bash
# Cambia porta in backend/.env e docker-compose.yml
PORT=3002
```

### "Module not found"
```bash
# Reinstalla dependencies
docker-compose restart backend
# O manualmente:
cd backend && npm install
```

---

## 📝 Test API (Postman / cURL)

### Registrazione
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "username": "testuser"
  }'
```

### Login
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### Get User Profile (con token)
```bash
curl -X GET http://localhost:3001/api/users/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔧 File Importanti

```
poker-app/
├── backend/
│   ├── src/
│   │   ├── index.ts          ← Entry point server
│   │   ├── database/          ← Database connection + migrations
│   │   ├── routes/            ← API routes
│   │   ├── middleware/        ← Auth, etc
│   │   └── sockets/           ← Real-time game logic
│   ├── Dockerfile
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── src/
│   ├── package.json
│   └── Dockerfile
├── docker-compose.yml
└── docs/
```

---

## 🔐 Sicurezza (Development vs Production)

**Development:**
- JWT secret: `dev_secret_key_change_in_prod`
- CORS: `http://localhost:3000`
- Database password: `secure_password_change_me`

**Production:**
- ⚠️ Cambia TUTTI i secret in `.env`
- ⚠️ Usa HTTPS per Socket.io
- ⚠️ Configura CORS correttamente
- ⚠️ Usa variabili d'ambiente separate

---

## 📊 Database Migrations

Le migrations vengono eseguite automaticamente al startup del backend.

Se vuoi eseguire manualmente:
```bash
cd backend
npx ts-node src/database/migrations.ts
```

---

## 🐳 Docker Useful Commands

```bash
# Visualizza logs
docker-compose logs -f backend

# Accedi al database
docker exec -it poker_postgres psql -U poker_user -d poker_game_db

# Ferma tutto
docker-compose down

# Riavvia un servizio
docker-compose restart backend
```

---

## ✅ Checklist Setup

- [ ] Docker + Docker Compose installati
- [ ] Repo clonato
- [ ] `.env` files configurati
- [ ] `docker-compose up` eseguito con successo
- [ ] Backend health check OK
- [ ] Database connesso
- [ ] Frontend accessibile su localhost:3000
- [ ] API auth funzionante

---

## 🆘 Contatti / Supporto

Se hai problemi, controlla:
1. Logs: `docker-compose logs -f`
2. Port in uso: `lsof -i :3001` (macOS/Linux)
3. Docker running: `docker ps`

Buon sviluppo! 🚀
