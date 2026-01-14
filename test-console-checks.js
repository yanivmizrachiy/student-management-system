/**
 * בדיקות קונסול מהירות לבדיקת שמירת נתונים
 * ניתן להריץ בקונסול הדפדפן: copy-paste את כל הקוד
 */

(function() {
  'use strict';

  console.log('🔍 מתחיל בדיקות שמירת נתונים...\n');

  // ============================================
  // בדיקה 1: זמינות DataStore
  // ============================================
  console.group('✅ בדיקה 1: זמינות DataStore');
  if (typeof DataStore === 'undefined') {
    console.error('❌ DataStore לא זמין! יש לטעון את data.js קודם');
    return;
  }
  console.log('✅ DataStore זמין');
  console.groupEnd();

  // ============================================
  // בדיקה 2: טעינת נתונים
  // ============================================
  console.group('✅ בדיקה 2: טעינת נתונים');
  DataStore.load(true);
  const studentsCount = DataStore.students.length;
  const classesCount = DataStore.classes.length;
  const groupsCount = DataStore.groups.length;
  const teachersCount = DataStore.teachers.length;
  const gradeColumnsCount = DataStore.gradeColumns.length;
  
  console.log(`📊 נתונים נטענו:
    - תלמידים: ${studentsCount}
    - כיתות: ${classesCount}
    - קבוצות: ${groupsCount}
    - מורים: ${teachersCount}
    - עמודות ציונים: ${gradeColumnsCount}`);
  console.groupEnd();

  // ============================================
  // בדיקה 3: בדיקת localStorage
  // ============================================
  console.group('✅ בדיקה 3: בדיקת localStorage');
  const savedData = localStorage.getItem('schoolData');
  if (savedData) {
    try {
      const parsed = JSON.parse(savedData);
      const sizeKB = (savedData.length / 1024).toFixed(2);
      console.log(`✅ נתונים ב-localStorage: ${sizeKB} KB`);
      console.log(`   - תלמידים: ${parsed.students?.length || 0}`);
      console.log(`   - כיתות: ${parsed.classes?.length || 0}`);
      console.log(`   - קבוצות: ${parsed.groups?.length || 0}`);
      console.log(`   - מורים: ${parsed.teachers?.length || 0}`);
      console.log(`   - עמודות ציונים: ${parsed.gradeColumns?.length || 0}`);
    } catch (e) {
      console.error('❌ שגיאה בפענוח JSON:', e);
    }
  } else {
    console.warn('⚠️ אין נתונים ב-localStorage');
  }
  console.groupEnd();

  // ============================================
  // בדיקה 4: בדיקת הרשאות
  // ============================================
  console.group('✅ בדיקה 4: בדיקת הרשאות');
  const isAdmin = DataStore.isAdmin;
  console.log(`הרשאות: ${isAdmin ? '✅ מנהל' : '👁️ צופה'}`);
  if (!isAdmin) {
    console.warn('⚠️ במצב צופה, שמירה תיחסם');
  }
  console.groupEnd();

  // ============================================
  // בדיקה 5: בדיקת שמירה (אם יש הרשאות)
  // ============================================
  if (isAdmin && studentsCount > 0) {
    console.group('✅ בדיקה 5: בדיקת שמירה');
    
    // שמירת מצב נוכחי
    const testStudent = DataStore.students[0];
    const originalFirstName = testStudent.firstName;
    const testValue = 'בדיקה_' + Date.now();
    
    // שינוי זמני
    testStudent.firstName = testValue;
    const saveResult = DataStore.save(true);
    
    if (saveResult) {
      console.log('✅ שמירה הצליחה');
      
      // טעינה מחדש
      DataStore.load(true);
      const reloadedStudent = DataStore.getStudent(testStudent.id);
      
      if (reloadedStudent && reloadedStudent.firstName === testValue) {
        console.log('✅ נתונים נשמרו ונקראו בהצלחה');
        
        // החזרת מצב קודם
        reloadedStudent.firstName = originalFirstName;
        DataStore.save(true);
        console.log('✅ מצב קודם הוחזר');
      } else {
        console.error('❌ נתונים לא נשמרו כראוי!');
        console.log(`   מצופה: "${testValue}"`);
        console.log(`   נמצא: "${reloadedStudent?.firstName || 'אין'}"`);
      }
    } else {
      console.error('❌ שמירה נכשלה');
      // החזרת מצב קודם
      testStudent.firstName = originalFirstName;
    }
    
    console.groupEnd();
  } else {
    console.group('⏭️ בדיקה 5: דילוג');
    if (!isAdmin) {
      console.log('דילוג - אין הרשאות מנהל');
    } else {
      console.log('דילוג - אין תלמידים לבדיקה');
    }
    console.groupEnd();
  }

  // ============================================
  // בדיקה 6: תקינות נתונים
  // ============================================
  console.group('✅ בדיקה 6: תקינות נתונים');
  
  let issues = [];
  
  // בדיקת קשרי תלמידים-כיתות
  const studentsWithoutClass = DataStore.students.filter(s => !s.classId || !DataStore.getClass(s.classId));
  if (studentsWithoutClass.length > 0) {
    issues.push(`${studentsWithoutClass.length} תלמידים ללא כיתה תקינה`);
  }
  
  // בדיקת קשרי תלמידים-קבוצות
  const studentsWithoutGroup = DataStore.students.filter(s => !s.groupId || !DataStore.getGroup(s.groupId));
  if (studentsWithoutGroup.length > 0) {
    issues.push(`${studentsWithoutGroup.length} תלמידים ללא קבוצה תקינה`);
  }
  
  // בדיקת כפילויות ID
  const studentIds = DataStore.students.map(s => s.id);
  const duplicateIds = studentIds.filter((id, index) => studentIds.indexOf(id) !== index);
  if (duplicateIds.length > 0) {
    issues.push(`${duplicateIds.length} כפילויות ID תלמידים`);
  }
  
  if (issues.length === 0) {
    console.log('✅ כל הנתונים תקינים');
  } else {
    console.warn('⚠️ נמצאו בעיות תקינות:');
    issues.forEach(issue => console.warn('   - ' + issue));
  }
  
  console.groupEnd();

  // ============================================
  // בדיקה 7: בדיקת Debounce
  // ============================================
  console.group('✅ בדיקה 7: בדיקת Debounce');
  
  if (isAdmin) {
    // בדיקת שמירה מיידית
    const immediateResult = DataStore.save(true);
    console.log(`שמירה מיידית: ${immediateResult ? '✅ הצליחה' : '❌ נכשלה'}`);
    
    // בדיקת שמירה עם debounce
    const debounceResult = DataStore.save(false);
    console.log(`שמירה עם debounce: ${debounceResult ? '✅ התחילה' : '❌ נכשלה'}`);
    console.log('   (השמירה תתבצע בעוד ~300ms)');
  } else {
    console.log('דילוג - אין הרשאות מנהל');
  }
  
  console.groupEnd();

  // ============================================
  // בדיקה 8: בדיקת gitSyncMarker
  // ============================================
  console.group('✅ בדיקה 8: בדיקת gitSyncMarker');
  const syncMarker = localStorage.getItem('gitSyncMarker');
  if (syncMarker) {
    try {
      const parsed = JSON.parse(syncMarker);
      const syncTime = new Date(parsed.timestamp);
      const timeAgo = Math.floor((Date.now() - syncTime.getTime()) / 1000);
      console.log(`✅ סינכרון אחרון: לפני ${timeAgo} שניות`);
      console.log(`   פעולה: ${parsed.action}`);
      console.log(`   גרסה: ${parsed.version}`);
    } catch (e) {
      console.warn('⚠️ שגיאה בפענוח gitSyncMarker:', e);
    }
  } else {
    console.log('ℹ️ אין gitSyncMarker (זה תקין אם לא הייתה שמירה לאחרונה)');
  }
  console.groupEnd();

  // ============================================
  // סיכום
  // ============================================
  console.log('\n📊 סיכום:');
  console.log(`   - תלמידים: ${studentsCount}`);
  console.log(`   - כיתות: ${classesCount}`);
  console.log(`   - קבוצות: ${groupsCount}`);
  console.log(`   - מורים: ${teachersCount}`);
  console.log(`   - הרשאות: ${isAdmin ? 'מנהל' : 'צופה'}`);
  console.log(`   - נתונים ב-localStorage: ${savedData ? '✅ כן' : '❌ לא'}`);
  
  console.log('\n✅ בדיקות הושלמו!');
  console.log('💡 טיפ: פתח את test-data-persistence.html לבדיקות מפורטות יותר');
})();
