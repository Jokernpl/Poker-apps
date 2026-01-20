# ♠️ POKER APP - SISTEMA COMPLETO

## ✅ STATUS: FASE 1 COMPLETA + FASE 1.5 PRONTA

**Cosa è pronto:**
- ✅ Backend Express + TypeScript completo
- ✅ Database PostgreSQL (schema 13 tabelle)
- ✅ Frontend React web (login, register, lobby, tavoli)
- ✅ Socket.io real-time foundation
- ✅ Redis cache + sessions
- ✅ Docker Compose (tutto in 1 comando)
- ✅ Git repository

---

## 🚀 INSTALLAZIONE (DA PC - 5 minuti)

### Step 1: Clone
\`\`\`bash
git clone https://github.com/Jokernpl/Poker-apps.git
cd Poker-apps
\`\`\`

### Step 2: Docker (Installa prima: https://www.docker.com/products/docker-desktop)
\`\`\`bash
docker-compose up
\`\`\`

**Attendi finché non vedi:**
```
backend  | ✅ Server running on http://localhost:3001
frontend | ✅ Server running on http://localhost:3000
```

### Step 3: Testa Localmente (PC)
- Apri il browser: **http://localhost:3000**
- Registrati o usa test account
- Crea tavoli e gioca!

---

## 📱 ACCEDI DA CELLULARE (Android/iOS)

### Metodo 1: Browser Mobile (Consigliato)

#### Step A: Scopri l'IP del PC
- **Windows:** Apri CMD e scrivi: \`ipconfig\` → cerca "IPv4 Address" (es: 192.168.x.x)
- **Mac:** Apri Terminal: \`ifconfig\` → cerca "inet" non 127.0.0.1
- **Linux:** \`hostname -I\`

#### Step B: Nel Cellulare
1. **Connetti il cellulare SULLA STESSA RETE WiFi del PC**
2. **Nel browser mobile apri:** \`http://[IP_DEL_PC]:3000\`
   - Esempio: \`http://192.168.1.50:3000\`
3. **Registrati/Login e gioca!**

#### Step C: Test di Connessione
```
Cellulare aperto http://192.168.1.50:3000
↓
Vedi la pagina di login ✅
↓
Registrati e Gioca ♠️
```

---

## 🎮 FUNZIONI DISPONIBILI SUBITO

### Login/Register ✅
- Email + Password
- Nickname personalizzato
- Recovery password (framework)

### Lobby ✅
- Vedi tavoli disponibili
- Crea nuovi tavoli
- Real-time aggiornamento (refresh ogni 5 sec)

### Tavolo di Poker (Base) ✅
- Join tavolo
- Visualizza giocatori
- Chat in tempo reale
- Pulsanti azione (Fold, Check, Call, Raise, All-In)
- Pot in tempo reale

---

## 📋 API ENDPOINTS (Testing)

### Register
\`\`\`bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Pass123!",
    "username": "TestPlayer"
  }'
\`\`\`

### Login
\`\`\`bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@test.com",
    "password": "Pass123!"
  }'
\`\`\`

**Risposta:**
\`\`\`json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "uuid",
    "email": "test@test.com",
    "username": "TestPlayer"
  }
}
\`\`\`

### Get User Profile
\`\`\`bash
curl http://localhost:3001/api/user/me \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
\`\`\`

### Get Tables
\`\`\`bash
curl http://localhost:3001/api/game/tables \
  -H "Authorization: Bearer [ACCESS_TOKEN]"
\`\`\`

---

## 🔧 PROSSIME FASI

### FASE 2 (Domani):
- ✅ Game Engine completo in azione
- ✅ Distribuzione carte automatica
- ✅ Logica scommesse funzionante
- ✅ Winner calculation
- ✅ Pot management

### FASE 3-4 (Settimana prossima):
- React Native per mobile nativo
- Advanced UI/UX
- Payment integration (Stripe)
- Admin panel

---

## 📁 STRUTTURA PROGETTO

\`\`\`
Poker-apps/
├── backend/
│   ├── src/
│   │   ├── index.ts              # Express server
│   │   ├── database/
│   │   │   ├── connection.ts      # PostgreSQL
│   │   │   └── migrations.sql     # Schema 13 tabelle
│   │   ├── routes/
│   │   │   ├── auth.routes.ts     # Login/Register
│   │   │   ├── user.routes.ts     # Profile
│   │   │   ├── game.routes.ts     # Tables
│   │   │   └── admin.routes.ts    # Admin
│   │   ├── middleware/
│   │   │   └── auth.ts            # JWT
│   │   └── sockets/
│   │       └── game.socket.ts     # WebSocket
│   ├── package.json
│   ├── tsconfig.json
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx              # React entry
│   │   ├── App.jsx               # Main app
│   │   ├── pages/
│   │   │   ├── LoginPage.jsx
│   │   │   ├── LobbyPage.jsx
│   │   │   └── PokerTablePage.jsx
│   │   ├── styles/
│   │   └── components/
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── Dockerfile
│   └── .env
│
├── docker-compose.yml            # Orchestrazione
├── QUICK_START.md               # Setup guide
└── README.md                    # This file
\`\`\`

---

## 🐛 TROUBLESHOOTING

### Errore: "Cannot connect to localhost:3001"
**Soluzione:**
\`\`\`bash
docker-compose down -v
docker-compose up --build
\`\`\`

### Cellulare non vede il PC
**Verifica:**
- ✅ Cellulare e PC sulla stessa WiFi
- ✅ PC firewall non blocca port 3000
- ✅ Usa l'IP corretto (non localhost)

### Port già in uso
\`\`\`bash
# Windows
netstat -ano | findstr :3000
taskkill /PID [PID] /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
\`\`\`

---

## 📊 TECH STACK

| Layer | Tech | Version |
|-------|------|---------|
| **Frontend** | React + Vite | 18.2 + 5.0 |
| **Backend** | Node.js + Express | 18 + 4.18 |
| **Real-time** | Socket.io | 4.5 |
| **Database** | PostgreSQL | 16 |
| **Cache** | Redis | 7 |
| **Container** | Docker | Latest |
| **Language** | TypeScript | 5.0 |

---

## 🎯 PROSSIMI STEP

1. ✅ **Testa da PC localmente** (http://localhost:3000)
2. ✅ **Testa da cellulare** (http://[IP]:3000)
3. ✅ **Conferma funzionamento login/register**
4. ⏳ **Domani: Game Engine in azione**
5. ⏳ **Settimana prossima: Mobile app nativa**

---

## 📞 Support

- Repository: https://github.com/Jokernpl/Poker-apps
- Issues: Crea un issue nel repo
- Documentazione: Vedi QUICK_START.md

---

**Buon Poker! ♠️♥️♦️♣️**

*Creato per amici - No heavy legal constraints*
