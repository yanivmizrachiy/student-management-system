# מדריך מיגרציות - מערכת ניהול תלמידים

## שלבים להרצת המערכת

### 1. יצירת מיגרציות חדשות

```bash
python manage.py makemigrations
```

זה יוצר מיגרציות עבור:
- Grade (שכבה)
- Group (הקבצה)
- Student (עודכן - עם grade ו-group)
- Assessment (הערכה)
- Attendance (נוכחות)
- AuditTrail (לוג שינויים)

### 2. הרצת מיגרציות

```bash
python manage.py migrate
```

### 3. יצירת משתמש מנהל (superuser)

```bash
python manage.py createsuperuser
```

הזן:
- Username: yaniv (או שם אחר)
- Email: yaniv@example.com
- Password: (הזן סיסמה חזקה)

### 4. יצירת נתונים ראשוניים

לאחר ההתחברות ל-admin (`/admin/`), צור:
- 3 שכבות: ז', ח', ט'
- הקבצות לכל שכבה
- תלמידים (אופציונלי)

### 5. הרצת השרת

```bash
python manage.py runserver
```

פתח בדפדפן: `http://localhost:8000`

## מבנה הנתונים

### Grade (שכבה)
- name: שם השכבה (ז', ח', ט')

### Group (הקבצה)
- name: שם ההקבצה
- grade: קשר לשכבה
- teacher: שם המורה

### Student (תלמיד)
- first_name, last_name: שם
- id_number: תעודת זהות
- grade: קשר לשכבה
- group: קשר להקבצה
- profile_image: תמונת פרופיל

### Assessment (הערכה)
- student: קשר לתלמיד
- metric: 1-5 (סוג הערכה)
- value: ציון
- date: תאריך

### Attendance (נוכחות)
- student: קשר לתלמיד
- date: תאריך
- status: present/absent/late

### AuditTrail (לוג שינויים)
- entity: שם הישות
- entity_id: מזהה
- field: שם השדה
- old_value, new_value: ערכים
- user: משתמש
- timestamp: תאריך ושעה

## הרשאות

- **מנהל (superuser)**: יכול לערוך, להוסיף, למחוק
- **אחרים**: צפייה בלבד

הבדיקה מתבצעת ב-`views.py` עם הפונקציה `is_manager()`.

## פתרון בעיות

### שגיאת מיגרציה
אם יש שגיאה, מחק את תיקיית `migrations` (חוץ מ-`__init__.py`) והרץ שוב:
```bash
python manage.py makemigrations
python manage.py migrate
```

### שגיאת תמונות
ודא שתיקיית `media/` קיימת:
```bash
mkdir media
mkdir media/students
```

### שגיאת static files
הרץ:
```bash
python manage.py collectstatic
```

## הערות

- כל השינויים נרשמים ב-AuditTrail
- תמונות נשמרות ב-`media/students/`
- המערכת תומכת בעברית מלאה (RTL)

