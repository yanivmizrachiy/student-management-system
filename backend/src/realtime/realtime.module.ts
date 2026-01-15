import { Module, Global } from '@nestjs/common';
import { RealtimeGateway } from './realtime.gateway';
import { GradesModule } from '../grades/grades.module';
import { GroupsModule } from '../groups/groups.module';
import { StudentsModule } from '../students/students.module';
import { ReportsModule } from '../reports/reports.module';

@Global()
@Module({
  imports: [GradesModule, GroupsModule, StudentsModule, ReportsModule],
  providers: [RealtimeGateway],
  exports: [RealtimeGateway],
})
export class RealtimeModule {}

