# התחלה מהירה - מערכת ניהול תלמידים

## פקודות להרצה

### 1. יצירת מיגרציות והרצתן

```bash
python manage.py makemigrations
python manage.py migrate
```

### 2. יצירת משתמש מנהל

```bash
python manage.py createsuperuser
```

הזן:
- Username: **yaniv**
- Email: yaniv@example.com
- Password: (הזן סיסמה)

### 3. הרצת השרת

```bash
python manage.py runserver
```

### 4. פתיחת הדפדפן

```
http://localhost:8000
```

## מה תראה

1. **דף כניסה** - רקע סגול כהה, 3 כפתורים צבעוניים לכיתות ז', ח', ט'
2. **דף שכבה** - כפתורים תלת-ממדיים לכל הקבצה
3. **דף הקבצה** - טבלה אינטראקטיבית + גרפים
4. **דף תלמיד** - פרופיל מלא + גרפים + Audit Trail

## יצירת נתונים ראשוניים

לאחר ההתחברות ל-admin (`http://localhost:8000/admin/`):

1. צור 3 שכבות: ז', ח', ט'
2. צור הקבצות לכל שכבה
3. הוסף תלמידים

או דרך ה-admin interface.

## הרשאות

- **מנהל (yaniv)**: יכול לערוך, להוסיף, למחוק
- **אחרים**: צפייה בלבד

**Managed by Yaniv Raz**

