import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EtlService } from './etl.service';
import { EtlController } from './etl.controller';
import { Student } from '../students/entities/student.entity';
import { Grade } from '../grades/entities/grade.entity';
import { Group } from '../groups/entities/group.entity';
import { StudentsModule } from '../students/students.module';
import { GradesModule } from '../grades/grades.module';
import { GroupsModule } from '../groups/groups.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Student, Grade, Group]),
    StudentsModule,
    GradesModule,
    GroupsModule,
  ],
  controllers: [EtlController],
  providers: [EtlService],
  exports: [EtlService],
})
export class EtlModule {}
