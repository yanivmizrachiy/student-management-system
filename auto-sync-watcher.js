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
let lastFileCheckTime = Date.now();

// פונקציה ליצירת marker file אם יש שינוי בקבצים
function ensureMarkerFile() {
  try {
    const importantFiles = ['data.js', 'index.html', 'student.html', 'group.html', 'class.html'];
    let hasChanges = false;
    
    importantFiles.forEach(file => {
      const filePath = path.join(PROJECT_PATH, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        if (stats.mtimeMs > lastFileCheckTime) {
          hasChanges = true;
        }
      }
    });
    
    if (hasChanges && !fs.existsSync(SYNC_MARKER)) {
      const syncData = {
        timestamp: new Date().toISOString(),
        action: 'auto-detect',
        version: Date.now()
      };
      fs.writeFileSync(SYNC_MARKER, JSON.stringify(syncData, null, 2));
    }
    
    lastFileCheckTime = Date.now();
  } catch (e) {
    // שקט
  }
}

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
    // בדוק אם יש marker file
    if (fs.existsSync(SYNC_MARKER)) {
      const markerContent = fs.readFileSync(SYNC_MARKER, 'utf8');
      const syncData = JSON.parse(markerContent);
      
      // בדוק אם זה שינוי חדש
      if (lastSyncVersion && syncData.version <= lastSyncVersion) {
        return false;
      }
      
      return syncData;
    }
    
    // גם בדוק שינויים בקבצים ישירות (fallback)
    // אם יש שינוי בקובץ data.js או קבצי HTML אחרי הזמן האחרון
    const importantFiles = ['data.js', 'index.html', 'student.html', 'group.html', 'class.html', 'layer.html', 'teacher.html', 'update-teachers.js', 'shared-utils.js'];
    const now = Date.now();
    
    for (const file of importantFiles) {
      const filePath = path.join(PROJECT_PATH, file);
      if (fs.existsSync(filePath)) {
        const stats = fs.statSync(filePath);
        // אם הקובץ שונה ב-30 שניות האחרונות, זה שינוי חדש
        if (now - stats.mtimeMs < 30000) {
          // צור marker file אוטומטית
          const syncData = {
            timestamp: new Date().toISOString(),
            action: 'file-change-detected',
            version: Date.now(),
            changedFile: file
          };
          fs.writeFileSync(SYNC_MARKER, JSON.stringify(syncData, null, 2));
          return syncData;
        }
      }
    }
    
    // גם בדוק localStorage dump file
    const localStorageDump = path.join(PROJECT_PATH, 'localStorage-dump.json');
    if (fs.existsSync(localStorageDump)) {
      const stats = fs.statSync(localStorageDump);
      if (now - stats.mtimeMs < 30000) {
        const syncData = {
          timestamp: new Date().toISOString(),
          action: 'localStorage-export',
          version: Date.now(),
          source: 'localStorage-dump.json'
        };
        fs.writeFileSync(SYNC_MARKER, JSON.stringify(syncData, null, 2));
        return syncData;
      }
    }
    
    return false;
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
    execSync('git add *.html *.js *.md .gitignore package.json 2>&1', { stdio: 'inherit' });
    
    // גם נסה להוסיף localStorage export/dump אם קיים
    try {
      const exportFile = path.join(PROJECT_PATH, 'localStorage-export.json');
      const dumpFile = path.join(PROJECT_PATH, 'localStorage-dump.json');
      
      if (fs.existsSync(exportFile)) {
        execSync('git add localStorage-export.json 2>&1', { stdio: 'pipe' });
      }
      if (fs.existsSync(dumpFile)) {
        execSync('git add localStorage-dump.json 2>&1', { stdio: 'pipe' });
      }
    } catch (e) {
      // זה בסדר אם הקבצים לא קיימים
    }
    
    // אל תכלול את marker files ב-commit (הם זמניים)
    try {
      execSync('git reset HEAD .sync-marker.json .last-sync.txt 2>&1', { stdio: 'pipe' });
    } catch (e) {
      // זה בסדר אם הקבצים לא ב-staging
    }
    
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
  // וודא שיש marker file אם יש שינויים בקבצים
  ensureMarkerFile();
  
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

