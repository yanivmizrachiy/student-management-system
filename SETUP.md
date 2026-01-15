# Setup Guide - Smart Student Management System

## התקנה מהירה

### 1. Backend Setup

```bash
cd backend
npm install

# יצירת קובץ .env
cp .env.example .env
# ערוך את .env עם הפרטים שלך:
# - DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD, DB_NAME
# - JWT_SECRET (מינימום 32 תווים)
# - FRONTEND_URL

# הרצת השרת
npm run start:dev
```

השרת יעלה על `http://localhost:3001`
תיעוד API: `http://localhost:3001/api`

### 2. Frontend Setup

```bash
cd frontend
npm install

# יצירת קובץ .env (אופציונלי)
echo "VITE_API_URL=http://localhost:3001" > .env

# הרצת האפליקציה
npm run dev
```

האפליקציה תעלה על `http://localhost:3000`

### 3. יצירת משתמש Manager

```bash
# דרך API או ישירות ב-DB
# Manager צריך להיות עם:
# - email: yaniv@example.com (או כפי שמוגדר)
# - role: 'manager'
```

## תכונות עיקריות

### ✅ UI/UX
- דף התחברות עם רקע סגול כהה וטקסט לבן
- כפתורים תלת-ממדיים לכיתות עם מונים חיים
- דפי כיתה/קבוצה/תלמיד עם Bootstrap 5
- כל הטקסטים בעברית
- אנימציות חלקות עם Framer Motion

### ✅ Backend
- כל ה-API endpoints
- Authentication & Authorization
- Permissions: רק Manager (Yaniv) יכול לערוך
- Real-time updates עם WebSocket
- ETL לייבוא Excel
- Smart Search בעברית
- Reports עם כל הגרפים

### ✅ Charts
- גרף עוגה לנוכחות
- גרף קו לציונים לאורך זמן
- גרף עמודות לנוכחות
- היסטוגרמה להתפלגות ציונים

## הרשאות

- **Manager (Yaniv)**: יכול לערוך, להוסיף, למחוק
- **אחרים**: קריאה בלבד (read-only)

כפתורי עריכה מופיעים רק למנהל.

## פתרון בעיות

### שגיאת חיבור ל-DB
- ודא ש-PostgreSQL רץ
- בדוק את פרטי החיבור ב-.env
- ודא שהמסד נתונים קיים

### שגיאת CORS
- ודא ש-FRONTEND_URL ב-.env נכון
- בדוק את הגדרות CORS ב-main.ts

### WebSocket לא עובד
- ודא שה-token נשמר נכון
- בדוק את חיבור ה-WebSocket ב-console
- ודא שה-backend רץ

## תמיכה

**Managed by Yaniv Raz**

