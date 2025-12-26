/**
 * סקריפט להעתקת localStorage בין דפדפנים
 * 
 * איך להשתמש:
 * 1. פתח את index.html מקומית
 * 2. לחץ F12
 * 3. הדבק את הקוד הזה ב-Console
 * 4. העתק את התוצאה
 * 5. פתח את GitHub Pages
 * 6. F12 → Console → הדבק: localStorage.setItem('schoolData', 'הדבק כאן את מה שהעתקת')
 * 7. רענן (F5)
 */

// קריאה מהנתונים המקומיים
const localData = localStorage.getItem('schoolData');
if (localData) {
    console.log('✅ נמצאו נתונים!');
    console.log('העתק את הטקסט הבא:');
    console.log('---');
    console.log(localData);
    console.log('---');
    console.log('עכשיו:');
    console.log('1. פתח את GitHub Pages');
    console.log('2. לחץ F12');
    console.log('3. כתוב: localStorage.setItem("schoolData", "' + localData.replace(/"/g, '\\"') + '")');
    console.log('4. לחץ Enter');
    console.log('5. רענן את הדף (F5)');
    
    // נסה להעתיק אוטומטית (אם אפשר)
    if (navigator.clipboard) {
        navigator.clipboard.writeText(localData).then(() => {
            console.log('✅ הנתונים הועתקו ללוח!');
        });
    }
} else {
    console.log('❌ לא נמצאו נתונים ב-localStorage');
    console.log('ייתכן שצריך לייבא נתונים דרך init_data.html');
}

