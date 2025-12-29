/**
 * טעינה אוטומטית של כל הנתונים
 * קובץ זה טוען את כל התלמידים, הכיתות, הקבוצות והמורים אוטומטית
 */

(function() {
  'use strict';
  
  // בדוק אם יש כבר נתונים ב-localStorage
  const existingData = localStorage.getItem('schoolData');
  if (existingData) {
    try {
      const data = JSON.parse(existingData);
      if (data.students && data.students.length > 0) {
        console.log('✅ נמצאו נתונים קיימים ב-localStorage');
        // אין הפסקה: נמשיך לטעון את כל הקבוצות כדי לרענן מורים/קבוצות חדשות
      }
    } catch (e) {
      // המשך לטעינה
    }
  }
  
  console.log('🔄 טוען נתונים אוטומטית...');
  
  // טען את DataStore
  if (typeof DataStore === 'undefined') {
    console.error('❌ DataStore לא נטען');
    return;
  }
  
  // טען את הנתונים עם force
  DataStore.load(true);
  
  // ביטול cache לפני טעינה
  if (DataStore._invalidateCache) {
    DataStore._invalidateCache();
  }
  
  console.log('📦 טוען את כל הקבוצות...');
  
  // טען את כל הקבוצות וסמן כשסיימנו
  loadAllGroups();
  
  // סמן שהטעינה הסתיימה (עבור layer.html)
  window.__dataLoaded = true;
  window.dispatchEvent(new CustomEvent('dataLoaded'));
  
  console.log('✅ כל הנתונים נטענו - הטעינה הסתיימה');
  
  // Helper function to create students array from name pairs
  function createStudents(namePairs, className = null) {
    return namePairs.map(([lastName, firstName, classNum]) => ({
      lastName,
      firstName,
      ...(className || classNum ? { className: className || `כיתה ${classNum}` } : {})
    }));
  }

  function loadAllGroups() {
    // קבוצה 1: ז'1 - מדעית (טל נחמיה)
    DataStore.importGroup({
      layer: '7',
      groupName: 'מדעית',
      teacherName: 'טל נחמיה',
      className: 'כיתה ז\'1'
    }, createStudents([
      ['אוסקר', 'ליהי'], ['אזולאי', 'לירן'], ['ברימט', 'טליה'], ['ברקוביץ', 'דניאל'],
      ['דהן', 'בנימין'], ['זכריה', 'שיר'], ['חודורוב', 'מאיה'], ['כהן', 'אופק'],
      ['מוגס', 'דניאלה'], ['מזרחי', 'מאור'], ['מכחל', 'נועה'], ['מלניק', 'נתנאל'],
      ['סיאנוב', 'אוריה'], ['עמדי', 'מעיין'], ['פאילייב', 'אדל'], ['פינקס', 'אריאל'],
      ['ציקווש', 'יהלי'], ['רזייב', 'עדינה'], ['שוורץ', 'עילי'], ['שוורצר', 'סופיה ניצה'],
      ['שכטמן', 'ניר'], ['שמש', 'אמילי'], ['שצמן', 'יעל'], ['ששון', 'אוריה אברהם']
    ]));
    
    // קבוצה 2: ז'3/ז'4 - א' (אילנית רז)
    const students2 = [
      ['אופק', 'אופיר חיים', '4'], ['אלישקובי', 'גבריאל', '3'], ['אמויאל', 'עידן ישראל', '3'],
      ['אסיאג', 'נווה', '4'], ['באנון', 'עדי', '3'], ['בן', 'כליפה אריאל', '4'],
      ['בנישו', 'אלין', '3'], ['גבאי', 'אושרי', '4'], ['גיא', 'ירין', '4'],
      ['גידניאן', 'אלרואי משה', '4'], ['דנון', 'עדי', '3'], ['חקימוב', 'ארטיום', '3'],
      ['יונה', 'עידו', '4'], ['ירמיהו', 'נתנאל', '3'], ['כהן', 'אגם', '4'],
      ['כהן', 'גיא', '4'], ['כהן', 'נחמו דניאל', '4'], ['מזרחי', 'סתיו', '3'],
      ['סולטן', 'דוד', '4'], ['סנבטו', 'מנסאו', '3'], ['קוסשוילי', 'רבקה', '3'],
      ['רחמים', 'אייל', '3'], ['ששון', 'נהוראי שלמה', '4']
    ].map(([lastName, firstName, classNum]) => ({
      lastName, firstName, className: `כיתה ז'${classNum}`
    }));
    
    DataStore.importGroup({
      layer: '7',
      groupName: 'א\'',
      teacherName: 'אילנית רז',
      className: 'כיתה ז\'3'
    }, students2);
    
    // קבוצה 3: ז'2/ז'3/ז'4 - א'1 (יניב רז)
    const students3 = [
      ['אגמי', 'ליאן', '3'], ['אדרי', 'מאור', '4'], ['איסאס', 'נטע', '3'],
      ['אלמליח', 'ליאן', '4'], ['ארגזאז', 'יהלי', '3'], ['עמרם בן חמו', 'ירון', '3'],
      ['בן מיכאל', 'אושר', '3'], ['דאבוש', 'אסף', '3'], ['אל האילן', 'בת', '4'],
      ['הולנדר', 'אושרי', '4'], ['לוי אילן', 'עילאי', '2'], ['מזרחי', 'ליאן', '4'],
      ['מזרחי', 'ליה', '4'], ['צוגרב', 'נטליה', '4']
    ].map(([lastName, firstName, classNum]) => ({
      lastName, firstName, className: `כיתה ז'${classNum}`
    }));
    
    DataStore.importGroup({
      layer: '7',
      groupName: 'א\'1',
      teacherName: 'יניב רז',
      className: 'כיתה ז\'3'
    }, students3);
    
    // קבוצה 4: ז'2 - מקדמת (הילה הנסב)
    const students4 = [
      ['אליאב', 'נועם', '2'], ['בביוב', 'מאור', '2'], ['בן חיים', 'גלי', '2'],
      ['בנד', 'ליאו', '2'], ['בר ליעד', 'מאיר', '2'], ['דוידוב', 'אייל', '2'],
      ['חפצדי', 'ליה', '2'], ['טל-שיר', 'הודיה', '2'], ['מזרחי אושר', 'עזרא', '2'],
      ['מנזור', 'אליה', '2'], ['פרטוק ליאם', 'ציון', '2'], ['צרפי אורי', 'שמעון', '2'],
      ['קידן', 'שי', '2']
    ].map(([lastName, firstName, classNum]) => ({
      lastName, firstName, className: `כיתה ז'${classNum}`
    }));
    
    DataStore.importGroup({
      layer: '7',
      groupName: 'מקדמת',
      teacherName: 'הילה הנסב',
      className: 'כיתה ז\'2'
    }, students4);
    
    // קבוצה 5: ח'2 - מקדמת (טל נחמיה)
    const students5 = [
      ['דה סילבה דניאל', 'נתן', '2'], ['כהן בן-דוד', 'ליאן', '2'], ['מזרחי', 'אופיר', '2'],
      ['סטי מזרחי שון', 'עדן', '2'], ['קלימיאן', 'אביאל', '2'], ['שרביט אליאב', 'אהרן', '2']
    ].map(([lastName, firstName, classNum]) => ({
      lastName, firstName, className: `כיתה ח'${classNum}`
    }));
    
    DataStore.importGroup({
      layer: '8',
      groupName: 'מקדמת',
      teacherName: 'טל נחמיה',
      className: 'כיתה ח\'2'
    }, students5);
    
    // קבוצה 6: ח'1 - מדעית (יניב רז)
    const students6 = [
      ['אזולאי', 'נועם', '1'], ['בזק', 'איתי', '1'], ['גודובניץ', 'אוה', '1'],
      ['גורביץ', 'איתן', '1'], ['דהן', 'אוריאן', '1'], ['דהן', 'אלמוג מאיר', '1'],
      ['יונתן', 'רום אל', '1'], ['יצחקוב', 'אדר', '1'], ['לוי', 'נויה', '1'],
      ['מזרחי', 'אריאל', '1'], ['סעאדה', 'ג`נל', '1'], ['פאר', 'אליאן', '1'],
      ['פוג`יטה כהן', 'לילי', '1'], ['צירקידזה', 'אנדריה דורון', '1'], ['רחמין', 'עמית', '1'],
      ['שמעון', 'יהונתן', '1'], ['שמשילשווילי', 'מיכאל', '1']
    ].map(([lastName, firstName, classNum]) => ({
      lastName, firstName, className: `כיתה ח'${classNum}`
    }));
    
    DataStore.importGroup({
      layer: '8',
      groupName: 'מדעית',
      teacherName: 'יניב רז',
      className: 'כיתה ח\'1'
    }, students6);
    
    // קבוצה 7: ח' - א' (טל נחמיה)
    const students7 = [
      ['שם טוב', 'לירן', '1'], ['עובדיה', 'אופיר', '1'], ['ארגאו', 'אלירן', '1'],
      ['בן דוד', 'איתי', '1'], ['חנניה', 'מילאן', '1'], ['אזולאי', 'אורי', '1'],
      ['אמין זדה', 'אדל', '1'], ['קרטבלשווילי', 'ווזה', '1'], ['פוסטרלוב', 'יפת', '1'],
      ['צ\'קול', 'קלקידן', '1'], ['חיים כהן', 'נועם', '1'], ['עבו', 'מאור', '1'],
      ['זקין', 'אתגר', '1'], ['ראובני', 'יובל', '1'], ['חפצדי', 'ליאן', '1'],
      ['אבוקסיס', 'נוי', '1'], ['שמש', 'אליה', '1'], ['מעלומי', 'אופיר', '1'],
      ['עמר', 'טליה', '1'], ['יזראלוב', 'מישל', '1'], ['שרביט', 'איתי', '1'],
      ['סולומון', 'רומי', '1'], ['יוסף', 'עמית', '1'], ['רומי', 'איתי', '2']
    ].map(([lastName, firstName, classNum]) => ({
      lastName, firstName, className: `כיתה ח'${classNum}`
    }));
    
    DataStore.importGroup({
      layer: '8',
      groupName: 'א\'',
      teacherName: 'טל נחמיה',
      className: 'כיתה ח\'1'
    }, students7);
    
    // קבוצה 8: ח'3/ח'4 - א'1 (יניב רז)
    const students8 = [
      ['אודשורן', 'אלרום', '3'], ['אוחיון אדל', 'רות', '3'], ['אמין זדה', 'אפק', '3'],
      ['בטלר', 'היליי', '3'], ['בן-מגן', 'נויה', '4'], ['ברהום', 'מתן', '4'],
      ['דוד דביר', 'נתן', '3'], ['דרעי עידו', 'אוריאל', '3'], ['הולמן רייך', 'ג`וזפין', '4'],
      ['יובו', 'אלדר', '4'], ['כהנא', 'יובל', '3'], ['מוכאר זאדה', 'ליאם', '4'],
      ['שמעיה', 'דניאל', '3'], ['שרביט', 'אילאי', '3']
    ].map(([lastName, firstName, classNum]) => ({
      lastName, firstName, className: `כיתה ח'${classNum}`
    }));
    
    DataStore.importGroup({
      layer: '8',
      groupName: 'א\'1',
      teacherName: 'יניב רז',
      className: 'כיתה ח\'3'
    }, students8);
    
    // קבוצה 9: ח' - א'1 (רונית פואל)
    const students9 = [
      ['איזוגרפוב', 'איסק', '1'], ['אלנה', 'אדום', '1'], ['בן כליפה', 'אורי', '1'],
      ['חמו', 'עדיאל עליזה', '1'], ['כהן', 'יהלי', '1'], ['כהן', 'נועם', '1'],
      ['ליס', 'h', '1'], ['מוכאר זאדה', 'עילאי', '1'], ['נאותי', 'אורי משה', '1'],
      ['נדיב', 'שי אלי', '1'], ['נחמיה', 'אורין', '1'], ['קוסשוילי', 'דוד', '1'],
      ['שמואל', 'הראל משה', '1']
    ].filter(([lastName, firstName]) => lastName && firstName).map(([lastName, firstName, classNum]) => ({
      lastName, firstName, className: `כיתה ח'${classNum || '1'}`
    }));
    
    DataStore.importGroup({
      layer: '8',
      groupName: 'א\'1',
      teacherName: 'רונית פואל',
      className: 'כיתה ח\'1'
    }, students9);
    
    // קבוצה 10: ח'2 - מקדמת (רונית פואל)
    const students10 = [
      ['אברג`ל קורן', 'זהר', '2'], ['דרייצל', 'ליה', '2'], ['מזור', 'גיא', '2'],
      ['מטייב', 'טליה', '2'], ['עוזר', 'אלירן', '2'], ['שאולי', 'עדן', '2']
    ].map(([lastName, firstName, classNum]) => ({
      lastName, firstName, className: `כיתה ח'${classNum}`
    }));
    
    DataStore.importGroup({
      layer: '8',
      groupName: 'מקדמת',
      teacherName: 'רונית פואל',
      className: 'כיתה ח\'2'
    }, students10);
    
    // קבוצה 11: ט'1 - מדעית (יניב רז)
    const students11 = [
      ['אהרונוב', 'איתן'], ['איבגי', 'הראל'], ['אליהו', 'נועם'], ['אמזלג', 'שילת'],
      ['אסלן', 'אור'], ['בלקר', 'עידו'], ['בראל', 'עדן'], ['ברימט', 'אופיר'],
      ['וולקוף', 'יהלי'], ['זכריה', 'איתי'], ['חזנוב', 'זיו'], ['לבן', 'לינוי'],
      ['מכחל', 'עידן'], ['מנשה', 'לירז'], ['מרטיניוק', 'נועם איוון'], ['מריומה', 'תמר'],
      ['נורי', 'אביתר אברהם'], ['נרגסי', 'אייל'], ['פרלשטיין', 'רותם'], ['צורדקר', 'שקד'],
      ['צרפי', 'שירה'], ['צרפתי', 'הדר'], ['רודובסקי', 'אריאל'], ['רייטר', 'עידן'],
      ['ששון', 'אורי ישראל'], ['ששון', 'נועם'], ['ששון', 'נתנאל דוד מו'], ['תירוש', 'עוז'],
      ['רחמים', 'מיכל'], ['חיימי', 'אדווה']
    ].filter(([lastName, firstName]) => lastName && firstName && lastName.trim() && firstName.trim()).map(([lastName, firstName]) => ({
      lastName: lastName.trim(), firstName: firstName.trim(), className: `כיתה ט'1`
    }));
    
    DataStore.importGroup({
      layer: '9',
      groupName: 'מדעית',
      teacherName: 'יניב רז',
      className: 'כיתה ט\'1'
    }, students11);
    
    // קבוצה 12: ט' - א' (סוניה רפאלי)
    const students12 = [
      ['בן סעדון', 'יאיר'], ['דגפו', 'יואל'], ['וובה', 'הלי'], ['זדה', 'אורין'],
      ['חנניה', 'סלין מור'], ['יוסף', 'לירז מיכאל'], ['כהן', 'הדס'], ['ליסרמן', 'יונתן'],
      ['נג\'מיאן', 'רומי'], ['דואק', 'ליאור חי'], ['זקן', 'אייל'], ['יעקובי', 'אורי'],
      ['כצמן', 'אדליה'], ['לוי', 'שיר רעיה'], ['פונטיה', 'ליאן'], ['תאיר', 'פרג'],
      ['קזיניץ', 'דניאל'], ['קנדלקאר', 'עידן'], ['שחר', 'ליה'], ['שימנסקי', 'מיכאל'],
      ['שרעבי', 'אביב']
    ].filter(([lastName, firstName]) => lastName && firstName && lastName.trim() && firstName.trim()).map(([lastName, firstName]) => ({
      lastName: lastName.trim(), firstName: firstName.trim()
    }));
    
    DataStore.importGroup({
      layer: '9',
      groupName: 'א\'',
      teacherName: 'סוניה רפאלי'
    }, students12);
    
    // קבוצה 13: ט'4/ט'5 - א'1 (טל נחמיה)
    const students13 = [
      ['בוסי שרעבי', 'אוראל', '4'], ['גידניאן', 'מאיה', '5'], ['זכרי', 'ירין', '5'],
      ['לוי', 'מאיה מרים', '4'], ['מבורך לוי', 'גל', '5'], ['מבורך לוי', 'רן', '4'],
      ['מונסונגו', 'עדי נעמי', '5'], ['סיידיאן', 'אמיתי', '4'], ['סיני', 'ליאם', '4'],
      ['סמרה', 'מעיין', '4'], ['עבדן', 'מאור', '5'], ['פרטוק', 'אילאי נאור', '4'],
      ['צדוק', 'שירה אושרת', '5'], ['קוסטנקו', 'מאיה', '4'], ['שבתאי', 'שהם', '5'],
      ['שמחון', 'אימבר', '5'], ['שמסיאן', 'ערן', '4'], ['שפיר', 'טוהר', '4']
    ].map(([lastName, firstName, classNum]) => ({
      lastName, firstName, className: `כיתה ט'${classNum}`
    }));
    
    DataStore.importGroup({
      layer: '9',
      groupName: 'א\'1',
      teacherName: 'טל נחמיה',
      className: 'כיתה ט\'4'
    }, students13);
    
    // קבוצה 14: ט'3/ט'4/ט'5 - א'1 (נורית מויאל)
    const students14 = [
      ['אברמוב', 'ליאן', '3'], ['אוחיון', 'טליה', '3'], ['אזולאי', 'ליאם', '3'],
      ['אזולאי', 'עדיאל', '5'], ['ארוך', 'ליאן', '3'], ['בן חמו', 'ליאן', '3'],
      ['גדמו', 'חיים', '3'], ['דילאו', 'דוד', '3'], ['דניאלי', 'אוריאל', '3'],
      ['ווסה', 'לי שי יעקב', '5'], ['יונה', 'נהוראי מאיר', '3'], ['ימין', 'לורין', '3'],
      ['כהן', 'אליאן', '3'], ['כהן', 'טליה', '5'], ['מיסטריאל', 'נתנאל', '3'],
      ['ניגרקר', 'איתי', '3'], ['קיוויתי', 'אושר', '3'], ['קיליגין', 'מקסים', '4'],
      ['קנבסקי', 'סוניה', '4'], ['שפעים', 'איתי', '3'], ['שקד', 'אוריה', '3'],
      ['ששון', 'אריאל יוסף', '4']
    ].map(([lastName, firstName, classNum]) => ({
      lastName, firstName, className: `כיתה ט'${classNum}`
    }));
    
    // קבוצת נורית מויאל - בדיקה מפורטת
    console.log('📝 טוען קבוצת נורית מויאל...');
    console.log(`   - שכבה: 9, קבוצה: א'1, תלמידים: ${students14.length}`);
    const nuritResult = DataStore.importGroup({
      layer: '9',
      groupName: 'א\'1',
      teacherName: 'נורית מויאל',
      className: 'כיתה ט\'3'
    }, students14);
    console.log(`✅ קבוצת נורית נטענה: ${nuritResult.added}/${nuritResult.total} תלמידים`);
    console.log(`   - קבוצה ID: ${nuritResult.group.id}`);
    console.log(`   - מורה ID: ${nuritResult.teacher.id}, שם: ${nuritResult.teacher.name}`);
    
    // קבוצה 15: ט' - מקדמת (מירית אפריים)
    const students15 = [
      ['ארגאו', 'עידן'], ['בן חיים', 'אדיר'], ['בן עזרא', 'סהר'], ['בנד', 'גיא'],
      ['דהאן', 'שני'], ['דוד', 'שקד רפאל'], ['ונטורה', 'הילה'], ['טל', 'לינוי'],
      ['ירמיהו', 'נויה'], ['כהן', 'ירין'], ['כהן', 'נוגה'], ['כהנא', 'גל'],
      ['מזרחי', 'בן'], ['מלסה', 'עדן'], ['נדלר', 'נירן'], ['עוזר', 'נועה'],
      ['פאר', 'לירן'], ['רוגוב', 'אדוארד']
    ].filter(([lastName, firstName]) => lastName && firstName && lastName.trim() && firstName.trim()).map(([lastName, firstName]) => ({
      lastName: lastName.trim(), firstName: firstName.trim()
    }));
    
    DataStore.importGroup({
      layer: '9',
      groupName: 'מקדמת',
      teacherName: 'מירית אפריים'
    }, students15);
    
    console.log('✅ כל הנתונים נטענו בהצלחה!');
    console.log(`📊 סה"כ תלמידים: ${DataStore.students.length}`);
    console.log(`📊 סה"כ קבוצות: ${DataStore.groups.length}`);
    console.log(`📊 סה"כ מורים: ${DataStore.teachers.length}`);
    
    // בדיקה ספציפית לנורית מויאל - מפורט
    console.log('🔍 בודק קבוצות של נורית מויאל...');
    console.log(`   - סה"כ קבוצות ב-DataStore: ${DataStore.groups.length}`);
    console.log(`   - סה"כ מורים ב-DataStore: ${DataStore.teachers.length}`);
    
    const nuritTeachers = DataStore.teachers.filter(t => t.name === 'נורית מויאל');
    console.log(`   - מורים בשם נורית מויאל: ${nuritTeachers.length}`);
    nuritTeachers.forEach(t => {
      console.log(`     - מורה ID: ${t.id}, שם: ${t.name}`);
    });
    
    const nuritGroups = DataStore.groups.filter(g => {
      const teacher = DataStore.getTeacher(g.teacherId);
      const isNurit = teacher && teacher.name === 'נורית מויאל';
      if (isNurit) {
        console.log(`   - נמצאה קבוצה של נורית: ${g.name} (ID: ${g.id}, שכבה: ${g.layer})`);
      }
      return isNurit;
    });
    
    if (nuritGroups.length > 0) {
      console.log(`✅ נמצאו ${nuritGroups.length} קבוצות של נורית מויאל`);
      nuritGroups.forEach(g => {
        const count = DataStore.getGroupCount(g.id, false);
        const teacher = DataStore.getTeacher(g.teacherId);
        console.log(`   ✅ ${g.name} (שכבה ${g.layer}): ${count} תלמידים, מורה: ${teacher ? teacher.name : 'לא נמצא'}`);
      });
    } else {
      console.error('❌ לא נמצאו קבוצות של נורית מויאל!');
      console.log('   בודקים את כל הקבוצות בשכבה 9...');
      const layer9Groups = DataStore.groups.filter(g => String(g.layer) === '9');
      layer9Groups.forEach(g => {
        const teacher = DataStore.getTeacher(g.teacherId);
        const count = DataStore.getGroupCount(g.id, false);
        console.log(`     - ${g.name}: ${teacher ? teacher.name : 'ללא מורה'} (${count} תלמידים)`);
      });
    }
    
    // סמן שהטעינה הסתיימה
    window.__dataLoaded = true;
    window.dispatchEvent(new CustomEvent('dataLoaded'));
    
    // רענן את הדף כדי לראות את הנתונים (רק ב-index.html)
    if (window.location.pathname.includes('index.html') || window.location.pathname === '/') {
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  }
})();

