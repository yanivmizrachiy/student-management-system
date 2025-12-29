# 🛡️ מנגנון הגנה כללי - מדריך שימוש

## מטרה
למנוע הרס של קוד קיים בעת ביצוע שינויים. המנגנון בודק את כל הקבצים הקריטיים לפני ואחרי שינויים.

## קבצים במערכת

### 1. `protect-all-files.py` - הבדיקה הראשית
בודק את כל הקבצים הקריטיים:
- `index.html` - דף הבית
- `layer.html` - עמוד שכבה
- `data.js` - מאגר נתונים
- `auto-load-data.js` - טעינת נתונים
- `shared-utils.js` - כלי עזר

**מה הוא בודק:**
- אלמנטים DOM קריטיים (IDs)
- Scripts שנטענים
- Functions חשובות
- CSS Classes
- Strings קריטיים
- חיבורים בין קבצים

### 2. `safe-edit.py` - עריכה בטוחה
סקריפט נוח להרצה לפני ואחרי שינויים.

## איך להשתמש

### לפני כל שינוי חשוב:

```bash
python safe-edit.py before
```

או ישירות:

```bash
python protect-all-files.py
```

**אם התוצאה היא `[SUCCESS]`** - בטוח לערוך!  
**אם התוצאה היא `[ERROR]`** - אל תמשיך! תתקן את הבעיות קודם.

### אחרי כל שינוי:

```bash
python safe-edit.py after
```

או ישירות:

```bash
python protect-all-files.py
```

**אם התוצאה היא `[SUCCESS]`** - השינוי לא שבר כלום!  
**אם התוצאה היא `[ERROR]`** - השינוי שבר משהו! החזר את השינוי.

## כללי זהב

1. ✅ **תמיד בדוק לפני שינוי** - `python safe-edit.py before`
2. ✅ **תמיד בדוק אחרי שינוי** - `python safe-edit.py after`
3. ✅ **אם יש שגיאה - אל תמשיך!** - תתקן קודם
4. ✅ **אם אתה לא בטוח - תשאל!**

## מה נבדק בכל קובץ

### index.html
- IDs: `count7`, `count8`, `count9`, `totalCount`
- Scripts: `data.js`, `auto-load-data.js`, `update-teachers.js`, `live-reload.js`
- Functions: `updateCounts`, `refreshCounts`, `updateAdminUI`

### layer.html
- IDs: `groupsGrid`, `layerTitle`, `layerDescription`
- Scripts: `data.js`, `shared-utils.js`, `auto-load-data.js`, `live-reload.js`
- Functions: `ensureData`, `buildCard`, `render`
- CSS Classes: `.group-card`, `.group-meta`, `.group-count`

### data.js
- Functions: `load`, `save`, `getLayerCount`, `getGroupCount`, `getTotalCount`, `getGroupsByLayer`, `getTeacher`, `getLayerName`, `importGroup`, `_invalidateCache`

### auto-load-data.js
- Strings: `DataStore.importGroup`, `נורית מויאל`, `loadAllGroups`, `window.__dataLoaded`, `dataLoaded`
- Functions: `loadAllGroups`

### shared-utils.js
- Functions: `escapeHtml`, `getURLParameter`
- Strings: `window.SharedUtils`, `SharedUtils`

## שימוש ב-Git Hook

אם יש לך Git hook מוגדר, הוא יריץ את הבדיקות אוטומטית לפני commit.

## דוגמה לשימוש

```bash
# לפני שינוי
python safe-edit.py before
# [SUCCESS] - ממשיך לערוך

# מבצע שינוי בקובץ
# ...

# אחרי שינוי
python safe-edit.py after
# [SUCCESS] - השינוי תקין!
# או
# [ERROR] - צריך לתקן!
```

## תמיכה

אם יש בעיה או שאלה, בדוק:
1. `PROTECTION_RULES.md` - כללי הגנה
2. `WORKFLOW_PROTECTION.md` - הגנת workflow
3. `CHANGE_VALIDATION_GUIDE.md` - מדריך בדיקות

---

**זכור:** מנגנון ההגנה נועד לעזור לך, לא להפריע. אם אתה בטוח שהשינוי נכון, תמיד אפשר לבדוק ידנית.

