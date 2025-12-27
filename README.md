# מערכת ניהול תלמידים

מערכת מקצועית ויוקרתית לניהול תלמידים בבית ספר.

## 🌟 תכונות עיקריות

- ✅ ניהול תלמידים, כיתות, הקבצות ומורים
- ✅ מערכת ציונים דינמית (5+ עמודות)
- ✅ העלאת תמונות וקבצים לכל תלמיד
- ✅ מערכת הרשאות (בעל מערכת / צופה) - סיסמה: **1167**
- ✅ עיצוב פרימיום יוקרתי עם UI כהה
- ✅ מותאם למובייל במלואו
- ✅ שמירה אוטומטית ב-localStorage
- ✅ סנכרון אוטומטי ל-GitHub

## 🚀 התחלה מהירה

### גישה לאתר

**קישור ישיר:** https://yanivmizrachiy.github.io/student-management-system/

### שימוש מקומי

1. פתח את `index.html` בדפדפן
2. המערכת תטען נתונים אוטומטית דרך `auto-load-data.js`
3. כל השינויים נשמרים אוטומטית ב-localStorage

## 📁 מבנה הפרויקט

### קבצי האתר (עיקריים)

- `index.html` - דף הבית עם כפתורי שכבות
- `layer.html` - עמוד שכבה (ז', ח', ט')
- `group.html` - עמוד הקבצה עם טבלת תלמידים
- `student.html` - עמוד תלמיד עם פרטים מלאים
- `teacher.html` - עמוד מורה עם רשימת קבוצות
- `class.html` - עמוד כיתה עם טבלת תלמידים

### קבצי קוד (Core)

- `data.js` - מאגר נתונים מרכזי (DataStore)
- `shared-utils.js` - כלי עזר משותפים
- `auto-load-data.js` - טעינת נתונים אוטומטית
- `update-teachers.js` - עדכון מורים

### קבצי הגדרה

- `package.json` - הגדרות Node.js (לא חובה)
- `.gitignore` - קבצים להתעלמות
- `favicon.ico` - אייקון האתר

## 🔐 הרשאות

**מצב צפייה (ברירת מחדל):**
- צפייה בכל הנתונים
- אין אפשרות לערוך

**מצב בעל מערכת (עריכה):**
- לחץ על כפתור ההרשאות בפינה השמאלית העליונה
- הזן סיסמה: **1167**
- כעת ניתן לערוך, להוסיף, למחוק ולהעלות קבצים

## 🎨 עיצוב

המערכת משתמשת בעיצוב פרימיום כהה עם:
- רקעים כהים עמוקים
- טקסט בהיר (לבן)
- ניגודיות גבוהה
- אנימציות עדינות ואלגנטיות
- צבעים ייחודיים לכל שכבה

## 📊 נתונים

כל הנתונים נשמרים ב-`localStorage` בדפדפן:
- תלמידים (כולל תמונות וקבצים כ-Base64)
- כיתות
- הקבצות
- מורים
- עמודות ציונים

הנתונים נטענים אוטומטית דרך `auto-load-data.js` בפעם הראשונה.

## 🔗 קישורים שימושיים

- **דף הבית:** https://yanivmizrachiy.github.io/student-management-system/
- **שכבה ז':** https://yanivmizrachiy.github.io/student-management-system/layer.html?layer=7
- **שכבה ח':** https://yanivmizrachiy.github.io/student-management-system/layer.html?layer=8
- **שכבה ט':** https://yanivmizrachiy.github.io/student-management-system/layer.html?layer=9

## 🛠️ טכנולוגיות

- HTML5
- CSS3 (עם Grid, Flexbox, Gradients)
- JavaScript (Vanilla ES6+)
- LocalStorage API
- GitHub Pages (Hosting)

## 👤 ניהול

האתר מנוהל ע"י **יניב רז**

## 📝 הערות

- המערכת עובדת בלבד בדפדפן (לא דורשת שרת)
- כל הנתונים נשמרים מקומית בדפדפן
- יש לבדוק את `localStorage` לפני מחיקת נתונים
- המערכת מסנכרנת אוטומטית ל-GitHub (אם מוגדר)

## 🚦 GitHub Automation חכם

1. קבע את hooks של Git:
   ```bash
   git config core.hooksPath .githooks
   ```
2. לפני כל commit הרץ:
   ```bash
   python protect-layer-html.py layer.html
   ```
3. לאחר מכן תוכל לבצע commit רגיל; ה-hook יפעיל `scripts/precommit.py` אוטומטית.
4. אם נדרשת בדיקה נוספת, הרץ: `python pre-change-validator.py before layer.html`.
5. הקפד על `.gitignore` המעודכן שמסתיר `.change-snapshots/`, `.last-update.json`, `node_modules/`, קבצי `.log`, `.tmp` וכו'.

---

**גרסה:** 1.0  
**עדכון אחרון:** 2024
