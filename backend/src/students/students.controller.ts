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
import { StudentsService } from './students.service';
import { Student } from './entities/student.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EditPermissionGuard } from '../auth/guards/edit-permission.guard';

@ApiTags('students')
@Controller('students')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all students' })
  findAll(@Query('gradeId') gradeId?: string, @Query('groupId') groupId?: string): Promise<Student[]> {
    if (groupId) {
      return this.studentsService.findByGroup(groupId);
    }
    if (gradeId) {
      return this.studentsService.findByGrade(gradeId);
    }
    return this.studentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get student by ID' })
  findOne(@Param('id') id: string): Promise<Student> {
    return this.studentsService.findOne(id);
  }

  @Post()
  @UseGuards(EditPermissionGuard)
  @ApiOperation({ summary: 'Create student (manager only)' })
  create(@Body() studentData: Partial<Student>, @Request() req): Promise<Student> {
    return this.studentsService.create(studentData, req.user);
  }

  @Patch(':id')
  @UseGuards(EditPermissionGuard)
  @ApiOperation({ summary: 'Update student (manager only)' })
  update(
    @Param('id') id: string,
    @Body() studentData: Partial<Student>,
    @Request() req,
  ): Promise<Student> {
    return this.studentsService.update(id, studentData, req.user);
  }

  @Delete(':id')
  @UseGuards(EditPermissionGuard)
  @ApiOperation({ summary: 'Delete student (manager only)' })
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.studentsService.remove(id, req.user);
  }
}

