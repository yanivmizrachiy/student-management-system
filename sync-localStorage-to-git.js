/**
 * סנכרון localStorage ל-GitHub
 * קובץ זה מייצא את localStorage ל-JSON ומסנכרן אוטומטית
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_PATH = __dirname;
const DATA_EXPORT_FILE = path.join(PROJECT_PATH, 'localStorage-export.json');
const LAST_DATA_HASH = path.join(PROJECT_PATH, '.last-data-hash.txt');

// פונקציה לקריאת localStorage מ-dump file או דרך browser extension
// זה דורש שיתוף localStorage בין הדפדפן ל-Node.js
// פתרון: יצירת קובץ JSON ידנית או דרך browser extension

function exportLocalStorageToFile() {
  try {
    // נסה לקרוא מ-localStorage dump אם קיים
    const dumpFile = path.join(PROJECT_PATH, 'localStorage-dump.json');
    if (fs.existsSync(dumpFile)) {
      const data = JSON.parse(fs.readFileSync(dumpFile, 'utf8'));
      const schoolData = data['schoolData'];
      
      if (schoolData) {
        // שמור את הנתונים לקובץ export
        fs.writeFileSync(DATA_EXPORT_FILE, JSON.stringify({
          timestamp: new Date().toISOString(),
          data: JSON.parse(schoolData)
        }, null, 2));
        
        return true;
      }
    }
    
    return false;
  } catch (e) {
    return false;
  }
}

function getDataHash(data) {
  // יצירת hash פשוט מהנתונים
  const crypto = require('crypto');
  return crypto.createHash('md5').update(JSON.stringify(data)).digest('hex');
}

function checkAndSync() {
  try {
    // נסה לייצא localStorage
    if (!exportLocalStorageToFile()) {
      return; // אין נתונים לייצא
    }
    
    // קרא את הנתונים שיוצאו
    const exported = JSON.parse(fs.readFileSync(DATA_EXPORT_FILE, 'utf8'));
    const currentHash = getDataHash(exported.data);
    
    // בדוק אם יש שינוי
    let lastHash = null;
    if (fs.existsSync(LAST_DATA_HASH)) {
      lastHash = fs.readFileSync(LAST_DATA_HASH, 'utf8').trim();
    }
    
    if (currentHash === lastHash) {
      return; // אין שינוי
    }
    
    // יש שינוי - סנכרן
    console.log('🔄 מזהה שינוי ב-localStorage, מסנכרן...');
    
    process.chdir(PROJECT_PATH);
    
    // הוסף את קובץ ה-export
    execSync('git add localStorage-export.json 2>&1', { stdio: 'inherit' });
    
    // בדוק אם יש שינויים אחרים
    let status;
    try {
      status = execSync('git status --porcelain', { encoding: 'utf8', stdio: 'pipe' });
    } catch (e) {
      status = '';
    }
    
    if (status && status.trim()) {
      // יש שינויים - commit ו-push
      const timestamp = new Date().toLocaleString('he-IL');
      const commitMessage = `עדכון נתונים מ-localStorage - ${timestamp}`;
      
      execSync(`git commit -m "${commitMessage}" 2>&1`, { stdio: 'inherit' });
      execSync('git push origin main 2>&1', { stdio: 'inherit' });
      
      console.log('✅ נתונים מסונכרנים ל-GitHub!');
    }
    
    // שמור את ה-hash החדש
    fs.writeFileSync(LAST_DATA_HASH, currentHash);
    
  } catch (error) {
    console.error('❌ שגיאה בסנכרון:', error.message);
  }
}

// הרץ כל 10 שניות
setInterval(checkAndSync, 10000);
checkAndSync(); // הרץ מיידית

console.log('🚀 מנגנון סנכרון localStorage ל-GitHub הופעל');
console.log('⏱️  בודק שינויים כל 10 שניות...\n');

