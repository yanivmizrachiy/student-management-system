// Quick script to check how many students in a specific class
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { StudentsService } from './src/students/students.service';
import { GradesService } from './src/grades/grades.service';
import { GroupsService } from './src/groups/groups.service';

async function checkClassStudents() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const studentsService = app.get(StudentsService);
  const gradesService = app.get(GradesService);
  const groupsService = app.get(GroupsService);

  console.log('\n═══════════════════════════════════════════');
  console.log('   📊 בדיקת תלמידים לפי כיתה');
  console.log('═══════════════════════════════════════════\n');

  try {
    // Get all grades
    const grades = await gradesService.findAll();
    console.log(`📚 סך הכל ${grades.length} כיתות במערכת:\n`);

    // Find grade ח (8th grade)
    const grade8 = grades.find(g => g.name.includes('ח'));
    
    if (!grade8) {
      console.log('⚠️  לא נמצאה כיתה ח במערכת!');
      console.log('\n💡 כיתות קיימות:');
      grades.forEach(grade => {
        console.log(`   - ${grade.name}: ${grade.studentCount || 0} תלמידים`);
      });
    } else {
      console.log(`✅ נמצאה כיתה: ${grade8.name}\n`);
      
      // Get all groups in grade 8
      const allGroups = await groupsService.findAll();
      const grade8Groups = allGroups.filter(g => g.grade?.id === grade8.id);
      
      console.log(`👥 קבוצות בכיתה ${grade8.name}:\n`);
      
      if (grade8Groups.length === 0) {
        console.log('⚠️  אין קבוצות בכיתה זו!');
      } else {
        // Find group "ח1" or similar
        const group1 = grade8Groups.find(g => 
          g.name.includes('1') || 
          g.name.includes('ח1') ||
          g.name.toLowerCase().includes('section 1') ||
          g.name === 'קבוצה 1'
        );
        
        if (group1) {
          console.log(`✅ נמצאה קבוצה: ${group1.name}`);
          console.log(`📊 מספר תלמידים: ${group1.studentCount || 0}\n`);
          
          // Get actual students in this group
          const allStudents = await studentsService.findAll();
          const groupStudents = allStudents.filter(s => s.group?.id === group1.id);
          
          if (groupStudents.length > 0) {
            console.log(`📋 רשימת התלמידים בכיתה ח1:\n`);
            groupStudents.forEach((student, index) => {
              console.log(`   ${index + 1}. ${student.firstName} ${student.lastName} (${student.studentId})`);
            });
            console.log(`\n✅ סך הכל: ${groupStudents.length} תלמידים בכיתה ח1`);
          } else {
            console.log('⚠️  אין תלמידים רשומים בקבוצה זו!');
          }
        } else {
          console.log('⚠️  לא נמצאה קבוצה "ח1" בכיתה זו!\n');
          console.log('💡 קבוצות קיימות בכיתה ח:');
          grade8Groups.forEach(group => {
            console.log(`   - ${group.name}: ${group.studentCount || 0} תלמידים`);
          });
        }
      }
      
      // Show total in entire 8th grade
      console.log(`\n📊 סך הכל בכיתה ח: ${grade8.studentCount || 0} תלמידים`);
    }

    // Show all grades summary
    console.log('\n═══════════════════════════════════════════');
    console.log('   📊 סיכום כל הכיתות');
    console.log('═══════════════════════════════════════════\n');
    
    grades.forEach(grade => {
      console.log(`📚 ${grade.name}: ${grade.studentCount || 0} תלמידים`);
    });
    
    const totalStudents = grades.reduce((sum, g) => sum + (g.studentCount || 0), 0);
    console.log(`\n✅ סך הכל במערכת: ${totalStudents} תלמידים`);

    console.log('\n═══════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ שגיאה בבדיקה:', error.message);
    console.error('\n💡 ודא שהמסד נתונים רץ: cd backend && docker-compose up -d');
  } finally {
    await app.close();
  }
}

checkClassStudents();
