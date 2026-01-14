/**
 * עדכון מחנכי כיתות
 * סקריפט זה מעדכן את המחנכים של כיתות ז'3 וז'4
 */

(function() {
  'use strict';
  
  // בדוק אם כבר בוצע העדכון (מונע הרצה חוזרת)
  const updateKey = 'classTeachersUpdate_ז3_ז4';
  if (localStorage.getItem(updateKey) === 'completed') {
    console.log('✅ עדכון מחנכי כיתות כבר בוצע בעבר');
    return;
  }
  
  // בדוק אם DataStore נטען
  if (typeof DataStore === 'undefined') {
    console.error('❌ DataStore לא נטען');
    return;
  }
  
  // טען נתונים
  DataStore.load(true);
  
  console.log('🔄 מתחיל עדכון מחנכי כיתות...');
  
  // רשימת מחנכי כיתות לעדכון
  const classTeachers = [
    { className: "כיתה ז'3", layer: "7", teacherName: "חני לוי" },
    { className: "כיתה ז'4", layer: "7", teacherName: "אליעד לביא" }
  ];
  
  // עדכן כל כיתה
  classTeachers.forEach(({ className, layer, teacherName }) => {
    // מצא או צור את המורה
    let teacher = DataStore.teachers.find(t => t.name === teacherName);
    if (!teacher) {
      teacher = {
        id: DataStore.generateId(),
        name: teacherName
      };
      DataStore.teachers.push(teacher);
      console.log(`✅ נוצר מורה חדש: ${teacherName}`);
    } else {
      console.log(`✅ נמצא מורה: ${teacherName}`);
    }
    
    // מצא או צור את הכיתה
    let classItem = DataStore.classes.find(c => 
      c.name === className && String(c.layer) === String(layer)
    );
    
    if (!classItem) {
      classItem = {
        id: DataStore.generateId(),
        name: className,
        layer: layer,
        teacherId: teacher.id
      };
      DataStore.classes.push(classItem);
      console.log(`✅ נוצרה כיתה חדשה: ${className} עם מחנך ${teacherName}`);
    } else {
      classItem.teacherId = teacher.id;
      console.log(`✅ עודכן מחנך לכיתה ${className}: ${teacherName}`);
    }
  });
  
  // שמירה ל-localStorage
  try {
    // שמירה דרך DataStore.save() - שימוש במנגנון המרכזי עם טיפול בשגיאות
    const saved = DataStore.save(true); // force save עם ביטול cache אוטומטי
    if (saved) {
      console.log('✅ נתונים נשמרו בהצלחה');
    } else {
      console.error('❌ שמירה נכשלה - ייתכן ש-localStorage מלא');
      // טיפול ב-QuotaExceededError
      try {
        const testData = JSON.parse(localStorage.getItem('schoolData') || '{}');
        if (testData.students && testData.students.length > 1000) {
          console.warn('⚠️ יותר מדי תלמידים - ייתכן שצריך לנקות נתונים ישנים');
        }
      } catch (cleanError) {
        console.error('❌ שגיאה בבדיקת נתונים:', cleanError);
      }
      return;
    }
  } catch (e) {
    console.error('❌ שגיאה בשמירת נתונים:', e);
    if (e.name === 'QuotaExceededError') {
      console.warn('⚠️ localStorage מלא - נדרש ניקוי. נסה לנקות את ה-localStorage');
    }
    return;
  }
  
  // סמן שהעדכון בוצע
  localStorage.setItem(updateKey, 'completed');
  console.log('✅ עדכון מחנכי כיתות הושלם בהצלחה!');
})();