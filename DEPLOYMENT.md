# 🚀 Production Deployment Guide

## Overview
This guide will help you deploy the Student Management System to production.

**Frontend:** Vercel  
**Backend:** Railway (or Render)  
**Database:** Railway PostgreSQL

---

## 🎯 Quick Start

### Option 1: Automatic (GitHub Actions)
1. Set up secrets in GitHub
2. Push to `main` branch
3. Auto-deploys! ✅

### Option 2: Manual CLI
```bash
# Frontend
cd frontend
npm run build
vercel --prod

# Backend
cd backend
railway up
```

---

## 📝 Step-by-Step Setup

### 1️⃣ Frontend - Vercel

**A. Create Vercel Project:**
1. Go to https://vercel.com
2. Import your GitHub repo
3. Select `frontend` as root directory
4. Set build command: `npm run build`
5. Set output directory: `dist`

**B. Environment Variables (Vercel Dashboard):**
```env
VITE_API_URL=https://your-backend.up.railway.app
VITE_WS_URL=wss://your-backend.up.railway.app
```

**C. Get Vercel Tokens (for GitHub Actions):**
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Get tokens
vercel whoami
```

Add to GitHub Secrets:
- `VERCEL_TOKEN` - from `~/.vercel/auth.json`
- `VERCEL_ORG_ID` - from project settings
- `VERCEL_PROJECT_ID` - from project settings

---

### 2️⃣ Backend - Railway

**A. Create Railway Project:**
1. Go to https://railway.app
2. Create new project
3. Add PostgreSQL database
4. Add service from GitHub repo
5. Select `backend` as root directory

**B. Environment Variables (Railway Dashboard):**
```env
DB_HOST=${{POSTGRES.HOST}}
DB_PORT=${{POSTGRES.PORT}}
DB_USERNAME=${{POSTGRES.USER}}
DB_PASSWORD=${{POSTGRES.PASSWORD}}
DB_NAME=${{POSTGRES.DATABASE}}
JWT_SECRET=your-super-secret-key-min-32-chars
NODE_ENV=production
PORT=3001
FRONTEND_URL=https://your-app.vercel.app
```

**C. Set Build & Start Commands:**
- **Build:** `npm ci && npm run build`
- **Start:** `npm run start:prod`

**D. Get Railway Token (for GitHub Actions):**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Get token
railway whoami
```

Add to GitHub Secrets:
- `RAILWAY_TOKEN` - from Railway dashboard

---

### 3️⃣ Database Setup

**Option A: Railway PostgreSQL (Recommended)**
1. Add PostgreSQL in Railway dashboard
2. Railway auto-creates database
3. Environment variables auto-populated
4. Run migrations:
   ```bash
   railway run npm run typeorm migration:run
   ```

**Option B: External PostgreSQL (Supabase, Neon, etc.)**
1. Create database instance
2. Get connection string
3. Add to Railway environment variables

---

### 4️⃣ GitHub Secrets Setup

Add these secrets to GitHub repository:
- Settings → Secrets and variables → Actions → New repository secret

**Vercel:**
- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `VITE_API_URL`
- `VITE_WS_URL`

**Railway:**
- `RAILWAY_TOKEN`

---

## 🔄 Deployment Workflow

### Automatic (GitHub Actions):
```bash
git add .
git commit -m "deploy: new features"
git push origin main
```
→ GitHub Actions auto-deploys ✅

### Manual:
```bash
# Frontend
cd frontend
vercel --prod

# Backend
cd backend
railway up
```

---

## 🌐 Your Production URLs

After deployment, you'll have:

📱 **Frontend:** `https://student-management-xxx.vercel.app`  
⚙️ **Backend API:** `https://your-backend.up.railway.app`  
📚 **API Docs:** `https://your-backend.up.railway.app/api`

---

## 🔒 Security Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Set strong JWT_SECRET (min 32 chars)
- [ ] Enable HTTPS only
- [ ] Set up CORS properly
- [ ] Review environment variables
- [ ] Enable rate limiting (optional)
- [ ] Set up monitoring (optional)

---

## 📊 Post-Deployment

### Check Health:
```bash
# Frontend
curl https://your-app.vercel.app

# Backend
curl https://your-backend.up.railway.app/api/health
```

### View Logs:
```bash
# Vercel
vercel logs

# Railway
railway logs
```

### Run Database Migrations:
```bash
railway run npm run typeorm migration:run
```

---

## 🆘 Troubleshooting

### Frontend not loading?
- Check Vercel build logs
- Verify environment variables
- Check VITE_API_URL is correct

### Backend not connecting to DB?
- Check Railway logs
- Verify DB environment variables
- Check PostgreSQL is running

### CORS errors?
- Verify FRONTEND_URL in backend .env
- Check CORS settings in backend/src/main.ts

### Can't connect to API?
- Verify API URL in frontend .env
- Check Railway service is running
- Test API directly: `curl https://your-backend.up.railway.app/api/health`

---

## 🔄 Updates & Rollbacks

### Deploy new version:
```bash
git push origin main
```

### Rollback (Vercel):
```bash
vercel rollback
```

### Rollback (Railway):
Use Railway dashboard → Deployments → Redeploy previous

---

## 💰 Cost Estimate

**Free Tier:**
- Vercel: Free (hobby)
- Railway: $5/month credit (then ~$10-20/month)

**Total:** ~$0-20/month

---

## 📞 Support

If you need help:
1. Check logs (Vercel + Railway dashboards)
2. Review this guide
3. Check GitHub Actions logs
4. Contact support (Vercel/Railway)

**Managed by Yaniv Raz**
