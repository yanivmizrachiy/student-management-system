/**
 * Safe Edit Helper - עוזר לעריכה בטוחה
 * מנגנון שיוודא ששינויים לא שוברים את הקוד הקיים
 */

(function() {
  'use strict';

  const SafeEditHelper = {
    
    // רשימת אלמנטים קריטיים שחייבים להישאר
    criticalElements: {
      'layer.html': {
        // אלמנטים DOM שצריכים להיות קיימים
        requiredElements: [
          'layerTitle',
          'groupsGrid',
          'header'
        ],
        // פונקציות JavaScript שצריכות להיות קיימות
        requiredFunctions: [
          'getLayerFromURL',
          'renderPage',
          'init'
        ],
        // Scripts שצריכים להיטען
        requiredScripts: [
          'data.js',
          'shared-utils.js',
          'auto-load-data.js',
          'live-reload.js'
        ],
        // Classes CSS שצריכות להיות קיימות
        requiredCSSClasses: [
          'group-card',
          'group-title',
          'group-teacher',
          'group-count-badge',
          'nav-btn'
        ],
        // מבנה HTML בסיסי שחייב להישאר
        requiredHTMLStructure: [
          '<div class="container">',
          '<div class="header" id="header">',
          '<h1 id="layerTitle">',
          '<div class="groups-grid" id="groupsGrid">'
        ]
      }
    },

    // בדיקה שכל האלמנטים הקריטיים קיימים
    validateCriticalElements: function(fileName, fileContent) {
      const checks = this.criticalElements[fileName];
      if (!checks) {
        return { valid: true, message: 'לא נמצאו בדיקות עבור קובץ זה' };
      }

      const issues = [];

      // בדיקת אלמנטים DOM
      checks.requiredElements.forEach(elementId => {
        if (!fileContent.includes(`id="${elementId}"`) && 
            !fileContent.includes(`id='${elementId}'`)) {
          issues.push(`❌ אלמנט DOM חסר: ${elementId}`);
        }
      });

      // בדיקת פונקציות
      checks.requiredFunctions.forEach(funcName => {
        if (!fileContent.includes(`function ${funcName}`) &&
            !fileContent.includes(`${funcName}:`) &&
            !fileContent.includes(`${funcName} =`)) {
          issues.push(`❌ פונקציה חסרה: ${funcName}`);
        }
      });

      // בדיקת Scripts
      checks.requiredScripts.forEach(script => {
        if (!fileContent.includes(`src="${script}"`) &&
            !fileContent.includes(`src='${script}'`)) {
          issues.push(`❌ Script חסר: ${script}`);
        }
      });

      // בדיקת Classes CSS
      checks.requiredCSSClasses.forEach(cssClass => {
        if (!fileContent.includes(`.${cssClass}`)) {
          issues.push(`❌ CSS Class חסר: .${cssClass}`);
        }
      });

      // בדיקת מבנה HTML
      checks.requiredHTMLStructure.forEach(structure => {
        if (!fileContent.includes(structure)) {
          issues.push(`❌ מבנה HTML חסר: ${structure}`);
        }
      });

      return {
        valid: issues.length === 0,
        issues: issues,
        message: issues.length === 0 
          ? '✅ כל האלמנטים הקריטיים קיימים' 
          : `⚠️ נמצאו ${issues.length} בעיות`
      };
    },

    // בדיקה לפני עריכה
    checkBeforeEdit: function(fileName, fileContent) {
      console.log(`\n🔍 בדיקה לפני עריכה: ${fileName}`);
      console.log('='.repeat(60));
      
      const validation = this.validateCriticalElements(fileName, fileContent);
      
      if (!validation.valid) {
        console.error('❌ נמצאו בעיות! אל תמשיך בעריכה עד שתתקן:');
        validation.issues.forEach(issue => console.error(`  ${issue}`));
        return false;
      } else {
        console.log('✅ כל האלמנטים הקריטיים קיימים - בטוח לערוך');
        return true;
      }
    },

    // בדיקה אחרי עריכה
    checkAfterEdit: function(fileName, fileContent) {
      console.log(`\n✅ בדיקה אחרי עריכה: ${fileName}`);
      console.log('='.repeat(60));
      
      const validation = this.validateCriticalElements(fileName, fileContent);
      
      if (!validation.valid) {
        console.error('❌ עריכה שברה אלמנטים קריטיים!');
        validation.issues.forEach(issue => console.error(`  ${issue}`));
        return false;
      } else {
        console.log('✅ כל האלמנטים הקריטיים עדיין קיימים');
        return true;
      }
    }
  };

  // Export
  if (typeof window !== 'undefined') {
    window.SafeEditHelper = SafeEditHelper;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = SafeEditHelper;
  }
})();

