// Script to find and delete demo/test data
import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { StudentsService } from './src/students/students.service';
import { GradesService } from './src/grades/grades.service';
import { GroupsService } from './src/groups/groups.service';
import { Student } from './src/students/entities/student.entity';
import { Grade } from './src/grades/entities/grade.entity';
import { Group } from './src/groups/entities/group.entity';
import { InjectRepository, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

async function deleteDemoData() {
  const app = await NestFactory.createApplicationContext(AppModule);
  
  const studentsRepo = app.get(getRepositoryToken(Student)) as Repository<Student>;
  const gradesRepo = app.get(getRepositoryToken(Grade)) as Repository<Grade>;
  const groupsRepo = app.get(getRepositoryToken(Group)) as Repository<Group>;

  console.log('\n═══════════════════════════════════════════');
  console.log('   🗑️  מחיקת נתוני דמו');
  console.log('═══════════════════════════════════════════\n');

  try {
    // Find demo/test students (names containing "demo", "test", "דמו", "בדיקה")
    const demoKeywords = ['demo', 'test', 'דמו', 'בדיקה', 'example', 'דוגמה'];
    
    const allStudents = await studentsRepo.find({
      relations: ['grade', 'group'],
    });

    const demoStudents = allStudents.filter(student => {
      const firstName = (student.firstName || '').toLowerCase();
      const lastName = (student.lastName || '').toLowerCase();
      const studentId = (student.studentId || '').toLowerCase();
      
      return demoKeywords.some(keyword => 
        firstName.includes(keyword.toLowerCase()) ||
        lastName.includes(keyword.toLowerCase()) ||
        studentId.includes(keyword.toLowerCase())
      );
    });

    console.log(`🔍 נמצאו ${demoStudents.length} תלמידי דמו:`);
    demoStudents.forEach(student => {
      console.log(`   - ${student.firstName} ${student.lastName} (${student.studentId})`);
    });

    if (demoStudents.length > 0) {
      // Delete demo students
      const ids = demoStudents.map(s => s.id);
      await studentsRepo.delete(ids);
      console.log(`\n✅ נמחקו ${demoStudents.length} תלמידי דמו`);
    } else {
      console.log('\n✅ לא נמצאו תלמידי דמו');
    }

    // Check for demo grades
    const allGrades = await gradesRepo.find();
    const demoGrades = allGrades.filter(grade => {
      const name = (grade.name || '').toLowerCase();
      return demoKeywords.some(keyword => name.includes(keyword.toLowerCase()));
    });

    console.log(`\n🔍 נמצאו ${demoGrades.length} כיתות דמו:`);
    demoGrades.forEach(grade => {
      console.log(`   - ${grade.name}`);
    });

    if (demoGrades.length > 0) {
      const ids = demoGrades.map(g => g.id);
      await gradesRepo.delete(ids);
      console.log(`\n✅ נמחקו ${demoGrades.length} כיתות דמו`);
    } else {
      console.log('\n✅ לא נמצאו כיתות דמו');
    }

    // Check for demo groups
    const allGroups = await groupsRepo.find({ relations: ['grade'] });
    const demoGroups = allGroups.filter(group => {
      const name = (group.name || '').toLowerCase();
      const teacher = (group.teacher || '').toLowerCase();
      return demoKeywords.some(keyword => 
        name.includes(keyword.toLowerCase()) ||
        teacher.includes(keyword.toLowerCase())
      );
    });

    console.log(`\n🔍 נמצאו ${demoGroups.length} קבוצות דמו:`);
    demoGroups.forEach(group => {
      console.log(`   - ${group.name} (${group.teacher})`);
    });

    if (demoGroups.length > 0) {
      const ids = demoGroups.map(g => g.id);
      await groupsRepo.delete(ids);
      console.log(`\n✅ נמחקו ${demoGroups.length} קבוצות דמו`);
    } else {
      console.log('\n✅ לא נמצאו קבוצות דמו');
    }

    console.log('\n═══════════════════════════════════════════');
    console.log('   ✅ סיום מחיקת נתוני דמו');
    console.log('═══════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ שגיאה במחיקה:', error);
  } finally {
    await app.close();
  }
}

deleteDemoData();
