import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { AttendanceService } from './attendance.service';
import { Attendance } from './entities/attendance.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EditPermissionGuard } from '../auth/guards/edit-permission.guard';

@ApiTags('attendance')
@Controller('attendance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AttendanceController {
  constructor(private readonly attendanceService: AttendanceService) {}

  @Get()
  @ApiOperation({ summary: 'Get all attendance records' })
  findAll(@Query('studentId') studentId?: string): Promise<Attendance[]> {
    if (studentId) {
      return this.attendanceService.findByStudent(studentId);
    }
    return this.attendanceService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attendance by ID' })
  findOne(@Param('id') id: string): Promise<Attendance> {
    return this.attendanceService.findOne(id);
  }

  @Post()
  @UseGuards(EditPermissionGuard)
  @ApiOperation({ summary: 'Create attendance (manager only)' })
  create(@Body() attendanceData: Partial<Attendance>, @Request() req): Promise<Attendance> {
    return this.attendanceService.create(attendanceData, req.user);
  }

  @Patch(':id')
  @UseGuards(EditPermissionGuard)
  @ApiOperation({ summary: 'Update attendance (manager only)' })
  update(
    @Param('id') id: string,
    @Body() attendanceData: Partial<Attendance>,
    @Request() req,
  ): Promise<Attendance> {
    return this.attendanceService.update(id, attendanceData, req.user);
  }

  @Delete(':id')
  @UseGuards(EditPermissionGuard)
  @ApiOperation({ summary: 'Delete attendance (manager only)' })
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.attendanceService.remove(id, req.user);
  }
}

