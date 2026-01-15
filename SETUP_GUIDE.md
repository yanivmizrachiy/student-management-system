# מדריך התקנה מלא - Smart Student Management System

## 📋 דרישות מוקדמות

- Node.js 20+ 
- PostgreSQL 15+
- npm או yarn
- Git

## 🚀 התקנה מהירה

### 1. שכפול הפרויקט

```bash
git clone <repository-url>
cd studend_managment_new
```

### 2. Backend Setup

```bash
cd backend

# התקנת dependencies
npm install

# יצירת קובץ .env
cp .env.example .env

# עריכת .env עם הפרטים שלך
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=postgres
# DB_NAME=student_management
# JWT_SECRET=your-secret-key-change-in-production
# MANAGER_EMAIL=yaniv@example.com
# MANAGER_PASSWORD=change-me

# יצירת מסד נתונים PostgreSQL
# psql -U postgres
# CREATE DATABASE student_management;

# הרצת השרת
npm run start:dev
```

השרת יעלה על `http://localhost:3001`
תיעוד Swagger: `http://localhost:3001/api`

### 3. Frontend Setup

```bash
cd frontend

# התקנת dependencies
npm install

# יצירת קובץ .env
cp .env.example .env

# הרצת האפליקציה
npm run dev
```

האפליקציה תעלה על `http://localhost:3000`

## 🐳 Docker Setup (אופציונלי)

### Backend + PostgreSQL

```bash
cd backend
docker-compose up -d
```

### Frontend

```bash
cd frontend
docker build -t student-management-frontend .
docker run -p 80:80 student-management-frontend
```

## 👤 יצירת משתמש ראשון

המערכת יוצרת אוטומטית משתמש Manager (Yaniv Raz) בהרצה הראשונה.

**פרטי התחברות ברירת מחדל:**
- Email: `yaniv@example.com`
- Password: `change-me` (או מה שמוגדר ב-MANAGER_PASSWORD)

**⚠️ חשוב:** שנה את הסיסמה מיד לאחר ההתקנה הראשונה!

## 📊 מבנה מסד הנתונים

המערכת יוצרת אוטומטית את כל הטבלאות בהרצה הראשונה (synchronize: true).

### טבלאות עיקריות:
- `users` - משתמשים
- `grades` - שכבות
- `groups` - קבוצות
- `students` - תלמידים
- `assessments` - הערכות
- `attendance` - נוכחות
- `files` - קבצים
- `audit_logs` - לוג שינויים

## 🔐 הרשאות

- **Manager (Yaniv Raz)**: הרשאות עריכה מלאות (CRUD)
- **אחרים**: גישה לקריאה בלבד (Read-only)

## 📝 ייבוא מ-Excel

1. הכנת קובץ Excel עם העמודות הבאות:
   - `firstName` - שם פרטי
   - `lastName` - שם משפחה
   - `studentId` - מספר תלמיד (ייחודי)
   - `gradeName` - שם שכבה
   - `groupName` - שם קבוצה
   - `teacherId` - ID מורה (אופציונלי)
   - `status` - סטטוס (active/inactive/graduated)

2. העלאת הקובץ דרך API:
   ```bash
   POST /etl/import/students
   Content-Type: multipart/form-data
   file: <excel-file>
   ```

## 🧪 בדיקות

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🐛 פתרון בעיות

### שגיאת חיבור למסד נתונים
- ודא ש-PostgreSQL רץ
- בדוק את פרטי החיבור ב-.env
- ודא שמסד הנתונים נוצר

### שגיאת CORS
- ודא ש-FRONTEND_URL ב-.env תואם לכתובת Frontend
- בדוק את הגדרות CORS ב-main.ts

### שגיאת WebSocket
- ודא שהשרת רץ על הפורט הנכון
- בדוק את הגדרות Socket.IO

## 📞 תמיכה

לשאלות ותמיכה, פנה ל-Yaniv Raz

## ✅ רשימת בדיקה לאחר התקנה

- [ ] Backend רץ על פורט 3001
- [ ] Frontend רץ על פורט 3000
- [ ] מסד נתונים מחובר
- [ ] משתמש Manager נוצר
- [ ] התחברות עובדת
- [ ] WebSocket מחובר
- [ ] API Documentation נגיש

## 🎉 סיום!

המערכת מוכנה לשימוש!

**Managed by Yaniv Raz**
