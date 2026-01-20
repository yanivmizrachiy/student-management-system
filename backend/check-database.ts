// Quick script to check database content
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { StudentsService } from './src/students/students.service';
import { GradesService } from './src/grades/grades.service';
import { GroupsService } from './src/groups/groups.service';

async function checkDatabase() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const studentsService = app.get(StudentsService);
  const gradesService = app.get(GradesService);
  const groupsService = app.get(GroupsService);

  console.log('\n═══════════════════════════════════════════');
  console.log('   📊 בדיקת מסד הנתונים');
  console.log('═══════════════════════════════════════════\n');

  try {
    // Check grades
    const grades = await gradesService.findAll();
    console.log(`📚 כיתות: ${grades.length}`);
    grades.forEach((grade) => {
      console.log(`   - ${grade.name}: ${grade.studentCount || 0} תלמידים`);
    });

    // Check groups
    const groups = await groupsService.findAll();
    console.log(`\n👥 קבוצות: ${groups.length}`);
    groups.forEach((group) => {
      console.log(`   - ${group.name} (${group.grade?.name}): ${group.studentCount || 0} תלמידים`);
    });

    // Check students
    const students = await studentsService.findAll();
    console.log(`\n👨‍🎓 תלמידים: ${students.length}`);
    if (students.length > 0) {
      console.log('\n📋 רשימת תלמידים:');
      students.slice(0, 10).forEach((student) => {
        console.log(`   - ${student.firstName} ${student.lastName} (${student.grade?.name || 'ללא כיתה'})`);
      });
      if (students.length > 10) {
        console.log(`   ... ועוד ${students.length - 10} תלמידים`);
      }
    } else {
      console.log('   ⚠️  אין תלמידים במסד הנתונים!');
    }

    console.log('\n═══════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ שגיאה בבדיקה:', error);
  } finally {
    await app.close();
  }
}

checkDatabase();
