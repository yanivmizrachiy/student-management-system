import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Group } from './entities/group.entity';
import { AuditService } from '../audit/audit.service';
import { User } from '../users/entities/user.entity';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class GroupsService {
  constructor(
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    private auditService: AuditService,
    @Inject(forwardRef(() => RealtimeGateway))
    private realtimeGateway: RealtimeGateway,
  ) {}

  async findAll(): Promise<Group[]> {
    return this.groupsRepository.find({
      relations: ['grade', 'teacher', 'students'],
      order: { name: 'ASC' },
    });
  }

  async findByGrade(gradeId: string): Promise<Group[]> {
    return this.groupsRepository.find({
      where: { gradeId },
      relations: ['grade', 'teacher', 'students'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Group> {
    return this.groupsRepository.findOne({
      where: { id },
      relations: ['grade', 'teacher', 'students'],
    });
  }

  async create(groupData: Partial<Group>, user: User): Promise<Group> {
    const group = this.groupsRepository.create(groupData);
    const saved = await this.groupsRepository.save(group);
    
    await this.auditService.log({
      entity: 'Group',
      entityId: saved.id,
      field: 'created',
      newValue: JSON.stringify(saved),
      userId: user.id,
    });
    
    this.realtimeGateway.broadcastGroupUpdate(saved.id, saved.gradeId).catch(console.error);
    
    return saved;
  }

  async update(id: string, groupData: Partial<Group>, user: User): Promise<Group> {
    const oldGroup = await this.findOne(id);
    await this.groupsRepository.update(id, groupData);
    const newGroup = await this.findOne(id);
    
    // Log changes
    for (const key in groupData) {
      if (oldGroup[key] !== newGroup[key]) {
        await this.auditService.log({
          entity: 'Group',
          entityId: id,
          field: key,
          oldValue: String(oldGroup[key]),
          newValue: String(newGroup[key]),
          userId: user.id,
        });
      }
    }
    
    this.realtimeGateway.broadcastGroupUpdate(id, newGroup.gradeId).catch(console.error);
    
    return newGroup;
  }

  async remove(id: string, user: User): Promise<void> {
    await this.auditService.log({
      entity: 'Group',
      entityId: id,
      field: 'deleted',
      oldValue: JSON.stringify(await this.findOne(id)),
      newValue: null,
      userId: user.id,
    });
    
    await this.groupsRepository.delete(id);
    
    this.realtimeGateway.broadcastGroupUpdate(id).catch(console.error);
  }

  async updateStudentCount(id: string): Promise<void> {
    const group = await this.groupsRepository.findOne({
      where: { id },
      relations: ['students'],
    });
    if (group) {
      group.studentCount = group.students?.length || 0;
      await this.groupsRepository.save(group);
    }
  }
}

