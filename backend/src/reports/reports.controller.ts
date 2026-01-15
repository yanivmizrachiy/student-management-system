import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('reports')
@Controller('reports')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('school')
  @ApiOperation({ summary: 'Get school-level statistics' })
  getSchoolStats() {
    return this.reportsService.getSchoolStats();
  }

  @Get('grade/:gradeId')
  @ApiOperation({ summary: 'Get grade-level statistics' })
  getGradeStats(@Param('gradeId') gradeId: string) {
    return this.reportsService.getGradeStats(gradeId);
  }

  @Get('group/:groupId')
  @ApiOperation({ summary: 'Get group-level statistics' })
  getGroupStats(@Param('groupId') groupId: string) {
    return this.reportsService.getGroupStats(groupId);
  }

  @Get('student/:studentId')
  @ApiOperation({ summary: 'Get student-level statistics' })
  getStudentStats(@Param('studentId') studentId: string) {
    return this.reportsService.getStudentStats(studentId);
  }
}

