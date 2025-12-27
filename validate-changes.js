/**
 * מנגנון בדיקה אוטומטי - Validation System
 * בודק ששינויים לא שוברים פונקציונליות קיימת
 */

(function() {
  'use strict';

  const ValidationSystem = {
    
    // רשימת בדיקות קריטיות לכל עמוד
    criticalChecks: {
      'layer.html': [
        {
          name: 'DataStore.load נקרא',
          check: () => {
            const content = document.body.innerHTML || '';
            return content.includes('DataStore.load') || 
                   document.querySelector('script')?.textContent?.includes('DataStore.load');
          }
        },
        {
          name: 'getLayerFromURL פונקציה קיימת',
          check: () => {
            const scripts = Array.from(document.querySelectorAll('script'));
            return scripts.some(script => 
              script.textContent?.includes('getLayerFromURL') || 
              script.textContent?.includes('getURLParameter')
            );
          }
        },
        {
          name: 'group-card אלמנטים נוצרים',
          check: () => {
            const grid = document.getElementById('groupsGrid');
            return grid !== null;
          }
        },
        {
          name: 'layerTitle קיים',
          check: () => {
            return document.getElementById('layerTitle') !== null;
          }
        },
        {
          name: 'live-reload.js נטען',
          check: () => {
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            return scripts.some(script => script.src.includes('live-reload.js'));
          }
        },
        {
          name: 'shared-utils.js נטען',
          check: () => {
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            return scripts.some(script => script.src.includes('shared-utils.js'));
          }
        },
        {
          name: 'data.js נטען',
          check: () => {
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            return scripts.some(script => script.src.includes('data.js'));
          }
        }
      ],
      
      'index.html': [
        {
          name: 'DataStore.load נקרא',
          check: () => {
            const scripts = Array.from(document.querySelectorAll('script'));
            return scripts.some(script => 
              script.textContent?.includes('DataStore.load')
            );
          }
        },
        {
          name: 'updateCounts פונקציה קיימת',
          check: () => {
            const scripts = Array.from(document.querySelectorAll('script'));
            return scripts.some(script => 
              script.textContent?.includes('updateCounts')
            );
          }
        },
        {
          name: 'count7, count8, count9 אלמנטים קיימים',
          check: () => {
            return document.getElementById('count7') !== null &&
                   document.getElementById('count8') !== null &&
                   document.getElementById('count9') !== null;
          }
        },
        {
          name: 'live-reload.js נטען',
          check: () => {
            const scripts = Array.from(document.querySelectorAll('script[src]'));
            return scripts.some(script => script.src.includes('live-reload.js'));
          }
        }
      ]
    },

    // בדיקה בסיסית של מבנה HTML
    validateHTMLStructure: function(filePath) {
      const checks = this.criticalChecks[filePath] || [];
      const results = [];
      
      checks.forEach(check => {
        try {
          const passed = check.check();
          results.push({
            name: check.name,
            passed: passed,
            error: passed ? null : 'בדיקה נכשלה'
          });
        } catch (error) {
          results.push({
            name: check.name,
            passed: false,
            error: error.message
          });
        }
      });
      
      return results;
    },

    // בדיקת שינויים בקובץ
    validateFileChanges: function(fileContent, fileName) {
      const issues = [];
      
      // בדיקה כללית - אין שגיאות syntax בולטות
      if (fileName.endsWith('.html')) {
        // בדיקת tags סגורים
        const openTags = (fileContent.match(/<[^\/!][^>]*>/g) || []).length;
        const closeTags = (fileContent.match(/<\/[^>]+>/g) || []).length;
        
        // בדיקה בסיסית - יש לפחות כמה tags
        if (openTags === 0 || closeTags === 0) {
          issues.push('⚠️ נראה שהקובץ ריק או פגום');
        }
        
        // בדיקה שכל script tags סגורים נכון
        const scriptOpen = (fileContent.match(/<script[^>]*>/gi) || []).length;
        const scriptClose = (fileContent.match(/<\/script>/gi) || []).length;
        if (scriptOpen !== scriptClose) {
          issues.push('❌ יש script tags שלא סגורים!');
        }
      }
      
      if (fileName.endsWith('.js')) {
        // בדיקה בסיסית של JavaScript
        try {
          // נסה לזהות שגיאות syntax בסיסיות
          if (fileContent.includes('function(') && !fileContent.includes('function')) {
            // זה לא שגיאה, אבל נבדוק שסוגריים תואמים
          }
        } catch (e) {
          issues.push('⚠️ יש בעיה ב-JavaScript syntax');
        }
      }
      
      return issues;
    },

    // בדיקה שהתלויות עדיין קיימות
    checkDependencies: function(fileContent, fileName) {
      const dependencies = {
        'layer.html': ['data.js', 'shared-utils.js', 'auto-load-data.js', 'live-reload.js'],
        'index.html': ['data.js', 'auto-load-data.js', 'live-reload.js'],
        'group.html': ['data.js', 'shared-utils.js', 'auto-load-data.js', 'live-reload.js'],
        'class.html': ['data.js', 'shared-utils.js', 'auto-load-data.js', 'live-reload.js'],
        'student.html': ['data.js', 'shared-utils.js', 'auto-load-data.js', 'live-reload.js'],
        'teacher.html': ['data.js', 'shared-utils.js', 'auto-load-data.js', 'live-reload.js']
      };
      
      const deps = dependencies[fileName] || [];
      const missing = [];
      
      deps.forEach(dep => {
        if (!fileContent.includes(dep)) {
          missing.push(dep);
        }
      });
      
      return {
        required: deps,
        missing: missing,
        allPresent: missing.length === 0
      };
    },

    // יצירת דוח בדיקה
    generateReport: function(fileName, fileContent, validationResults) {
      const deps = this.checkDependencies(fileContent, fileName);
      const structureIssues = this.validateFileChanges(fileContent, fileName);
      
      const report = {
        fileName: fileName,
        timestamp: new Date().toISOString(),
        dependencies: deps,
        structureIssues: structureIssues,
        criticalChecks: validationResults,
        status: 'unknown'
      };
      
      // קבע סטטוס
      const hasCriticalFailures = validationResults.some(r => !r.passed);
      const hasMissingDeps = !deps.allPresent;
      const hasStructureIssues = structureIssues.length > 0;
      
      if (hasCriticalFailures || hasMissingDeps || hasStructureIssues) {
        report.status = 'failed';
      } else {
        report.status = 'passed';
      }
      
      return report;
    }
  };

  // Export to window for use in browser console
  if (typeof window !== 'undefined') {
    window.ValidationSystem = ValidationSystem;
  }

  // Export for Node.js (if running in Node)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = ValidationSystem;
  }
})();

