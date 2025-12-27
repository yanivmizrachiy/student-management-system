/**
 * Shared Utilities - כלי עזר משותפים
 * פונקציות שימושיות לכל העמודים
 * 
 * @version 2.0 - Rebuilt from scratch
 */

(function() {
  'use strict';

  // ============================================
  // פונקציות תזמון
  // ============================================

  /**
   * Debounce - דחיית ביצוע עד לסיום שינויים
   */
  function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  /**
   * Throttle - הגבלת תדירות ביצוע
   */
  function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  // ============================================
  // פונקציות עיצוב וטקסט
  // ============================================

  /**
   * Escape HTML - הגנה מפני XSS
   */
  function escapeHtml(text) {
    if (!text && text !== 0) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * פורמט שם כיתה - הסרת "כיתה " מתחילת שם
   */
  function formatClassName(className) {
    if (className && className.startsWith('כיתה ')) {
      return className.substring(5);
    }
    return className;
  }

  // ============================================
  // ניווט ו-URL
  // ============================================

  /**
   * קבלת פרמטר מ-URL
   */
  function getURLParameter(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  /**
   * ניווט לעמוד עם טיפול בשגיאות
   */
  function navigateToPage(url, fallback = 'index.html') {
    try {
      window.location.href = url;
    } catch (e) {
      console.error('Navigation error:', e);
      window.location.href = fallback;
    }
  }

  /**
   * בדיקה אם נתון נדרש קיים, אחרת redirect
   */
  function requireData(condition, redirectUrl = 'index.html') {
    if (!condition) {
      navigateToPage(redirectUrl);
      return false;
    }
    return true;
  }

  // ============================================
  // DOM ונראות
  // ============================================

  /**
   * בדיקה אם אלמנט נראה ב-viewport
   */
  function isInViewport(element) {
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
      rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
  }

  /**
   * גלילה חלקה לאלמנט
   */
  function scrollToElement(element, offset = 0) {
    const elementPosition = element.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });
  }

  /**
   * יצירת breadcrumbs
   */
  function renderBreadcrumbs(items) {
    return items.map((item, index) => {
      if (index === items.length - 1) {
        return `<span>${escapeHtml(item.text)}</span>`;
      }
      return `<a href="${escapeHtml(item.href)}">${escapeHtml(item.text)}</a>`;
    }).join(' / ');
  }

  // ============================================
  // תמונות וקבצים
  // ============================================

  /**
   * דחיסת תמונה
   */
  function compressImage(file, maxWidth = 1920, maxHeight = 1080, quality = 0.8) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // חישוב מימדים חדשים
          if (width > maxWidth || height > maxHeight) {
            if (width > height) {
              height = (height * maxWidth) / width;
              width = maxWidth;
            } else {
              width = (width * maxHeight) / height;
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);

          canvas.toBlob((blob) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsDataURL(blob);
          }, 'image/jpeg', quality);
        };
        img.onerror = reject;
        img.src = e.target.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // ============================================
  // התראות והודעות
  // ============================================

  /**
   * הצגת התראה/הודעה
   */
  function showNotification(message, type = 'info', duration = 3000) {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
      color: white;
      padding: 15px 25px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000;
      animation: slideIn 0.3s ease;
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, duration);
  }

  // ============================================
  // חשיפה גלובלית
  // ============================================

  if (typeof window !== 'undefined') {
    window.SharedUtils = {
      debounce,
      throttle,
      escapeHtml,
      formatClassName,
      getURLParameter,
      navigateToPage,
      requireData,
      isInViewport,
      scrollToElement,
      renderBreadcrumbs,
      compressImage,
      showNotification
    };
  }
})();
