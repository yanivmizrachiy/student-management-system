/**
 * DataStore - מאגר נתונים מרכזי
 * מקור האמת היחיד לכל הנתונים במערכת
 * 
 * @version 2.0 - Rebuilt from scratch
 */

(function() {
  'use strict';

  // מאגר נתונים מרכזי
  const DataStore = {
    // ============================================
    // הרשאות
    // ============================================
    get isAdmin() {
      return localStorage.getItem('isAdmin') === 'true';
    },
    set isAdmin(value) {
      localStorage.setItem('isAdmin', value ? 'true' : 'false');
    },

    // ============================================
    // ישויות
    // ============================================
    students: [],
    classes: [],
    groups: [],
    teachers: [],
    gradeColumns: [],

    // ============================================
    // מבנה קבוצות לפי שכבה
    // ============================================
    groupStructure: {
      '7': ['מדעית', 'א\'', 'א\'1', 'מקדמת'],
      '8': ['מדעית', 'א\'(1)', 'א\'(2)', 'א\'1', 'מקדמת'],
      '9': ['מדעית', 'א\'(1)', 'א\'(2)', 'א\'1', 'מקדמת']
    },

    // ============================================
    // ניהול טעינה ושמירה
    // ============================================
    _loadedData: null,
    _lastLoadTime: null,
    _saveTimeout: null,

    /**
     * טעינת נתונים מ-localStorage
     * @param {boolean} force - האם לכפות טעינה גם אם נטען לאחרונה
     */
    load(force = false) {
      // בדיקת cache לטעינות מיותרות (רק אם לא force)
      if (!force && this._lastLoadTime && (Date.now() - this._lastLoadTime < 100)) {
        return;
      }

      const saved = localStorage.getItem('schoolData');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          this.students = Array.isArray(data.students) ? data.students : [];
          this.classes = Array.isArray(data.classes) ? data.classes : [];
          this.groups = Array.isArray(data.groups) ? data.groups : [];
          this.teachers = Array.isArray(data.teachers) ? data.teachers : [];
          this.gradeColumns = Array.isArray(data.gradeColumns) ? data.gradeColumns : [];

          this._loadedData = data;
          this._lastLoadTime = Date.now();
          this._invalidateCache();
          
          // דיבוג - רק אם force
          if (force && this.students.length > 0) {
            console.log(`📊 DataStore נטען: ${this.students.length} תלמידים, ${this.groups.length} קבוצות, ${this.teachers.length} מורים`);
          }
        } catch (e) {
          console.error('שגיאה בטעינת נתונים:', e);
          this._resetData();
        }
      } else {
        this._resetData();
      }

      // יצירת עמודות ציונים ברירת מחדל אם אין
      if (this.gradeColumns.length === 0) {
        this.initDefaultGradeColumns();
      }
    },

    /**
     * איפוס נתונים
     */
    _resetData() {
      this.students = [];
      this.classes = [];
      this.groups = [];
      this.teachers = [];
      this.gradeColumns = [];
      this._loadedData = null;
      this._lastLoadTime = Date.now();
    },

    /**
     * אתחול עמודות ציונים ברירת מחדל
     */
    initDefaultGradeColumns() {
      const defaultColumns = [
        { id: this.generateId(), name: 'ציון 1' },
        { id: this.generateId(), name: 'ציון 2' },
        { id: this.generateId(), name: 'ציון 3' },
        { id: this.generateId(), name: 'ציון 4' },
        { id: this.generateId(), name: 'ציון 5' }
      ];
      this.gradeColumns = defaultColumns;
      // שמירה מיידית (גם במצב צופה, זה רק אתחול)
      if (this.isAdmin) {
        this.save(true);
      }
    },

    /**
     * שמירת נתונים ל-localStorage
     * @param {boolean} immediate - האם לשמור מיידית (ללא debounce)
     * @returns {boolean} האם השמירה הצליחה/תתבצע
     */
    save(immediate = false) {
      // בדיקת הרשאות
      if (!this.isAdmin) {
        console.warn('⚠️ ניסיון שמירה ללא הרשאה - נחסם');
        return false;
      }

      const saveNow = () => {
        // בדיקה נוספת לפני שמירה
        if (!this.isAdmin) {
          console.warn('⚠️ ניסיון שמירה ללא הרשאה - נחסם');
          return false;
        }

        const data = {
          students: this.students,
          classes: this.classes,
          groups: this.groups,
          teachers: this.teachers,
          gradeColumns: this.gradeColumns
        };

        try {
          localStorage.setItem('schoolData', JSON.stringify(data));
          this._invalidateCache();
          this.triggerGitSync();
          return true;
        } catch (e) {
          console.error('שגיאה בשמירת נתונים:', e);
          if (e.name === 'QuotaExceededError') {
            console.warn('localStorage מלא, מנסה לנקות...');
          }
          return false;
        }
      };

      // שמירה מיידית
      if (immediate) {
        if (this._saveTimeout) {
          clearTimeout(this._saveTimeout);
          this._saveTimeout = null;
        }
        return saveNow();
      }

      // Debounce - דחיית שמירה ל-300ms
      if (this._saveTimeout) {
        clearTimeout(this._saveTimeout);
      }

      this._saveTimeout = setTimeout(() => {
        saveNow();
        this._saveTimeout = null;
      }, 300);

      return true;
    },

    /**
     * הפעלת סנכרון אוטומטי ל-GitHub
     */
    triggerGitSync() {
      try {
        const syncData = {
          timestamp: new Date().toISOString(),
          action: 'save',
          version: Date.now(),
          needsSync: true
        };
        localStorage.setItem('gitSyncMarker', JSON.stringify(syncData));
        if (typeof window !== 'undefined' && window.dispatchEvent) {
          window.dispatchEvent(new CustomEvent('dataSaved', { detail: syncData }));
        }
      } catch (e) {
        console.debug('Git sync marker:', e.message);
      }
    },

    // ============================================
    // Cache למונים
    // ============================================
    _countCache: {},
    _cacheTimestamp: null,
    _cacheTTL: 5000, // 5 שניות

    /**
     * ביטול cache
     */
    _invalidateCache() {
      this._countCache = {};
      this._cacheTimestamp = null;
    },

    /**
     * קבלת מונה מ-cache
     */
    _getCachedCount(key, useCache) {
      if (useCache && this._countCache[key] &&
          this._cacheTimestamp && (Date.now() - this._cacheTimestamp < this._cacheTTL)) {
        return this._countCache[key];
      }
      return null;
    },

    /**
     * שמירת מונה ב-cache
     */
    _setCachedCount(key, count) {
      this._countCache[key] = count;
      this._cacheTimestamp = Date.now();
    },

    // ============================================
    // פונקציות מונים
    // ============================================

    /**
     * ספירת תלמידים בשכבה
     */
    getLayerCount(layer, useCache = true) {
      const cacheKey = `layer_${layer}`;
      const cached = this._getCachedCount(cacheKey, useCache);
      if (cached !== null) return cached;

      if (!layer) return 0;
      const count = this.students.filter(s => s?.layer && String(s.layer) === String(layer)).length;
      this._setCachedCount(cacheKey, count);
      return count;
    },

    /**
     * ספירת תלמידים בקבוצה
     */
    getGroupCount(groupId, useCache = true) {
      const cacheKey = `group_${groupId}`;
      const cached = this._getCachedCount(cacheKey, useCache);
      if (cached !== null) return cached;

      if (!groupId) return 0;
      const count = this.students.filter(s => s?.groupId && String(s.groupId) === String(groupId)).length;
      this._setCachedCount(cacheKey, count);
      return count;
    },

    /**
     * ספירת תלמידים בכיתה
     */
    getClassCount(classId, useCache = true) {
      const cacheKey = `class_${classId}`;
      const cached = this._getCachedCount(cacheKey, useCache);
      if (cached !== null) return cached;

      if (!classId) return 0;
      const count = this.students.filter(s => s?.classId && String(s.classId) === String(classId)).length;
      this._setCachedCount(cacheKey, count);
      return count;
    },

    /**
     * ספירת כל התלמידים
     */
    getTotalCount(useCache = true) {
      const cached = this._getCachedCount('total', useCache);
      if (cached !== null) return cached;

      const count = this.students?.length || 0;
      this._setCachedCount('total', count);
      return count;
    },

    // ============================================
    // פונקציות שאילתות נתונים
    // ============================================

    /**
     * קבלת תלמידים לפי שכבה
     */
    getStudentsByLayer(layer) {
      if (!layer) return [];
      return this.students.filter(s => s?.layer && String(s.layer) === String(layer));
    },

    /**
     * קבלת תלמידים לפי קבוצה
     */
    getStudentsByGroup(groupId) {
      if (!groupId) return [];
      return this.students.filter(s => s?.groupId && String(s.groupId) === String(groupId));
    },

    /**
     * קבלת תלמידים לפי כיתה
     */
    getStudentsByClass(classId) {
      if (!classId) return [];
      return this.students.filter(s => s?.classId && String(s.classId) === String(classId));
    },

    /**
     * קבלת קבוצות לפי שכבה
     */
    getGroupsByLayer(layer) {
      if (!layer) return [];
      return this.groups.filter(g => g?.layer && String(g.layer) === String(layer));
    },

    /**
     * קבלת קבוצות לפי מורה
     */
    getGroupsByTeacher(teacherId) {
      if (!teacherId) return [];
      return this.groups.filter(g => g?.teacherId && String(g.teacherId) === String(teacherId));
    },

    // ============================================
    // פונקציות חיפוש ישויות
    // ============================================

    getClass(classId) {
      return this.classes.find(c => c.id === classId) || null;
    },

    getGroup(groupId) {
      return this.groups.find(g => g.id === groupId) || null;
    },

    getTeacher(teacherId) {
      return this.teachers.find(t => t.id === teacherId) || null;
    },

    getStudent(studentId) {
      return this.students.find(s => s.id === studentId) || null;
    },

    // ============================================
    // פונקציות עזר
    // ============================================

    /**
     * יצירת ID ייחודי
     */
    generateId() {
      return Date.now().toString(36) + Math.random().toString(36).substr(2);
    },

    /**
     * קבלת שם שכבה
     */
    getLayerName(layer) {
      const names = { '7': 'ז\'', '8': 'ח\'', '9': 'ט\'' };
      return names[layer] || layer;
    },

    /**
     * קבלת צבע שכבה
     */
    getLayerColor(layer) {
      const colors = {
        '7': 'linear-gradient(145deg, #2962ff 0%, #1e4ed8 100%)', // כחול
        '8': 'linear-gradient(145deg, #00c853 0%, #00a043 100%)', // ירוק
        '9': 'linear-gradient(145deg, #ff9800 0%, #e68900 100%)'  // כתום
      };
      return colors[layer] || colors['7'];
    },

    /**
     * ייבוא קבוצת תלמידים
     * @param {Object} config - הגדרות קבוצה {layer, groupName, teacherName, className, classTeacherId?}
     * @param {Array} students - מערך תלמידים [{lastName, firstName, className?}]
     */
    importGroup(config, students) {
      this.load();

      // מציאת/יצירת מורה
      let teacher = this.teachers.find(t => t.name === config.teacherName);
      if (!teacher) {
        teacher = { id: this.generateId(), name: config.teacherName };
        this.teachers.push(teacher);
      }

      // מציאת/יצירת כיתות
      const classesUsed = new Set();
      const getOrCreateClass = (className) => {
        let classItem = this.classes.find(c => c.name === className && String(c.layer) === String(config.layer));
        if (!classItem) {
          classItem = {
            id: this.generateId(),
            name: className,
            layer: config.layer,
            teacherId: config.classTeacherId || null
          };
          this.classes.push(classItem);
        }
        classesUsed.add(classItem);
        return classItem;
      };

      // יצירת הכיתה הראשית אם צוין
      if (config.className) {
        getOrCreateClass(config.className);
      }

      // מציאת/יצירת הקבצה (מזהה גם לפי teacherId כדי לאפשר קבוצות עם אותו שם למורים שונים)
      let group = this.groups.find(g => 
        g.name === config.groupName && 
        String(g.layer) === String(config.layer) &&
        g.teacherId === teacher.id
      );
      if (!group) {
        group = {
          id: this.generateId(),
          name: config.groupName,
          layer: config.layer,
          teacherId: teacher.id
        };
        this.groups.push(group);
      }

      // הוספת תלמידים (עם בדיקת כפילויות)
      let added = 0;
      students.forEach(student => {
        const className = student.className || config.className;
        const classItem = getOrCreateClass(className);

        const exists = this.students.find(s =>
          s.firstName === student.firstName &&
          s.lastName === student.lastName &&
          s.classId === classItem.id
        );

        if (!exists) {
          this.students.push({
            id: this.generateId(),
            firstName: student.firstName,
            lastName: student.lastName,
            layer: config.layer,
            classId: classItem.id,
            groupId: group.id,
            grades: {},
            image: null,
            files: []
          });
          added++;
        }
      });

      this._invalidateCache();
      // שמירה גם בלי admin כי זה importGroup (נתונים ראשוניים)
      try {
        const data = {
          students: this.students,
          classes: this.classes,
          groups: this.groups,
          teachers: this.teachers,
          gradeColumns: this.gradeColumns
        };
        localStorage.setItem('schoolData', JSON.stringify(data));
        this._invalidateCache();
      } catch (e) {
        console.error('שגיאה בשמירת נתונים:', e);
      }
      const primaryClass = config.className ?
        this.classes.find(c => c.name === config.className && String(c.layer) === String(config.layer)) :
        Array.from(classesUsed)[0];
      return { added, total: students.length, teacher, classItem: primaryClass, classesUsed: Array.from(classesUsed), group };
    },

    /**
     * איפוס כל הנתונים
     */
    clearAll() {
      this._resetData();
      this._invalidateCache();
      if (this.isAdmin) {
        this.save(true);
      }
    }
  };

  // חשיפה גלובלית
  window.DataStore = DataStore;

  // אתחול
  DataStore.load();
})();
