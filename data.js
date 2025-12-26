// מאגר נתונים מרכזי - מקור האמת היחיד
const DataStore = {
  // הגדרת הרשאות (false = צופה, true = בעל מערכת)
  get isAdmin() {
    return localStorage.getItem('isAdmin') === 'true';
  },
  set isAdmin(value) {
    localStorage.setItem('isAdmin', value ? 'true' : 'false');
  },
  
  // ישויות
  students: [],
  classes: [],
  groups: [],
  teachers: [],
  gradeColumns: [], // עמודות ציונים דינמיות
  
  // הגדרת מבנה הקבצות לפי שכבה
  groupStructure: {
    '7': ['מדעית', 'א\'', 'א\'1', 'מקדמת'],
    '8': ['מדעית', 'א\'(1)', 'א\'(2)', 'א\'1', 'מקדמת'],
    '9': ['מדעית', 'א\'(1)', 'א\'(2)', 'א\'1', 'מקדמת']
  },
  
  // טעינת נתונים (עם cache כדי למנוע טעינות מיותרות)
  _loadedData: null,
  _lastLoadTime: null,
  
  load(force = false) {
    // אם כבר נטען לאחרונה (בטווח של 100ms), לא נטען שוב
    if (!force && this._lastLoadTime && (Date.now() - this._lastLoadTime < 100)) {
      return;
    }
    
    const saved = localStorage.getItem('schoolData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.students = data.students || [];
        this.classes = data.classes || [];
        this.groups = data.groups || [];
        this.teachers = data.teachers || [];
        this.gradeColumns = data.gradeColumns || [];
        
        this._loadedData = data;
        this._lastLoadTime = Date.now();
        
        // ביטול cache אחרי טעינה
        this._invalidateCache();
      } catch (e) {
        console.error('שגיאה בטעינת נתונים:', e);
        this.students = [];
        this.classes = [];
        this.groups = [];
        this.teachers = [];
        this.gradeColumns = [];
        this._loadedData = null;
        this._lastLoadTime = Date.now();
      }
    } else {
      this.students = [];
      this.classes = [];
      this.groups = [];
      this.teachers = [];
      this.gradeColumns = [];
      this._loadedData = null;
      this._lastLoadTime = Date.now();
    }
    
    // אם אין עמודות ציונים, הוסף 5 עמודות ברירת מחדל
    if (this.gradeColumns.length === 0) {
      this.initDefaultGradeColumns();
    }
  },
  
  // אתחול 5 עמודות ציונים ברירת מחדל
  initDefaultGradeColumns() {
    const defaultColumns = [
      { id: this.generateId(), name: 'ציון 1' },
      { id: this.generateId(), name: 'ציון 2' },
      { id: this.generateId(), name: 'ציון 3' },
      { id: this.generateId(), name: 'ציון 4' },
      { id: this.generateId(), name: 'ציון 5' }
    ];
    this.gradeColumns = defaultColumns;
    // שמירה תמידית מיידית (גם אם אין נתונים אחרים, כדי לשמור את העמודות)
    this.save(true);
  },
  
  // Debounced save function - שמירה עם debounce לשיפור performance
  _saveTimeout: null,
  
  // שמירת נתונים (עם debounce לשיפור performance)
  save(immediate = false) {
    const saveNow = () => {
      const data = {
        students: this.students,
        classes: this.classes,
        groups: this.groups,
        teachers: this.teachers,
        gradeColumns: this.gradeColumns
      };
      
      try {
        localStorage.setItem('schoolData', JSON.stringify(data));
        // ביטול cache אחרי שמירה
        this._invalidateCache();
        // סנכרון אוטומטי ל-GitHub
        this.triggerGitSync();
        return true;
      } catch (e) {
        console.error('שגיאה בשמירת נתונים:', e);
        // אם localStorage מלא, נסה לנקות נתונים ישנים
        if (e.name === 'QuotaExceededError') {
          console.warn('localStorage מלא, מנסה לנקות...');
          // כאן אפשר להוסיף לוגיקה לניקוי נתונים ישנים
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
    
    return true; // מחזיר true כי השמירה תתבצע
  },
  
  // פונקציה להפעלת סנכרון אוטומטי ל-GitHub
  triggerGitSync() {
    try {
      // יוצר marker ב-localStorage שהקובץ Node.js יקרא
      const syncData = {
        timestamp: new Date().toISOString(),
        action: 'save',
        version: Date.now(),
        needsSync: true
      };
      
      // שמור marker ב-localStorage (ה-Node.js script יקרא את זה דרך localStorage dump)
      localStorage.setItem('gitSyncMarker', JSON.stringify(syncData));
      
      // נסה לשלוח event ל-background script (אם יש)
      if (typeof window !== 'undefined' && window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('dataSaved', { detail: syncData }));
      }
    } catch (e) {
      // שקט - זה לא קריטי אם הסנכרון לא עובד
      console.log('Git sync marker:', e.message);
    }
  },
  
  // Cache for counts - משפר performance משמעותית
  _countCache: {},
  _cacheTimestamp: null,
  _cacheTTL: 5000, // 5 שניות
  
  // Invalidate cache when data changes
  _invalidateCache() {
    this._countCache = {};
    this._cacheTimestamp = null;
  },
  
  // פונקציות עזר - מונים (עם cache לשיפור performance)
  getLayerCount(layer, useCache = true) {
    // בדיקת cache
    if (useCache && this._countCache[`layer_${layer}`] && 
        this._cacheTimestamp && (Date.now() - this._cacheTimestamp < this._cacheTTL)) {
      return this._countCache[`layer_${layer}`];
    }
    
    // חישוב חדש
    if (!layer) return 0;
    const layerStr = String(layer);
    const count = this.students.filter(s => s && s.layer && String(s.layer) === layerStr).length;
    
    // שמירה ב-cache
    this._countCache[`layer_${layer}`] = count;
    this._cacheTimestamp = Date.now();
    
    return count;
  },
  
  getGroupCount(groupId, useCache = true) {
    // בדיקת cache
    if (useCache && this._countCache[`group_${groupId}`] && 
        this._cacheTimestamp && (Date.now() - this._cacheTimestamp < this._cacheTTL)) {
      return this._countCache[`group_${groupId}`];
    }
    
    // חישוב חדש
    if (!groupId) return 0;
    const groupIdStr = String(groupId);
    const count = this.students.filter(s => s && s.groupId && String(s.groupId) === groupIdStr).length;
    
    // שמירה ב-cache
    this._countCache[`group_${groupId}`] = count;
    this._cacheTimestamp = Date.now();
    
    return count;
  },
  
  getClassCount(classId, useCache = true) {
    // בדיקת cache
    if (useCache && this._countCache[`class_${classId}`] && 
        this._cacheTimestamp && (Date.now() - this._cacheTimestamp < this._cacheTTL)) {
      return this._countCache[`class_${classId}`];
    }
    
    // חישוב חדש
    if (!classId) return 0;
    const classIdStr = String(classId);
    const count = this.students.filter(s => s && s.classId && String(s.classId) === classIdStr).length;
    
    // שמירה ב-cache
    this._countCache[`class_${classId}`] = count;
    this._cacheTimestamp = Date.now();
    
    return count;
  },
  
  getTotalCount(useCache = true) {
    // בדיקת cache
    if (useCache && this._countCache['total'] && 
        this._cacheTimestamp && (Date.now() - this._cacheTimestamp < this._cacheTTL)) {
      return this._countCache['total'];
    }
    
    // חישוב חדש
    const count = this.students ? this.students.length : 0;
    
    // שמירה ב-cache
    this._countCache['total'] = count;
    this._cacheTimestamp = Date.now();
    
    return count;
  },
  
  // פונקציות עזר - נתונים
  getStudentsByLayer(layer) {
    return this.students.filter(s => s.layer === layer);
  },
  
  getStudentsByGroup(groupId) {
    return this.students.filter(s => s.groupId === groupId);
  },
  
  getStudentsByClass(classId) {
    return this.students.filter(s => s.classId === classId);
  },
  
  getGroupsByLayer(layer) {
    return this.groups.filter(g => g.layer === layer);
  },
  
  getGroupsByTeacher(teacherId) {
    return this.groups.filter(g => g.teacherId === teacherId);
  },
  
  getClass(classId) {
    return this.classes.find(c => c.id === classId);
  },
  
  getGroup(groupId) {
    return this.groups.find(g => g.id === groupId);
  },
  
  getTeacher(teacherId) {
    return this.teachers.find(t => t.id === teacherId);
  },
  
  getStudent(studentId) {
    return this.students.find(s => s.id === studentId);
  },
  
  // פונקציות עזר - יצירת ID
  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  },
  
  // פונקציות עזר - שמות
  getLayerName(layer) {
    const names = { '7': 'ז\'', '8': 'ח\'', '9': 'ט\'' };
    return names[layer] || layer;
  },
  
  getLayerColor(layer) {
    const colors = {
      '7': 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)',
      '8': 'linear-gradient(145deg, #f093fb 0%, #f5576c 100%)',
      '9': 'linear-gradient(145deg, #4facfe 0%, #00f2fe 100%)'
    };
    return colors[layer] || 'linear-gradient(145deg, #667eea 0%, #764ba2 100%)';
  },

  // פונקציה חכמה להזנת קבוצת תלמידים
  // students: [{lastName, firstName, className?}] - אם className לא מצוין, משתמש ב-className הכללי
  // config: {layer, groupName, teacherName, className, classTeacherId?}
  importGroup(config, students) {
    this.load();
    
    // מציאת/יצירת מורה
    let teacher = this.teachers.find(t => t.name === config.teacherName);
    if (!teacher) {
      teacher = { id: this.generateId(), name: config.teacherName };
      this.teachers.push(teacher);
    }

    // מציאת/יצירת כיתות (תמיכה במספר כיתות)
    const classesUsed = new Set();
    const getOrCreateClass = (className) => {
      let classItem = this.classes.find(c => c.name === className && c.layer === config.layer);
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

    // יצירת הכיתה הראשית אם לא צוין אחרת
    if (config.className) {
      getOrCreateClass(config.className);
    }

    // מציאת/יצירת הקבצה
    let group = this.groups.find(g => g.name === config.groupName && g.layer === config.layer);
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
          groupId: group.id
        });
        added++;
      }
    });

    this.save();
    const primaryClass = config.className ? this.classes.find(c => c.name === config.className && c.layer === config.layer) : Array.from(classesUsed)[0];
    return { added, total: students.length, teacher, classItem: primaryClass, classesUsed: Array.from(classesUsed), group };
  },

  // איפוס כל הנתונים
  clearAll() {
    this.students = [];
    this.classes = [];
    this.groups = [];
    this.teachers = [];
    this.gradeColumns = [];
    this.save();
  }
};

// אתחול
DataStore.load();

