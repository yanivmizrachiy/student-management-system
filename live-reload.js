/**
 * Live Reload Script - רענון אוטומטי כשמתעדכנים קבצים
 * מוסיף רענון אוטומטי לכל עמוד HTML
 */
(function() {
    'use strict';
    
    let lastTimestamp = 0;
    let isPolling = false;
    let reloadIndicator = null;
    
    // יצירת אינדיקטור ויזואלי
    function createReloadIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'live-reload-indicator';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(76, 175, 80, 0.9);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            z-index: 10000;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.2);
        `;
        indicator.innerHTML = '<span style="width: 8px; height: 8px; background: white; border-radius: 50%; display: inline-block; animation: pulse-dot 2s infinite;"></span> רענון אוטומטי פעיל';
        
        // הוספת אנימציה
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse-dot {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.5; transform: scale(0.8); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(indicator);
        return indicator;
    }
    
    let consecutiveErrors = 0;
    const MAX_ERRORS = 5;
    
    function checkForUpdates() {
        fetch('/check-update', {
            method: 'GET',
            cache: 'no-cache',
            headers: {
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache'
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                consecutiveErrors = 0; // איפוס מונה שגיאות
                const currentTimestamp = data.timestamp || 0;
                
                if (lastTimestamp === 0) {
                    // זה הפעם הראשונה - שמור את ה-timestamp הנוכחי
                    lastTimestamp = currentTimestamp;
                    console.log('✅ רענון אוטומטי פעיל - ממתין לעדכונים...');
                    if (reloadIndicator) {
                        reloadIndicator.style.background = 'rgba(76, 175, 80, 0.9)';
                        reloadIndicator.innerHTML = '<span style="width: 8px; height: 8px; background: white; border-radius: 50%; display: inline-block; animation: pulse-dot 2s infinite;"></span> רענון אוטומטי פעיל';
                    }
                } else if (currentTimestamp > lastTimestamp) {
                    // יש עדכון! רענן את הדף
                    const updatedFile = data.file || 'קובץ';
                    console.log(`🔄 מזוהה עדכון ב-${updatedFile}, מרענן...`);
                    
                    // הצגת הודעה לפני רענון
                    if (reloadIndicator) {
                        reloadIndicator.style.background = 'rgba(255, 152, 0, 0.9)';
                        reloadIndicator.innerHTML = '<span style="width: 8px; height: 8px; background: white; border-radius: 50%; display: inline-block;"></span> מרענן...';
                    }
                    
                    lastTimestamp = currentTimestamp;
                    setTimeout(() => {
                        window.location.reload(true); // force reload
                    }, 300);
                }
            })
            .catch(error => {
                consecutiveErrors++;
                console.debug(`Live reload check failed (${consecutiveErrors}/${MAX_ERRORS}), will retry...`);
                
                if (reloadIndicator) {
                    if (consecutiveErrors >= MAX_ERRORS) {
                        reloadIndicator.style.background = 'rgba(244, 67, 54, 0.9)';
                        reloadIndicator.innerHTML = '<span style="width: 8px; height: 8px; background: white; border-radius: 50%; display: inline-block;"></span> חיבור לשרת נכשל';
                    } else {
                        reloadIndicator.style.background = 'rgba(255, 193, 7, 0.9)';
                        reloadIndicator.innerHTML = '<span style="width: 8px; height: 8px; background: white; border-radius: 50%; display: inline-block;"></span> מנסה להתחבר...';
                    }
                }
                
                // אם יש יותר מדי שגיאות, נסה לרענן את הדף
                if (consecutiveErrors >= MAX_ERRORS * 2) {
                    console.log('🔄 יותר מדי שגיאות - מרענן דף...');
                    setTimeout(() => {
                        window.location.reload(true);
                    }, 2000);
                }
            });
    }
    
    // בדוק כל 2 שניות אם יש עדכונים
    function startPolling() {
        if (isPolling) return;
        isPolling = true;
        
        // יצירת אינדיקטור ויזואלי
        if (document.body && !document.getElementById('live-reload-indicator')) {
            reloadIndicator = createReloadIndicator();
        }
        
        // בדיקה ראשונית מיד
        checkForUpdates();
        
        // בדיקה כל 2 שניות
        setInterval(checkForUpdates, 2000);
        
        // בדיקה נוספת כל 10 שניות (backup)
        setInterval(() => {
            if (consecutiveErrors > 0) {
                console.log('🔄 בדיקת חיבור מחדש...');
                checkForUpdates();
            }
        }, 10000);
    }
    
    // התחל כשהדף נטען
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', startPolling);
    } else {
        startPolling();
    }
})();

