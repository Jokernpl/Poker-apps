# 🚀 SETUP REPOSITORY GITHUB

Questa guida ti spiega come creare il repo GitHub privato e pushare il codice.

---

## Step 1: Crea il Repository su GitHub

1. Vai a https://github.com/new
2. **Repository name**: `poker-app` (o nome di tua scelta)
3. **Visibility**: Seleziona `Private` 🔒
4. **Initialize repository**: Lascia unchecked (abbiamo già il codice)
5. Click "Create repository"

---

## Step 2: Configura Git Locale

### Se non hai ancora configurato Git globalmente:
```bash
git config --global user.name "Il Tuo Nome"
git config --global user.email "tua.email@gmail.com"
```

### Naviga nella cartella del progetto:
```bash
cd poker-app
```

---

## Step 3: Inizializza Git e Configura Remote

```bash
# Inizializza repository git locale
git init

# Aggiungi il remote URL (sostituisci USERNAME)
git remote add origin https://github.com/USERNAME/poker-app.git

# Verifica che il remote sia configurato
git remote -v
# Output atteso:
# origin  https://github.com/USERNAME/poker-app.git (fetch)
# origin  https://github.com/USERNAME/poker-app.git (push)
```

---

## Step 4: Configura Branch Principale

```bash
# Rinomina il branch a "main" (GitHub standard)
git branch -M main
```

---

## Step 5: First Commit e Push

```bash
# Aggiungi tutti i file
git add .

# Visualizza cosa stai per committare
git status

# Crea il primo commit
git commit -m "Initial commit: FASE 1 - Backend skeleton + Auth API"

# Push al repository
git push -u origin main
```

**Se ti chiede password/token:**
- GitHub ha deprecato le password
- Usa **Personal Access Token** (PAT)
- Istruzioni: https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token

---

## Step 6: Configura SSH (Opzionale - Raccomandato)

Per evitare di inserire token ogni volta, usa SSH:

```bash
# Genera chiave SSH (se non la hai)
ssh-keygen -t ed25519 -C "tua.email@gmail.com"

# Accetta il percorso di default e salta la passphrase (o imposta una)
# Copia la chiave pubblica
cat ~/.ssh/id_ed25519.pub

# Vai su GitHub > Settings > SSH and GPG keys > New SSH key
# Incolla la chiave

# Testa la connessione
ssh -T git@github.com

# Se tutto OK, cambia il remote da HTTPS a SSH:
git remote set-url origin git@github.com:USERNAME/poker-app.git

# Verifica:
git remote -v
```

---

## Step 7: Commit e Push Automatici da Ora In Poi

Una volta completato lo setup, ogni volta che vorrai salvare il lavoro:

```bash
# Visualizza cambiamenti
git status

# Aggiungi file modificati
git add .

# Commit con messaggio significativo
git commit -m "FEATURE: Added user authentication routes"

# Push al repository
git push
```

---

## 📋 Commit Strategy Per Questo Progetto

Consiglio questo schema per mantenere la storia ordinata:

```bash
# FEATURE: Nuova funzionalità
git commit -m "FEATURE: Add table creation endpoint"

# FIX: Correzione di bug
git commit -m "FIX: Fix JWT token expiration issue"

# REFACTOR: Miglioramento codice
git commit -m "REFACTOR: Extract database queries into service layer"

# DOCS: Documentazione
git commit -m "DOCS: Update API documentation"

# TEST: Test
git commit -m "TEST: Add unit tests for poker engine"
```

---

## 🔀 Branch Strategy (Opzionale ma Consigliato)

Per un lavoro più ordinato, usa branch separati:

```bash
# Crea un branch per ogni feature
git checkout -b feat/socket-realtime-game

# Lavora sul feature...
git add .
git commit -m "FEATURE: Setup Socket.io and game events"

# Quando è pronto, torna a main e merge
git checkout main
git merge feat/socket-realtime-game

# Push
git push
```

---

## 📊 Verificare il Repository su GitHub

Una volta pushato, vai su https://github.com/USERNAME/poker-app

Dovresti vedere:
- ✅ Tutti i file e cartelle
- ✅ `.gitignore` funzionante (node_modules non present)
- ✅ Commit history con il tuo primo commit
- ✅ Impostazioni di privacy (Private)

---

## 🔐 Proteggere il Repository (Best Practice)

1. Vai su **Settings** > **Branches**
2. Clicca **Add rule** per il branch `main`
3. Abilita:
   - ✅ Require a pull request before merging
   - ✅ Dismiss stale pull request approvals
   - ✅ Require status checks to pass

---

## ✅ Checklist GitHub Setup

- [ ] Repository privato creato su GitHub
- [ ] Git configurato localmente (`git config user.name`, `user.email`)
- [ ] Remote `origin` aggiunto
- [ ] Primo commit eseguito
- [ ] Push riuscito (visualizzi i file su GitHub)
- [ ] SSH configurato (opzionale ma raccomandato)

---

## 🆘 Problemi Comuni

### "fatal: remote origin already exists"
```bash
git remote remove origin
git remote add origin https://github.com/USERNAME/poker-app.git
```

### "Authentication failed"
Usa Personal Access Token invece di password. Vedi sopra.

### "Permission denied (publickey)"
Se usi SSH, assicurati che la chiave sia aggiunta al ssh-agent:
```bash
ssh-add ~/.ssh/id_ed25519
```

---

Una volta fatto questo, sei pronto a iniziare lo sviluppo! 🚀

Prossimo step: Implementare il backend Express skeleton + API auth
