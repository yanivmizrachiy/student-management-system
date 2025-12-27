/**
 * Live Reload Script - רענון אוטומטי כשמתעדכנים קבצים
 * מוסיף רענון אוטומטי לכל עמוד HTML
 */
(function() {
    'use strict';
    
    let lastTimestamp = 0;
    let isPolling = false;
    
    function checkForUpdates() {
        fetch('/check-update')
            .then(response => response.json())
            .then(data => {
                const currentTimestamp = data.timestamp || 0;
                
                if (lastTimestamp === 0) {
                    // זה הפעם הראשונה - שמור את ה-timestamp הנוכחי
                    lastTimestamp = currentTimestamp;
                } else if (currentTimestamp > lastTimestamp) {
                    // יש עדכון! רענן את הדף
                    console.log('🔄 מזוהה עדכון בקובץ, מרענן...');
                    lastTimestamp = currentTimestamp;
                    window.location.reload();
                }
            })
            .catch(error => {
                // אם יש שגיאה, נסה שוב בעוד קצת
                console.debug('Live reload check failed, will retry...');
            });
    }
    
    // בדוק כל 2 שניות אם יש עדכונים
    function startPolling() {
        if (isPolling) return;
        isPolling = true;
        setInterval(checkForUpdates, 2000);
        checkForUpdates(); // בדיקה ראשונית
    }
    
    // התחל כשהדף נטען
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startPolling);
    } else {
        startPolling();
    }
})();

