/**
 * עדכון מורים והעברת תלמידים
 * סקריפט זה מוסיף מורה חדשה ומעביר תלמידים
 */

(function() {
  'use strict';
  
  // בדוק אם כבר בוצע העדכון (מונע הרצה חוזרת)
  const updateKey = 'teacherUpdate_אסנת_קרפט';
  if (localStorage.getItem(updateKey) === 'completed') {
    console.log('✅ עדכון מורים כבר בוצע בעבר');
    return;
  }
  
  // בדוק אם DataStore נטען
  if (typeof DataStore === 'undefined') {
    console.error('❌ DataStore לא נטען');
    return;
  }
  
  // טען נתונים
  DataStore.load();
  
  console.log('🔄 מתחיל עדכון מורים...');
  
  // מצא את המורה אילנית רז
  const oldTeacher = DataStore.teachers.find(t => t.name === 'אילנית רז');
  if (!oldTeacher) {
    console.error('❌ לא נמצאה המורה אילנית רז');
    return;
  }
  
  console.log('✅ נמצאה המורה אילנית רז');
  
  // מצא או צור את המורה החדשה אסנת קרפט
  let newTeacher = DataStore.teachers.find(t => t.name === 'אסנת קרפט');
  if (!newTeacher) {
    newTeacher = {
      id: DataStore.generateId(),
      name: 'אסנת קרפט'
    };
    DataStore.teachers.push(newTeacher);
    console.log('✅ נוצרה מורה חדשה: אסנת קרפט');
  } else {
    console.log('✅ נמצאה המורה אסנת קרפט');
  }
  
  // רשימת התלמידים להעברה (שם משפחה, שם פרטי)
  // עם וריאציות אפשריות לשמות
  const studentsToTransfer = [
    { lastName: 'דנון', firstName: 'עדי', variations: ['דנון', 'דנון עדי'] },
    { lastName: 'גבאי', firstName: 'אושרי', variations: ['גבאי', 'גבאי אושרי'] },
    { lastName: 'ששון', firstName: 'נהוראי', variations: ['ששון', 'ששון נהוראי', 'ששון נהוראי שלמה'] },
    { lastName: 'מזרחי', firstName: 'סתיו', variations: ['מזרחי', 'מזרחי סתיו'] },
    { lastName: 'אופק', firstName: 'אופיר', variations: ['אופק', 'אופק אופיר', 'אופק אופיר חיים'] },
    { lastName: 'גיא', firstName: 'ירין', variations: ['גיא', 'גיא ירין'] },
    { lastName: 'בנישו', firstName: 'אלין', variations: ['בנישו', 'בניטו', 'בנישו אלין', 'בניטו אלין'] },
    { lastName: 'יונה', firstName: 'עידו', variations: ['יונה', 'יונה עידו'] },
    { lastName: 'קוסשוילי', firstName: 'רבקה', variations: ['קוסשוילי', 'קוסשוילי רבקה'] }
  ];
  
  // מצא את הקבוצה של אילנית רז בשכבת ז'
  const oldGroup = DataStore.groups.find(g => 
    g.teacherId === oldTeacher.id && g.layer === '7'
  );
  
  if (!oldGroup) {
    console.error('❌ לא נמצאה קבוצה של אילנית רז בשכבת ז\'');
    return;
  }
  
  console.log(`✅ נמצאה קבוצה: ${oldGroup.name}`);
  
  // מצא או צור קבוצה חדשה לאסנת קרפט
  // נניח שזו אותה קבוצה (א') או נצטרך ליצור קבוצה חדשה
  let newGroup = DataStore.groups.find(g => 
    g.teacherId === newTeacher.id && g.layer === '7' && g.name === oldGroup.name
  );
  
  if (!newGroup) {
    // צור קבוצה חדשה עם אותו שם
    newGroup = {
      id: DataStore.generateId(),
      name: oldGroup.name,
      layer: '7',
      teacherId: newTeacher.id
    };
    DataStore.groups.push(newGroup);
    console.log(`✅ נוצרה קבוצה חדשה: ${newGroup.name} למורה אסנת קרפט`);
  } else {
    console.log(`✅ נמצאה קבוצה: ${newGroup.name} למורה אסנת קרפט`);
  }
  
  // מצא והעבר תלמידים
  let transferred = 0;
  let notFound = [];
  
  studentsToTransfer.forEach(targetStudent => {
    let student = null;
    
    // חיפוש מדויק ראשון
    student = DataStore.students.find(s => 
      s.lastName === targetStudent.lastName && 
      s.firstName === targetStudent.firstName &&
      s.groupId === oldGroup.id
    );
    
    // אם לא נמצא, נסה חיפוש גמיש
    if (!student) {
      student = DataStore.students.find(s => {
        if (s.groupId !== oldGroup.id) return false;
        
        // בדיקה מדויקת
        if (s.lastName === targetStudent.lastName && 
            s.firstName === targetStudent.firstName) {
          return true;
        }
        
        // בדיקה גמישה - שם פרטי
        if (s.lastName === targetStudent.lastName) {
          const firstNameMatch = 
            s.firstName.includes(targetStudent.firstName) ||
            targetStudent.firstName.includes(s.firstName) ||
            s.firstName.split(' ')[0] === targetStudent.firstName.split(' ')[0];
          if (firstNameMatch) {
            return true;
          }
        }
        
        // בדיקה עם וריאציות
        const fullName = `${s.lastName} ${s.firstName}`;
        const targetFullName = `${targetStudent.lastName} ${targetStudent.firstName}`;
        if (targetStudent.variations) {
          for (const variation of targetStudent.variations) {
            if (fullName.includes(variation) || variation.includes(fullName)) {
              return true;
            }
          }
        }
        
        return false;
      });
    }
    
    if (student) {
      // העבר את התלמיד לקבוצה החדשה
      student.groupId = newGroup.id;
      transferred++;
      console.log(`✅ הועבר: ${student.lastName} ${student.firstName}`);
    } else {
      console.log(`⚠️  לא נמצא: ${targetStudent.lastName} ${targetStudent.firstName}`);
      notFound.push(targetStudent);
    }
  });
  
  // חיפוש נוסף עם וריאציות שמות
  if (notFound.length > 0) {
    console.log('🔍 מחפש עם וריאציות שמות...');
    
    notFound.forEach(targetStudent => {
      // חיפוש גמיש יותר
      const student = DataStore.students.find(s => {
        // בדוק אם שם משפחה דומה
        const lastNameSimilar = 
          s.lastName.includes(targetStudent.lastName) ||
          targetStudent.lastName.includes(s.lastName) ||
          s.lastName.replace(/\s/g, '') === targetStudent.lastName.replace(/\s/g, '');
        
        // בדוק אם שם פרטי דומה
        const firstNameSimilar = 
          s.firstName.includes(targetStudent.firstName) ||
          targetStudent.firstName.includes(s.firstName) ||
          s.firstName.replace(/\s/g, '') === targetStudent.firstName.replace(/\s/g, '');
        
        return lastNameSimilar && firstNameSimilar && s.groupId === oldGroup.id;
      });
      
      if (student) {
        student.groupId = newGroup.id;
        transferred++;
        console.log(`✅ הועבר (עם התאמה גמישה): ${student.lastName} ${student.firstName}`);
        notFound = notFound.filter(s => s !== targetStudent);
      }
    });
  }
  
  // שמור את השינויים
  DataStore._invalidateCache(); // ביטול cache
  DataStore.save(true); // שמירה מיידית
  
  // סמן שהעדכון בוצע
  localStorage.setItem(updateKey, 'completed');
  
  console.log(`\n✅ הושלם! הועברו ${transferred} תלמידים`);
  if (notFound.length > 0) {
    console.log(`⚠️  לא נמצאו ${notFound.length} תלמידים:`);
    notFound.forEach(s => console.log(`   - ${s.lastName} ${s.firstName}`));
  }
  
  console.log(`📊 סה"כ תלמידים בקבוצה של אסנת קרפט: ${DataStore.getGroupCount(newGroup.id)}`);
  console.log(`📊 סה"כ תלמידים בקבוצה של אילנית רז: ${DataStore.getGroupCount(oldGroup.id)}`);
  
  // רענן את הדף כדי לראות את השינויים
  if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  }
})();

