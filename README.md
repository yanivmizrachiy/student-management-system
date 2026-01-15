# Smart Student Management System

מערכת ניהול תלמידים חכמה ומתקדמת בעברית.

## 🎨 תכונות UI/UX

- ✅ דף התחברות עם רקע סגול כהה, טקסט לבן, וכותרות "Smart Student Management System"
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

- רק **Manager (Yaniv)** יכול לערוך, להוסיף, למחוק, לעדכן
- כל המשתמשים האחרים (מורים, תלמידים, הורים, צוות) הם **צופים לקריאה בלבד**
- Authentication: סיסמה + SSO אופציונלי (Google/Microsoft)
- Encryption: TLS 1.3 בתעבורה, AES-256 באחסון
- Signed URLs לקבצים/תמונות
- Audit Trail לכל שינוי

## 📡 API Endpoints

- **Auth**: `/auth/login`, `/auth/logout`
- **Grades**: `/grades`, `/grades/{id}`
- **Groups**: `/groups`, `/groups/{id}`
- **Students**: `/students`, `/students/{id}`
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

## 🧪 בדיקות

- ✅ בדיקות פונקציונליות: כל הדפים והתכונות
- ✅ בדיקות אבטחה: התחברות, הרשאות, הצפנה
- ✅ בדיקות ביצועים: אנימציות 60fps, עדכוני גרפים <1s
- ✅ בדיקות real-time: מונים וגרפים מתעדכנים מיידית
- ✅ בדיקות אינטגרציה: זרימה מלאה (התחברות → כיתה → קבוצה → תלמיד → עדכון)
- ✅ בדיקות רגרסיה: אחרי כל שינוי קוד

## 🛠 Deployment ותחזוקה

- סביבות: dev, test, production
- גיבוי DB יומי, versioning של קבצים
- ניטור: לוגים, שיעורי שגיאות, התראות
- מיגרציות סכמה מבוקרות עם מינימום downtime

## התקנה

### דרישות מוקדמות

- Node.js 20+
- PostgreSQL 15+
- npm או yarn

### Backend

```bash
cd backend
npm install

# יצירת קובץ .env (ראה .env.example)
cp .env.example .env
# ערוך את .env עם הפרטים שלך

# הרצת מיגרציות (אם נדרש)
npm run migration:run

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

האפליקציה תעלה על `http://localhost:3000`

### Docker Deployment

```bash
# Backend
cd backend
docker-compose up -d

# Frontend
cd frontend
docker build -t student-management-frontend .
docker run -p 80:80 student-management-frontend
```

## מבנה הפרויקט

```
studend_managment_new/
├── backend/              # NestJS Backend
│   ├── src/
│   │   ├── auth/        # Authentication & Authorization
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
│   ├── test/            # E2E tests
│   └── Dockerfile
├── frontend/            # React Frontend
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── services/    # API client
│   │   └── store/       # State management
│   └── Dockerfile
└── README.md
```

## Permissions

- **Manager (Yaniv Raz)**: הרשאות עריכה מלאות (CRUD)
- **אחרים**: גישה לקריאה בלבד (Read-only)

## תכונות שהושלמו

✅ כל ה-Backend APIs
✅ כל ה-Frontend pages
✅ Authentication & Permissions
✅ Audit Trail
✅ WebSocket Real-time updates
✅ Charts & Reports (pie, line, bar, histogram)
✅ Smart Search בעברית
✅ ETL לייבוא Excel
✅ File Upload עם Signed URLs
✅ Database indexes לחיפוש בעברית
✅ Docker deployment configs
✅ Testing (E2E)

## פיתוח עתידי

- [ ] SSO integration (Google/Microsoft)
- [ ] NLP מתקדם יותר לחיפוש בעברית
- [ ] אחסון קבצים ב-S3/Cloud Storage
- [ ] Mobile app (Flutter/React Native)
- [ ] Advanced analytics dashboard

## ניהול

**Managed by Yaniv Raz**

## רישיון

MIT
