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
import { GroupsService } from './groups.service';
import { Group } from './entities/group.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EditPermissionGuard } from '../auth/guards/edit-permission.guard';

@ApiTags('groups')
@Controller('groups')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GroupsController {
  constructor(private readonly groupsService: GroupsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all groups' })
  findAll(@Query('gradeId') gradeId?: string): Promise<Group[]> {
    if (gradeId) {
      return this.groupsService.findByGrade(gradeId);
    }
    return this.groupsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get group by ID' })
  findOne(@Param('id') id: string): Promise<Group> {
    return this.groupsService.findOne(id);
  }

  @Post()
  @UseGuards(EditPermissionGuard)
  @ApiOperation({ summary: 'Create group (manager only)' })
  create(@Body() groupData: Partial<Group>, @Request() req): Promise<Group> {
    return this.groupsService.create(groupData, req.user);
  }

  @Patch(':id')
  @UseGuards(EditPermissionGuard)
  @ApiOperation({ summary: 'Update group (manager only)' })
  update(
    @Param('id') id: string,
    @Body() groupData: Partial<Group>,
    @Request() req,
  ): Promise<Group> {
    return this.groupsService.update(id, groupData, req.user);
  }

  @Delete(':id')
  @UseGuards(EditPermissionGuard)
  @ApiOperation({ summary: 'Delete group (manager only)' })
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.groupsService.remove(id, req.user);
  }
}

