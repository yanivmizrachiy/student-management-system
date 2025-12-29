# 🤖 תהליך עבודה מוגן ל-AI

## כללי זהב ל-AI (Cursor)

כשאתה מבקש מ-AI לתקן משהו, הוא **חייב** לבצע את התהליך הבא:

### שלב 1: בדיקה לפני שינוי
```bash
python safe-edit.py before
```
**אם יש שגיאה - לא להמשיך!**

### שלב 2: ביצוע השינוי
רק אם הבדיקה עברה - לבצע את השינוי המבוקש.

### שלב 3: בדיקה אחרי שינוי
```bash
python safe-edit.py after
```
**אם יש שגיאה - להחזיר את השינוי!**

### שלב 4: בדיקת layer.html ספציפית
```bash
python protect-layer-html.py layer.html
```
**אם יש שגיאה - להחזיר את השינוי!**

## מה נבדק

### קבצים קריטיים:
1. **index.html** - IDs, Scripts, Functions
2. **layer.html** - IDs, Scripts, Functions, CSS Classes
3. **data.js** - Functions קריטיות
4. **auto-load-data.js** - Strings ו-Functions
5. **shared-utils.js** - Functions

### חיבורים:
- כל הדפים טוענים את data.js
- index.html טוען את auto-load-data.js

## דוגמה לתהליך נכון

```
1. python safe-edit.py before
   → [SUCCESS] - ממשיך

2. מבצע שינוי בקובץ

3. python safe-edit.py after
   → [SUCCESS] - השינוי תקין!

4. python protect-layer-html.py layer.html
   → OK - File is valid
```

## דוגמה לתהליך שגוי

```
1. python safe-edit.py before
   → [ERROR] - לא להמשיך!

2. מבצע שינוי בכל זאת
   ❌ זה אסור!
```

## כללי זהירות

1. ✅ **תמיד לבדוק לפני** - `python safe-edit.py before`
2. ✅ **תמיד לבדוק אחרי** - `python safe-edit.py after`
3. ✅ **אם יש שגיאה - לא להמשיך!**
4. ✅ **אם אתה לא בטוח - לשאול!**

## קבצים במערכת

- `protect-all-files.py` - בדיקה ראשית של כל הקבצים
- `safe-edit.py` - עריכה בטוחה (before/after)
- `auto-protect.py` - בדיקה מהירה
- `protect-layer-html.py` - בדיקה ספציפית ל-layer.html

---

**זכור:** המנגנון נועד להגן על הקוד הקיים. אל תעקוף אותו!

