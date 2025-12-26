/**
 * מנגנון סנכרון אוטומטי ל-GitHub
 * רץ ברקע ומסנכרן כל שינוי אוטומטית
 * 
 * הרצה: node auto-sync-watcher.js
 * או: npm start (אם מוגדר ב-package.json)
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const PROJECT_PATH = __dirname;
const SYNC_MARKER = path.join(PROJECT_PATH, '.sync-marker.json');
const LAST_SYNC_FILE = path.join(PROJECT_PATH, '.last-sync.txt');
const GIT_BATCH_DELAY = 5000; // 5 שניות - ממתין לאיסוף שינויים מרובים

let syncTimeout = null;
let lastSyncVersion = null;

// טען את הגרסה האחרונה שסונכרנה
function loadLastSync() {
  try {
    if (fs.existsSync(LAST_SYNC_FILE)) {
      const content = fs.readFileSync(LAST_SYNC_FILE, 'utf8').trim();
      lastSyncVersion = content ? parseInt(content) : null;
    }
  } catch (e) {
    lastSyncVersion = null;
  }
}

// שמור את הגרסה האחרונה שסונכרנה
function saveLastSync(version) {
  try {
    fs.writeFileSync(LAST_SYNC_FILE, version.toString());
    lastSyncVersion = version;
  } catch (e) {
    console.error('שגיאה בשמירת last sync:', e.message);
  }
}

// בדוק אם יש שינויים חדשים
function checkForChanges() {
  try {
    if (!fs.existsSync(SYNC_MARKER)) {
      return false;
    }
    
    const markerContent = fs.readFileSync(SYNC_MARKER, 'utf8');
    const syncData = JSON.parse(markerContent);
    
    // בדוק אם זה שינוי חדש
    if (lastSyncVersion && syncData.version <= lastSyncVersion) {
      return false;
    }
    
    return syncData;
  } catch (e) {
    return false;
  }
}

// בצע commit ו-push ל-GitHub
function syncToGitHub(syncData) {
  try {
    console.log(`\n🔄 [${new Date().toLocaleTimeString('he-IL')}] מסנכרן ל-GitHub...`);
    
    // עבור לתיקיית הפרויקט
    process.chdir(PROJECT_PATH);
    
    // בדוק סטטוס
    let status;
    try {
      status = execSync('git status --porcelain', { encoding: 'utf8', stdio: 'pipe' });
    } catch (e) {
      console.log('⚠️  אין שינויים ב-Git');
      saveLastSync(syncData.version);
      return;
    }
    
    if (!status || !status.trim()) {
      console.log('ℹ️  אין שינויים חדשים');
      saveLastSync(syncData.version);
      return;
    }
    
    // הוסף את כל הקבצים החשובים
    console.log('📦 מוסיף קבצים...');
    execSync('git add *.html *.js *.md .gitignore 2>&1', { stdio: 'inherit' });
    
    // צור commit
    const timestamp = new Date().toLocaleString('he-IL');
    const commitMessage = `עדכון אוטומטי - ${timestamp}`;
    console.log('💾 יוצר commit...');
    execSync(`git commit -m "${commitMessage}" 2>&1`, { stdio: 'inherit' });
    
    // דחוף ל-GitHub
    console.log('📤 דוחף ל-GitHub...');
    execSync('git push origin main 2>&1', { stdio: 'inherit' });
    
    // שמור את הגרסה שסונכרנה
    saveLastSync(syncData.version);
    
    console.log('✅ סנכרון הושלם בהצלחה!');
    console.log('🔗 https://github.com/yanivmizrachiy/student-management-system\n');
    
  } catch (error) {
    console.error('❌ שגיאה בסנכרון:', error.message);
    // אל תשמור את הגרסה אם הייתה שגיאה
  }
}

// פונקציה ראשית - בודקת ומסנכרנת
function processSync() {
  const syncData = checkForChanges();
  
  if (syncData) {
    // יש שינוי - אבל ממתין קצת לאיסוף שינויים מרובים
    if (syncTimeout) {
      clearTimeout(syncTimeout);
    }
    
    syncTimeout = setTimeout(() => {
      syncToGitHub(syncData);
      syncTimeout = null;
    }, GIT_BATCH_DELAY);
  }
}

// התחל
console.log('🚀 מנגנון סנכרון אוטומטי ל-GitHub הופעל');
console.log('📁 תיקייה:', PROJECT_PATH);
console.log('⏱️  בודק שינויים כל 3 שניות...\n');

loadLastSync();

// בדוק שינויים כל 3 שניות
setInterval(processSync, 3000);

// בדיקה ראשונית מיידית
processSync();

// טיפול בסגירה נקייה
process.on('SIGINT', () => {
  console.log('\n\n🛑 עוצר מנגנון סנכרון...');
  if (syncTimeout) {
    clearTimeout(syncTimeout);
    // נסה לסנכרן לפני יציאה
    const syncData = checkForChanges();
    if (syncData) {
      syncToGitHub(syncData);
    }
  }
  process.exit(0);
});

