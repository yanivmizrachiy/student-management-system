# 🚀 הוראות פריסה מיידית - מערכת ניהול תלמידים

## פריסה מהירה ב-5 דקות!

### שלב 1: פריסת Backend ב-Railway (מומלץ) או Render

#### אופציה A: Railway (מומלץ - הכי קל)

1. **היכנס ל-Railway:**
   - לך ל: https://railway.app
   - התחבר עם GitHub

2. **צור פרויקט חדש:**
   - לחץ על "New Project"
   - בחר "Deploy from GitHub repo"
   - בחר את ה-repository שלך
   - בחר את התיקייה `backend`

3. **הוסף PostgreSQL:**
   - לחץ על "+ New"
   - בחר "Database" → "Add PostgreSQL"
   - Railway ייצור אוטומטית משתני סביבה

4. **הגדר משתני סביבה:**
   - לחץ על ה-service של Backend
   - לך ל-"Variables" tab
   - הוסף את המשתנים הבאים:
     ```
     NODE_ENV=production
     PORT=3001
     JWT_SECRET=your-super-secret-jwt-key-min-32-chars-here
     JWT_EXPIRES_IN=7d
     FRONTEND_URL=https://your-frontend-url.vercel.app
     ```
   - Railway כבר הוסיף אוטומטית: `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME`

5. **Deploy:**
   - Railway יתחיל לבנות ולהריץ אוטומטית
   - חכה שהפריסה תסתיים
   - העתק את ה-URL של ה-API (לדוגמה: `https://your-backend.railway.app`)

#### אופציה B: Render

1. **היכנס ל-Render:**
   - לך ל: https://render.com
   - התחבר עם GitHub

2. **צור Web Service:**
   - לחץ על "New +" → "Web Service"
   - בחר את ה-repository שלך
   - הגדר:
     - **Name:** student-management-backend
     - **Root Directory:** backend
     - **Build Command:** `npm install && npm run build`
     - **Start Command:** `npm run start:prod`
     - **Environment:** Node

3. **הוסף PostgreSQL:**
   - לחץ על "New +" → "PostgreSQL"
   - Render ייצור אוטומטית משתני סביבה

4. **הגדר משתני סביבה:**
   ```
   NODE_ENV=production
   PORT=3001
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars-here
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

5. **Deploy:**
   - Render יתחיל לבנות ולהריץ אוטומטית
   - העתק את ה-URL של ה-API

---

### שלב 2: פריסת Frontend ב-Vercel (הכי קל ומהיר!)

1. **היכנס ל-Vercel:**
   - לך ל: https://vercel.com
   - התחבר עם GitHub

2. **צור פרויקט חדש:**
   - לחץ על "Add New..." → "Project"
   - בחר את ה-repository שלך
   - הגדר:
     - **Framework Preset:** Vite
     - **Root Directory:** `frontend`
     - **Build Command:** `npm run build`
     - **Output Directory:** `dist`

3. **הגדר משתני סביבה:**
   - לחץ על "Environment Variables"
   - הוסף:
     ```
     VITE_API_URL=https://your-backend-url.railway.app
     ```
     (החלף עם ה-URL של ה-Backend שיצרת בשלב 1)

4. **Deploy:**
   - לחץ על "Deploy"
   - Vercel יתחיל לבנות ולהריץ אוטומטית
   - חכה שהפריסה תסתיים (2-3 דקות)
   - **העתק את ה-URL של ה-Frontend** (לדוגמה: `https://your-app.vercel.app`)

---

### שלב 3: עדכון CORS ב-Backend

1. **חזור ל-Railway/Render:**
   - לך ל-Variables של ה-Backend
   - עדכן את `FRONTEND_URL` ל-URL של ה-Frontend מ-Vercel:
     ```
     FRONTEND_URL=https://your-app.vercel.app
     ```
   - הוסף גם:
     ```
     ALLOWED_ORIGINS=https://your-app.vercel.app
     ```

2. **Redeploy:**
   - ה-Backend יתחיל מחדש אוטומטית עם ההגדרות החדשות

---

### שלב 4: יצירת משתמש מנהל

1. **התחבר ל-Backend:**
   - לך ל: `https://your-backend-url.railway.app/api`
   - זה יפתח את Swagger UI

2. **צור משתמש:**
   - השתמש ב-endpoint `/auth/register` (אם קיים)
   - או צור משתמש ישירות במסד הנתונים

---

## ✅ בדיקה סופית

1. **פתח את ה-Frontend:**
   - לך ל: `https://your-app.vercel.app`
   - בדוק שהדף נטען

2. **בדוק התחברות:**
   - נסה להתחבר עם:
     - Email: `yaniv@example.com`
     - Password: `change-me`

3. **בדוק API:**
   - לך ל: `https://your-backend-url.railway.app/api`
   - בדוק שהתיעוד נטען

---

## 🔗 קישורים שימושיים

- **Vercel Dashboard:** https://vercel.com/dashboard
- **Railway Dashboard:** https://railway.app/dashboard
- **Render Dashboard:** https://dashboard.render.com

---

## 🐛 פתרון בעיות

### Backend לא עולה
- בדוק את ה-logs ב-Railway/Render
- ודא ש-PostgreSQL רץ
- בדוק שמשתני הסביבה נכונים

### Frontend לא מתחבר ל-Backend
- ודא ש-`VITE_API_URL` ב-Vercel מצביע ל-URL הנכון של ה-Backend
- בדוק שה-CORS מוגדר נכון ב-Backend
- בדוק את ה-console בדפדפן לשגיאות

### שגיאת CORS
- ודא ש-`FRONTEND_URL` ב-Backend מצביע ל-URL הנכון של ה-Frontend
- ודא ש-`ALLOWED_ORIGINS` כולל את ה-URL של ה-Frontend

---

## 🎉 סיום!

אם הכל עובד, האתר שלך חי ופועל ב-production! 🚀

**קישור לאתר:** `https://your-app.vercel.app`
**קישור ל-API:** `https://your-backend-url.railway.app/api`
