/**
 * Helper script שרץ בדפדפן ומאזין לשינויים
 * יוצר marker file דרך File System Access API (אם נתמך)
 * או דרך download שצריך להעתיק ידנית
 */

(function() {
  'use strict';
  
  // בדוק אם File System Access API נתמך
  const supportsFileSystemAccess = 'showSaveFilePicker' in window;
  
  let syncMarkerPath = null;
  let fileHandle = null;
  
  /**
   * יוצר marker file דרך File System Access API
   */
  async function createMarkerFileAdvanced() {
    if (!supportsFileSystemAccess) {
      return false;
    }
    
    try {
      if (!fileHandle) {
        // שאל את המשתמש לאפשר גישה לתיקייה
        const dirHandle = await window.showDirectoryPicker({
          mode: 'readwrite'
        });
        
        // חפש את הקובץ .sync-marker.json
        try {
          fileHandle = await dirHandle.getFileHandle('.sync-marker.json', { create: true });
        } catch (e) {
          console.log('לא ניתן ליצור marker file:', e);
          return false;
        }
      }
      
      // כתוב את ה-marker
      const syncData = {
        timestamp: new Date().toISOString(),
        action: 'browser-save',
        version: Date.now()
      };
      
      const writable = await fileHandle.createWritable();
      await writable.write(JSON.stringify(syncData, null, 2));
      await writable.close();
      
      return true;
    } catch (e) {
      console.log('File System Access לא זמין:', e);
      return false;
    }
  }
  
  /**
   * יוצר marker דרך localStorage (fallback)
   */
  function createMarkerFileFallback() {
    try {
      const syncData = {
        timestamp: new Date().toISOString(),
        action: 'browser-save',
        version: Date.now(),
        needsSync: true
      };
      
      localStorage.setItem('gitSyncMarker', JSON.stringify(syncData));
      return true;
    } catch (e) {
      console.error('שגיאה ביצירת marker:', e);
      return false;
    }
  }
  
  /**
   * פונקציה עיקרית - יוצרת marker
   */
  async function createSyncMarker() {
    // נסה דרך File System Access API
    const success = await createMarkerFileAdvanced();
    
    if (!success) {
      // Fallback ל-localStorage
      createMarkerFileFallback();
    }
  }
  
  // האזן לאירועים מ-data.js
  window.addEventListener('dataSaved', (event) => {
    createSyncMarker();
  });
  
  // גם אפשר לקרוא ישירות
  window.createGitSyncMarker = createSyncMarker;
  
  console.log('✅ Browser Sync Helper נטען');
})();

