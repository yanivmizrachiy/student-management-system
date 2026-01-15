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
import { AssessmentsService } from './assessments.service';
import { Assessment } from './entities/assessment.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EditPermissionGuard } from '../auth/guards/edit-permission.guard';

@ApiTags('assessments')
@Controller('assessments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all assessments' })
  findAll(@Query('studentId') studentId?: string): Promise<Assessment[]> {
    if (studentId) {
      return this.assessmentsService.findByStudent(studentId);
    }
    return this.assessmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get assessment by ID' })
  findOne(@Param('id') id: string): Promise<Assessment> {
    return this.assessmentsService.findOne(id);
  }

  @Post()
  @UseGuards(EditPermissionGuard)
  @ApiOperation({ summary: 'Create assessment (manager only)' })
  create(@Body() assessmentData: Partial<Assessment>, @Request() req): Promise<Assessment> {
    return this.assessmentsService.create(assessmentData, req.user);
  }

  @Patch(':id')
  @UseGuards(EditPermissionGuard)
  @ApiOperation({ summary: 'Update assessment (manager only)' })
  update(
    @Param('id') id: string,
    @Body() assessmentData: Partial<Assessment>,
    @Request() req,
  ): Promise<Assessment> {
    return this.assessmentsService.update(id, assessmentData, req.user);
  }

  @Delete(':id')
  @UseGuards(EditPermissionGuard)
  @ApiOperation({ summary: 'Delete assessment (manager only)' })
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.assessmentsService.remove(id, req.user);
  }
}

