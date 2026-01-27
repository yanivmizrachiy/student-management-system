# 🚀 מדריך הפעלה מהירה - Smart Student Management System

## ✅ דרישות מוקדמות

לפני שמתחילים, ודא שמותקן:

1. **Node.js 18+** - [הורד כאן](https://nodejs.org/)
   ```bash
   node --version  # צריך להיות 18.0.0 ומעלה
   ```

2. **Docker Desktop** - [הורד כאן](https://www.docker.com/products/docker-desktop)
   - לאחר התקנה, הפעל את Docker Desktop
   - ודא שהוא רץ (סמל כחול במגש)

3. **Git** - [הורד כאן](https://git-scm.com/)

---

## 📥 שלב 1: שכפול הפרויקט

```bash
git clone https://github.com/yanivmizrachiy/student-management-system.git
cd student-management-system
```

---

## 🎯 שלב 2: הפעלה אוטומטית (מומלץ!)

### Windows (PowerShell):
```powershell
.\FIX_AND_START.ps1
```

הסקריפט יבצע אוטומטית:
- ✅ יצירת קבצי `.env`
- ✅ התקנת כל התלויות
- ✅ הפעלת Docker ו-PostgreSQL
- ✅ הפעלת Backend ו-Frontend
- ✅ פתיחת הדפדפן

**זהו! המערכת תעלה אוטומטית על: http://localhost:8080**

---

## 🛠️ שלב 3: הפעלה ידנית (אם הסקריפט לא עובד)

### 3.1 הכנה

```bash
# יצירת קבצי .env
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 3.2 התקנת תלויות Backend

```bash
cd backend
npm install
```

### 3.3 התקנת תלויות Frontend

```bash
cd ../frontend
npm install
```

### 3.4 הפעלת PostgreSQL

מתוך תיקיית הפרויקט הראשית:
```bash
cd backend
docker-compose up -d
```

בדוק שהמסד נתונים רץ:
```bash
docker ps
# צריך לראות: student_management_postgres
```

### 3.5 הפעלת Backend

פתח חלון טרמינל חדש:
```bash
cd backend
npm run start:dev
```

המתן עד שתראה:
```
🚀 Server running on http://localhost:3001
📚 API Documentation: http://localhost:3001/api
```

### 3.6 הפעלת Frontend

פתח חלון טרמינל חדש:
```bash
cd frontend
npm run dev
```

המתן עד שתראה:
```
Local: http://localhost:8080
```

---

## 🌐 גישה למערכת

| שירות | כתובת | תיאור |
|-------|--------|-------|
| **אפליקציה** | http://localhost:8080 | הממשק הראשי |
| **Backend API** | http://localhost:3001 | REST API |
| **API Docs** | http://localhost:3001/api | Swagger Documentation |
| **Database** | localhost:5432 | PostgreSQL |

### פרטי התחברות למסד נתונים:
- **Host:** localhost
- **Port:** 5432
- **Username:** postgres
- **Password:** postgres
- **Database:** student_management

---

## 🐛 פתרון בעיות

### ❌ שגיאה: "Port 3001 already in use"

```bash
# Windows
Get-Process -Id (Get-NetTCPConnection -LocalPort 3001).OwningProcess | Stop-Process -Force

# macOS/Linux
lsof -ti:3001 | xargs kill -9
```

### ❌ שגיאה: "Port 8080 already in use"

```bash
# Windows
Get-Process -Id (Get-NetTCPConnection -LocalPort 8080).OwningProcess | Stop-Process -Force

# macOS/Linux
lsof -ti:8080 | xargs kill -9
```

### ❌ Docker לא עולה

1. ודא ש-Docker Desktop מותקן ורץ
2. הפעל מחדש את Docker Desktop
3. נסה:
   ```bash
   docker-compose down
   docker-compose up -d
   ```

### ❌ שגיאות npm install

```powershell
# Windows PowerShell
Remove-Item -Recurse -Force node_modules, package-lock.json -ErrorAction SilentlyContinue
npm install

# macOS/Linux
rm -rf node_modules package-lock.json
npm install
```

### ❌ Backend לא מתחבר למסד נתונים

1. בדוק ש-PostgreSQL רץ:
   ```bash
   docker ps
   ```

2. בדוק את קובץ `backend/.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=student_management
   ```

3. נסה לאתחל את מסד הנתונים:
   ```bash
   cd backend
   docker-compose down
   docker-compose up -d
   ```

---

## 📊 בדיקה שהכל עובד

1. פתח דפדפן: http://localhost:8080
2. צריך לראות דף כניסה עם 3 כפתורים (כיתות ז', ח', ט')
3. לחץ על אחד מהכפתורים
4. צריך לראות רשימת קבוצות
5. לחץ על קבוצה
6. צריך לראות טבלת תלמידים

### בדיקת API:
פתח דפדפן: http://localhost:3001/api
צריך לראות תיעוד Swagger עם כל ה-endpoints

---

## 🛑 עצירת המערכת

### עצירה מלאה:
```bash
# עצור את Backend ו-Frontend (Ctrl+C בחלונות הטרמינל)

# עצור את PostgreSQL
cd backend
docker-compose down
```

### עצירת כל תהליכי Node:
```powershell
# Windows
Get-Process node | Stop-Process -Force
```

---

## 🔄 הפעלה מחדש

אחרי עצירה, להפעלה מחדש:

```bash
# 1. הפעל PostgreSQL
cd backend
docker-compose up -d

# 2. הפעל Backend (חלון חדש)
cd backend
npm run start:dev

# 3. הפעל Frontend (חלון חדש)
cd frontend
npm run dev
```

או פשוט הרץ שוב:
```powershell
.\FIX_AND_START.ps1
```

---

## 📝 הערות חשובות

- ✅ **אין צורך בהתחברות** - המערכת פתוחה לכולם
- ✅ **אין צורך בסיסמה** - גישה חופשית לכל התכונות
- ✅ המערכת תיצור אוטומטית את טבלאות מסד הנתונים בהפעלה הראשונה
- ✅ כל השינויים נשמרים אוטומטית
- ✅ עדכונים בזמן אמת דרך WebSocket

---

## 🎓 שימוש ראשוני

1. המערכת מגיעה ללא נתונים - היא ריקה
2. תוכל להוסיף:
   - שכבות (Grades)
   - קבוצות (Groups)
   - תלמידים (Students)
   - ציונים (Assessments)
   - נוכחות (Attendance)

3. לייבוא מרובה של תלמידים:
   - השתמש ב-API: `POST /etl/import/students`
   - או צור ידנית דרך הממשק

---

## 📞 תמיכה

אם יש בעיה:
1. בדוק את הלוגים בחלונות הטרמינל
2. בדוק את ה-README הראשי
3. בדוק את Swagger Docs: http://localhost:3001/api

**Managed by Yaniv Raz**
