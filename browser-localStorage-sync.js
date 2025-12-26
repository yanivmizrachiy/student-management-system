/**
 * סנכרון localStorage מהדפדפן לקובץ
 * קובץ זה צריך לרוץ בדפדפן (כחלק מהאתר)
 * מייצא את localStorage ל-JSON file שזמין ל-Node.js
 */

(function() {
  'use strict';
  
  // פונקציה לייצוא localStorage לקובץ
  function exportLocalStorage() {
    try {
      const schoolData = localStorage.getItem('schoolData');
      if (!schoolData) {
        return;
      }
      
      // צור blob עם הנתונים
      const data = {
        timestamp: new Date().toISOString(),
        schoolData: schoolData,
        isAdmin: localStorage.getItem('isAdmin') === 'true'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // צור קישור להורדה (אוטומטית)
      const a = document.createElement('a');
      a.href = url;
      a.download = 'localStorage-dump.json';
      a.style.display = 'none';
      document.body.appendChild(a);
      
      // זה לא יעבוד אוטומטית - צריך click ידני
      // אבל אפשר להשתמש ב-File System Access API (אם נתמך)
      
      // פתרון טוב יותר: שמור ב-localStorage marker שהקובץ Node.js יקרא
      // הקובץ Node.js יכול לקרוא מ-localStorage דרך browser extension או דרך API
      
      console.log('📤 נתונים מוכנים לייצוא');
      
    } catch (e) {
      console.error('שגיאה בייצוא localStorage:', e);
    }
  }
  
  // ייצא כל 30 שניות (אם יש שינוי)
  let lastDataHash = null;
  
  setInterval(() => {
    const currentData = localStorage.getItem('schoolData');
    if (!currentData) return;
    
    // יצירת hash פשוט
    let hash = 0;
    for (let i = 0; i < currentData.length; i++) {
      const char = currentData.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    
    if (hash !== lastDataHash) {
      lastDataHash = hash;
      // שמור marker שהנתונים השתנו
      localStorage.setItem('dataExportNeeded', 'true');
      localStorage.setItem('dataExportTimestamp', new Date().toISOString());
      console.log('🔄 נתונים השתנו, מוכן לייצוא');
    }
  }, 30000);
  
  // ייצא גם אחרי כל save
  if (typeof DataStore !== 'undefined') {
    const originalSave = DataStore.save;
    DataStore.save = function(immediate) {
      const result = originalSave.call(this, immediate);
      // אחרי שמירה, סמן שצריך ייצוא
      localStorage.setItem('dataExportNeeded', 'true');
      localStorage.setItem('dataExportTimestamp', new Date().toISOString());
      return result;
    };
  }
  
  console.log('✅ מנגנון ייצוא localStorage הופעל');
})();

