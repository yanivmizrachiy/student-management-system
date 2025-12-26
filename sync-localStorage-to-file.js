/**
 * סקריפט עזר - מייצר קובץ marker מ-localStorage
 * רץ כחלק מ-auto-sync-watcher.js
 */

const fs = require('fs');
const path = require('path');

// נתיב לקובץ HTML הראשי
const INDEX_HTML = path.join(__dirname, 'index.html');
const SYNC_MARKER = path.join(__dirname, '.sync-marker.json');

/**
 * קורא את localStorage מתוך קובץ HTML/JS
 * (מתקרב - בודק את קובץ data.js ישירות)
 */
function checkForLocalStorageChanges() {
  try {
    // קרא את קובץ data.js
    const dataJsPath = path.join(__dirname, 'data.js');
    if (!fs.existsSync(dataJsPath)) {
      return false;
    }
    
    const dataJsContent = fs.readFileSync(dataJsPath, 'utf8');
    
    // בדוק אם יש קריאה ל-triggerGitSync (זה אומר שהיה שינוי)
    // למעשה, אנחנו נשתמש בגישה אחרת - נבדוק את תאריך השינוי של הקבצים
    
    // במקום זאת, נשתמש בגישה פשוטה יותר:
    // נבדוק את תאריך השינוי של הקבצים החשובים
    const importantFiles = [
      'data.js',
      'index.html',
      'student.html',
      'group.html',
      'class.html',
      'layer.html',
      'teacher.html'
    ];
    
    let latestChange = 0;
    importantFiles.forEach(file => {
      const filePath = path.join(__dirname, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.mtimeMs > latestChange) {
          latestChange = stats.mtimeMs;
        }
      }
    });
    
    return latestChange;
  } catch (e) {
    console.error('שגיאה בבדיקת localStorage:', e.message);
    return false;
  }
}

// יצירת marker file
function createMarkerFile() {
  try {
    const syncData = {
      timestamp: new Date().toISOString(),
      action: 'sync',
      version: Date.now(),
      fileChanges: checkForLocalStorageChanges()
    };
    
    fs.writeFileSync(SYNC_MARKER, JSON.stringify(syncData, null, 2));
    return syncData;
  } catch (e) {
    console.error('שגיאה ביצירת marker file:', e.message);
    return null;
  }
}

module.exports = { createMarkerFile, checkForLocalStorageChanges };

