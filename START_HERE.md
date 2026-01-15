# 🚀 הוראות הפעלה - מערכת ניהול תלמידים

## ⚡ הפעלה מהירה

### שלב 1: התקנת תלויות

**Backend:**
```powershell
cd backend
npm install
```

**Frontend:**
```powershell
cd frontend
npm install
```

### שלב 2: הפעלת Docker Desktop

**⚠️ חשוב:** ודא ש-Docker Desktop רץ!

1. פתח את **Docker Desktop**
2. המתן עד שהוא מוכן (סמל הדולפין יציב בתחתית המסך)

### שלב 3: הפעלת PostgreSQL (Docker)

```powershell
cd backend
docker-compose up -d
```

זה מפעיל:
- PostgreSQL על פורט 5432
- מסד נתונים `student_management`

**בדיקה:** `docker ps` צריך להציג container של postgres

### שלב 4: הפעלת Backend Server

פותח **חלון PowerShell חדש**:
```powershell
cd backend
npm run start:dev
```

השרת יעלה על: `http://localhost:3001`
תיעוד API: `http://localhost:3001/api`

### שלב 5: הפעלת Frontend Server

פותח **חלון PowerShell נוסף**:
```powershell
cd frontend
npm run dev
```

האפליקציה תעלה על: `http://localhost:8080`

### שלב 6: פתיחת הדפדפן

פתח דפדפן וגש ל:
- **Frontend:** http://localhost:8080
- **Backend API:** http://localhost:3001
- **API Documentation:** http://localhost:3001/api

## 👤 פרטי התחברות ברירת מחדל

המערכת יוצרת אוטומטית משתמש Manager:
- **Email:** `yaniv@example.com`
- **Password:** `change-me`

**⚠️ חשוב:** שנה את הסיסמה לאחר ההתחברות הראשונה!

## 📝 הערות

1. **PostgreSQL חייב לרוץ לפני Backend** - ודא ש-Docker Compose רץ.
2. **Backend חייב לרוץ לפני Frontend** - המתן שהשרת יעלה.
3. **השרתים רצים ברקע** - אל תסגור את חלונות ה-PowerShell!

## 🐛 פתרון בעיות

### שגיאת חיבור למסד נתונים
```powershell
# בדוק אם PostgreSQL רץ
docker ps

# אם לא רץ, הפעל:
cd backend
docker-compose up -d
```

### פורט תפוס
אם פורט 8080 תפוס, שנה ב-`frontend/vite.config.ts`:
```typescript
server: {
  port: 8081, // או כל פורט אחר
}
```

### תלויות חסרות
```powershell
cd frontend
npm install

cd ../backend
npm install
```

## ✅ רשימת בדיקה

- [ ] PostgreSQL רץ (Docker)
- [ ] Backend רץ על פורט 3001
- [ ] Frontend רץ על פורט 8080
- [ ] הדפדפן פתוח על http://localhost:8080
- [ ] התחברות עובדת עם `yaniv@example.com` / `change-me`

## 🎉 סיום!

אם הכל עובד, תראה את דף ההתחברות של מערכת ניהול התלמידים!
