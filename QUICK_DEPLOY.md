# ⚡ פריסה מהירה - 3 שלבים פשוטים

## 🎯 שלב 1: Backend ב-Railway (2 דקות)

1. לך ל: **https://railway.app** → התחבר עם GitHub
2. **New Project** → **Deploy from GitHub repo** → בחר `backend`
3. **+ New** → **Database** → **Add PostgreSQL** (אוטומטי!)
4. ב-**Variables** הוסף:
   ```
   NODE_ENV=production
   JWT_SECRET=your-secret-key-32-chars-minimum
   FRONTEND_URL=https://your-frontend.vercel.app
   ```
5. **העתק את ה-URL** של ה-Backend (לדוגמה: `https://xxx.railway.app`)

---

## 🎨 שלב 2: Frontend ב-Vercel (2 דקות)

1. לך ל: **https://vercel.com** → התחבר עם GitHub
2. **Add New Project** → בחר repository → **Root Directory:** `frontend`
3. ב-**Environment Variables** הוסף:
   ```
   VITE_API_URL=https://xxx.railway.app
   ```
   (החלף עם ה-URL מ-Railway)
4. **Deploy** → חכה 2 דקות
5. **העתק את ה-URL** של ה-Frontend (לדוגמה: `https://xxx.vercel.app`)

---

## 🔗 שלב 3: עדכון CORS (1 דקה)

1. חזור ל-**Railway** → Backend → **Variables**
2. עדכן:
   ```
   FRONTEND_URL=https://xxx.vercel.app
   ALLOWED_ORIGINS=https://xxx.vercel.app
   ```
3. ה-Backend יתחיל מחדש אוטומטית

---

## ✅ סיימת!

**האתר שלך חי:** `https://xxx.vercel.app` 🎉

**API Documentation:** `https://xxx.railway.app/api`

---

## 🔑 התחברות

- Email: `yaniv@example.com`
- Password: `change-me`

**⚠️ חשוב:** שנה את הסיסמה אחרי ההתחברות הראשונה!
