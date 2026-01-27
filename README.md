# Student Management System

מערכת ניהול תלמידים חכמה ומתקדמת בעברית - מערכת מלאה עם React Frontend ו-NestJS Backend.

## 🔗 קישורים חיצוניים

- **📦 math-tutor-app** - המערכת המקורית: [https://github.com/yanivmizrachiy/math-tutor-app](https://github.com/yanivmizrachiy/math-tutor-app)
- **📚 מאגר זה**: [https://github.com/yanivmizrachiy/student-management-system](https://github.com/yanivmizrachiy/student-management-system)
- **🔄 מדריך סנכרון**: [README_SYNC.md](README_SYNC.md)

> 💡 **רוצה לייבא נתונים מ-math-tutor-app?** השתמש ב-[סקריפט הסנכרון](#-סנכרון-נתונים-מ-math-tutor-app) לייבוא אוטומטי!

## 🎨 תכונות UI/UX

- ✅ דף כניסה עם רקע סגול כהה, טקסט לבן, וכותרות "מערכת חכמה לניהול תלמידים"
- ✅ שלושה כפתורים תלת-ממדיים לכיתות (ז', ח', ט') עם מונים חיים של תלמידים
- ✅ דף כיתה: רשימת קבוצות עם שם מורה ומונה תלמידים חי
- ✅ דף קבוצה: טבלה אינטראקטיבית (סגנון כהה-לבן) עם חיפוש, סינון, מיון, מונה חי, וגרפים לציונים ונוכחות
- ✅ דף תלמיד: פרופיל מלא (שם, כיתה, קבוצה, מורה, תמונת פרופיל, ציונים, נוכחות, הערות, קבצים), Audit Trail של שינויים
- ✅ אנימציות: מעברים parallax, אפקטי זוהר ב-hover, fade-ins חלקים

## ⚙️ Stack טכני

- **Frontend**: React + TypeScript + Vite
- **Backend**: NestJS + TypeScript
- **Database**: PostgreSQL עם סכמות קפדניות, אינדקסים לחיפוש בעברית, אחסון קבצים
- **Real-time**: WebSocket (Socket.IO) לעדכונים חיים
- **ETL**: ייבוא מ-Excel עם ולידציה ודיווח שגיאות
- **Smart Search**: NLP בעברית, תיקון שגיאות כתיב, שאילתות טבעיות
- **Charts**: ECharts עם אנימציות

## 🗂 מודל נתונים

- **Students**: StudentID, FirstName, LastName, GradeID, GroupID, TeacherID, Status, ProfileImageURL, CreatedAt/UpdatedAt
- **Grades**: GradeID, Name, StudentCount
- **Groups**: GroupID, Name, GradeID, TeacherID, StudentCount, Description
- **Teachers**: TeacherID, Name, Role, Email
- **Assessments**: AssessmentID, StudentID, GroupID, Metric (1–5), Value, Date, Notes
- **Attendance**: AttendanceID, StudentID, Date, Status (Present/Absent/Late), Notes
- **Files**: FileID, StudentID, Type, URL, Size, MIME Type, UploadedAt
- **AuditTrail**: LogID, Entity, EntityID, Field, OldValue, NewValue, UserID, Timestamp

## 🔐 אבטחה והרשאות

- **אין צורך בהתחברות** - המערכת פתוחה לכולם
- **אין צורך בסיסמה** - גישה חופשית
- Audit Trail לכל שינוי

## 📡 API Endpoints

- **Auth**: `/auth/login` (ללא סיסמה - רק אימייל)
- **Grades**: `/grades`, `/grades/{id}` (ציבורי)
- **Groups**: `/groups`, `/groups/{id}` (ציבורי)
- **Students**: `/students`, `/students/{id}` (ציבורי)
- **Assessments**: `/assessments`, `/assessments/{id}`
- **Attendance**: `/attendance`, `/attendance/{id}`
- **Files**: `/files`, `/files/{id}`
- **Audit**: `/audit`
- **Search**: `/search`
- **Reports**: `/reports`
- **ETL**: `/etl/import/students`
- **Real-time**: WebSocket `/live` (channels: grades, groups, students, reports)

## 📊 דוחות וגרפים

- **רמת בית ספר**: גרף עוגה של תלמידים לפי כיתה, גרף קו של מספר תלמידים לאורך זמן
- **רמת כיתה**: גרף עמודות של תלמידים לכל קבוצה, גרף קו של ממוצע ציונים
- **רמת קבוצה**: גרף עוגה של נוכחות (נוכח/נעדר/מאחר), היסטוגרמה של התפלגות ציונים
- **רמת תלמיד**: גרף קו של ציונים לאורך זמן, גרף עמודות של נוכחות לפי יום

## 🛠 התקנה והרצה

### דרישות מוקדמות

- Node.js 20+
- PostgreSQL 15+
- Docker Desktop (להרצת PostgreSQL)
- npm או yarn

### Backend

```bash
cd backend
npm install

# יצירת קובץ .env (ראה .env.example)
cp .env.example .env
# ערוך את .env עם הפרטים שלך

# הרצת PostgreSQL עם Docker
docker-compose up -d

# הרצת השרת
npm run start:dev
```

השרת יעלה על `http://localhost:3001`  
תיעוד Swagger זמין ב: `http://localhost:3001/api`

### Frontend

```bash
cd frontend
npm install
npm run dev
```

האפליקציה תעלה על `http://localhost:8080`

### הפעלה מהירה

```powershell
.\FIX_AND_START.ps1
```

סקריפט זה:
1. מפעיל את Docker Desktop
2. מפעיל את PostgreSQL
3. מפעיל את Backend
4. מפעיל את Frontend
5. פותח את הדפדפן

## 🔄 סנכרון נתונים מ-math-tutor-app

אם יש לך נתונים קיימים ב-**[math-tutor-app](https://github.com/yanivmizrachiy/math-tutor-app)** (Cloudflare D1), אתה יכול לייבא אותם אוטומטית!

> 📦 **עדיין לא הורדת את math-tutor-app?**  
> שכפל אותו מכאן: `git clone https://github.com/yanivmizrachiy/math-tutor-app.git`

### Windows (PowerShell):
```powershell
# הפעלה עם סנכרון אוטומטי
.\FIX_AND_START.ps1 --sync

# או סנכרון ידני
.\scripts\sync-from-cloudflare.ps1
```

### Linux/Mac:
```bash
# סנכרון ידני
./scripts/sync-from-cloudflare.sh ../math-tutor-app
```

### מה הסקריפט עושה?
1. ✅ מתחבר ל-Cloudflare
2. ✅ מייצא את כל התלמידים, שיעורים, תשלומים
3. ✅ יוצר גיבוי של המסד הנוכחי
4. ✅ ממיר את הנתונים לפורמט התואם
5. ✅ מכניס למסד הנתונים PostgreSQL

### Dry Run (בדיקה בלבד):
```powershell
.\scripts\sync-from-cloudflare.ps1 -DryRun
```
זה יראה לך מה יקרה **בלי לשנות כלום**!

📖 **למדריך מפורט ראה:** [README_SYNC.md](README_SYNC.md)

## 🗺 Navigation

- `/login` - דף כניסה עם כפתורי שכבות
- `/grades` - דף שכבות (אוטומטית נבחרת שכבה ראשונה)
- `/grades?gradeId=<id>` - דף שכבה ספציפית
- `/group/<groupId>` - דף קבוצה
- `/student/<studentId>` - דף תלמיד

## 📁 מבנה הפרויקט

```
studend_managment_new/
├── backend/              # NestJS Backend
│   ├── src/
│   │   ├── auth/        # Authentication (ללא סיסמה)
│   │   ├── students/    # Students module
│   │   ├── grades/     # Grades module
│   │   ├── groups/      # Groups module
│   │   ├── assessments/ # Assessments module
│   │   ├── attendance/  # Attendance module
│   │   ├── files/        # File management
│   │   ├── audit/       # Audit trail
│   │   ├── search/      # Smart search
│   │   ├── reports/     # Reports & statistics
│   │   ├── etl/         # Excel import
│   │   └── realtime/    # WebSocket gateway
│   ├── docker-compose.yml
│   └── Dockerfile
├── frontend/            # React Frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   │   ├── LoginPage.tsx
│   │   │   ├── GradePage.tsx
│   │   │   ├── GroupPage.tsx
│   │   │   └── StudentPage.tsx
│   │   ├── components/  # Reusable components
│   │   ├── services/    # API client & WebSocket
│   │   └── store/       # State management (Zustand)
│   └── Dockerfile
├── FIX_AND_START.ps1    # סקריפט הפעלה מהירה
└── README.md
```

## ✅ תכונות שהושלמו

✅ כל ה-Backend APIs  
✅ כל ה-Frontend pages  
✅ Authentication ללא סיסמה  
✅ Audit Trail  
✅ WebSocket Real-time updates  
✅ Charts & Reports (pie, line, bar, histogram)  
✅ Smart Search בעברית  
✅ ETL לייבוא Excel  
✅ File Upload עם Signed URLs  
✅ Database indexes לחיפוש בעברית  
✅ Docker deployment configs  
✅ כל הלחצנים עובדים  
✅ Navigation מלא בין כל הדפים  

## 🚀 Deployment

### Docker

```bash
# Backend
cd backend
docker-compose up -d

# Frontend
cd frontend
docker build -t student-management-frontend .
docker run -p 80:80 student-management-frontend
```

### Production

המערכת מוכנה ל-deployment ב-Vercel (Frontend) ו-Railway/Render (Backend).

## 📝 הערות חשובות

- **אין צורך בהתחברות** - המערכת פתוחה לכולם
- **אין צורך בסיסמה** - רק אימייל (אופציונלי)
- כל הנתונים נשמרים ב-PostgreSQL
- Real-time updates דרך WebSocket
- כל השינויים נרשמים ב-Audit Trail

## 🧪 בדיקות

- ✅ בדיקות פונקציונליות: כל הדפים והתכונות
- ✅ בדיקות ביצועים: אנימציות 60fps, עדכוני גרפים <1s
- ✅ בדיקות real-time: מונים וגרפים מתעדכנים מיידית
- ✅ בדיקות אינטגרציה: זרימה מלאה (כניסה → כיתה → קבוצה → תלמיד)

## ניהול

**Managed by Yaniv Raz**

## רישיון

MIT
