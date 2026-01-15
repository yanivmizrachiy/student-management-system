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
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GradesService } from './grades.service';
import { Grade } from './entities/grade.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EditPermissionGuard } from '../auth/guards/edit-permission.guard';

@ApiTags('grades')
@Controller('grades')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GradesController {
  constructor(private readonly gradesService: GradesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all grades' })
  findAll(): Promise<Grade[]> {
    return this.gradesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get grade by ID' })
  findOne(@Param('id') id: string): Promise<Grade> {
    return this.gradesService.findOne(id);
  }

  @Post()
  @UseGuards(EditPermissionGuard)
  @ApiOperation({ summary: 'Create grade (manager only)' })
  create(@Body() gradeData: Partial<Grade>, @Request() req): Promise<Grade> {
    return this.gradesService.create(gradeData, req.user);
  }

  @Patch(':id')
  @UseGuards(EditPermissionGuard)
  @ApiOperation({ summary: 'Update grade (manager only)' })
  update(
    @Param('id') id: string,
    @Body() gradeData: Partial<Grade>,
    @Request() req,
  ): Promise<Grade> {
    return this.gradesService.update(id, gradeData, req.user);
  }

  @Delete(':id')
  @UseGuards(EditPermissionGuard)
  @ApiOperation({ summary: 'Delete grade (manager only)' })
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.gradesService.remove(id, req.user);
  }
}

