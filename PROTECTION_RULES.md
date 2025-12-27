# כללי הגנה - Protection Rules

## ⚠️ כלל זהב
**לפני כל שינוי ב-layer.html - תמיד הרץ:**
```bash
python protect-layer-html.py layer.html
```

## רשימת בדיקות אוטומטיות

הסקריפט `protect-layer-html.py` בודק שכל האלמנטים הקריטיים הבאים קיימים:

### ✅ אלמנטים DOM:
- `id="layerTitle"` - כותרת השכבה
- `id="groupsGrid"` - Grid של הקבוצות  
- `id="header"` - Header של העמוד

### ✅ Scripts:
- `data.js`
- `shared-utils.js`
- `auto-load-data.js`
- `live-reload.js`

### ✅ פונקציות JavaScript:
- `getLayerFromURL()`
- `renderPage()`
- `init()`

### ✅ CSS Classes:
- `.group-card`
- `.group-title`
- `.group-teacher`
- `.group-count-badge`
- `.nav-btn`

### ✅ מבנה HTML:
- `<div class="container">`
- `<div class="header" id="header">`
- `<h1 id="layerTitle">`
- `<div class="groups-grid" id="groupsGrid">`
- `<a href="index.html" class="nav-btn">← חזרה</a>`

## איך להשתמש

### לפני עריכה:
```bash
python protect-layer-html.py layer.html
```

אם התוצאה היא `✅ הקובץ תקין` - **בטוח לערוך**
אם התוצאה היא `❌ הקובץ לא תקין` - **אל תמשיך!**

### אחרי עריכה:
```bash
python protect-layer-html.py layer.html
```

אם התוצאה היא `✅ הקובץ תקין` - **השינוי לא שבר כלום**
אם התוצאה היא `❌ הקובץ לא תקין` - **החזר את השינוי מייד!**

## זכור

1. ✅ תמיד בדוק לפני עריכה
2. ✅ תמיד בדוק אחרי עריכה
3. ✅ אם משהו נשבר - החזר מייד
4. ✅ אם אתה לא בטוח - אל תעשה

**הכלל הכי חשוב: אם protect-layer-html.py אומר שהקובץ לא תקין - אל תמשיך!**

