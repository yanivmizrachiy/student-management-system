# מערכת חכמה לניהול תלמידים - Django

## מה נבנה

מערכת מלאה לניהול תלמידים עם Django, תואמת לכל הדרישות.

## מבנה הפרויקט

```
studend_managment_new/
├── students/              # אפליקציית Django
│   ├── models.py         # מודלים: Grade, Group, Student, Assessment, Attendance, AuditTrail
│   ├── views.py          # Views עם הרשאות
│   ├── forms.py          # טפסים
│   ├── urls.py           # URLs
│   ├── admin.py          # ממשק ניהול
│   └── utils.py          # פונקציות עזר (הרשאות, לוגים)
├── templates/
│   └── students/
│       ├── login_page.html      # דף כניסה עם 3 כפתורים צבעוניים
│       ├── grade_page.html      # דף שכבה
│       ├── group_page.html      # דף הקבצה עם טבלה וגרפים
│       └── student_detail.html  # דף תלמיד מלא
├── media/                # תמונות וקבצים
├── static/               # קבצי CSS/JS
└── student_management/  # הגדרות פרויקט
```

## התקנה והרצה

### 1. יצירת מיגרציות

```bash
python manage.py makemigrations
python manage.py migrate
```

### 2. יצירת משתמש מנהל

```bash
python manage.py createsuperuser
```

הזן:
- Username: yaniv
- Email: yaniv@example.com
- Password: (סיסמה חזקה)

### 3. הרצת השרת

```bash
python manage.py runserver
```

פתח: `http://localhost:8000`

## דפים

### דף כניסה (`/`)
- רקע סגול כהה (#3a0066)
- כותרת: "מערכת חכמה לניהול תלמידים"
- 3 כפתורים צבעוניים: ז', ח', ט'
- מונים חיים (מתעדכנים כל 5 שניות)
- קרדיט: "האתר מנוהל ע"י יניב רז"

### דף שכבה (`/grades/<grade_name>/`)
- כותרת עם שם השכבה
- כפתורים תלת-ממדיים לכל הקבצה
- כל כפתור: שם, מורה, מונה חי
- סיכום כולל בתחתית

### דף הקבצה (`/group/<group_id>/`)
- כותרת: שם הקבצה + שם המורה
- טבלה אינטראקטיבית (חיפוש, סינון, מיון)
- מונה חי
- גרפים: נוכחות, ציונים לפי תלמיד, ממוצע הקבצה

### דף תלמיד (`/student/<pk>/`)
- כותרת: שם מלא, שכבה, הקבצה, מורה
- תמונת פרופיל
- טאבים: פרופיל, ציונים, נוכחות, Audit Trail, קבצים
- גרפים: ציונים לאורך זמן, נוכחות לפי ימים
- כפתור עריכה רק למנהל

## מודלים

### Grade (שכבה)
- name: שם השכבה

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
- metric: 1-5
- value: ציון
- date: תאריך

### Attendance (נוכחות)
- student: קשר לתלמיד
- date: תאריך
- status: present/absent/late

### AuditTrail (לוג שינויים)
- entity, entity_id, field
- old_value, new_value
- user, timestamp

## הרשאות

- **מנהל (superuser)**: יכול לערוך, להוסיף, למחוק
- **אחרים**: צפייה בלבד

הבדיקה: `is_manager(user)` ב-`utils.py`

## גרפים

- Chart.js לגרפים
- גרף עוגה לנוכחות
- גרף עמודות לציונים
- גרף קו לציונים לאורך זמן

## תכונות

✅ דף כניסה עם רקע סגול כהה  
✅ 3 כפתורים צבעוניים תלת-ממדיים  
✅ מונים חיים  
✅ טבלאות אינטראקטיביות  
✅ גרפים אמיתיים  
✅ הרשאות מלאות  
✅ Audit Trail  
✅ תמיכה בעברית (RTL)  
✅ Bootstrap 5  

**Managed by Yaniv Raz**

