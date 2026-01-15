import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Grade } from './entities/grade.entity';
import { AuditService } from '../audit/audit.service';
import { User } from '../users/entities/user.entity';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class GradesService {
  constructor(
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
    private auditService: AuditService,
    @Inject(forwardRef(() => RealtimeGateway))
    private realtimeGateway: RealtimeGateway,
  ) {}

  async findAll(): Promise<Grade[]> {
    return this.gradesRepository.find({
      relations: ['groups', 'students'],
      order: { name: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Grade> {
    return this.gradesRepository.findOne({
      where: { id },
      relations: ['groups', 'students'],
    });
  }

  async create(gradeData: Partial<Grade>, user: User): Promise<Grade> {
    const grade = this.gradesRepository.create(gradeData);
    const saved = await this.gradesRepository.save(grade);
    
    await this.auditService.log({
      entity: 'Grade',
      entityId: saved.id,
      field: 'created',
      newValue: JSON.stringify(saved),
      userId: user.id,
    });
    
    this.realtimeGateway.broadcastGradeUpdate(saved.id).catch(console.error);
    
    return saved;
  }

  async update(id: string, gradeData: Partial<Grade>, user: User): Promise<Grade> {
    const oldGrade = await this.findOne(id);
    await this.gradesRepository.update(id, gradeData);
    const newGrade = await this.findOne(id);
    
    // Log changes
    for (const key in gradeData) {
      if (oldGrade[key] !== newGrade[key]) {
        await this.auditService.log({
          entity: 'Grade',
          entityId: id,
          field: key,
          oldValue: String(oldGrade[key]),
          newValue: String(newGrade[key]),
          userId: user.id,
        });
      }
    }
    
    this.realtimeGateway.broadcastGradeUpdate(id).catch(console.error);
    
    return newGrade;
  }

  async remove(id: string, user: User): Promise<void> {
    await this.auditService.log({
      entity: 'Grade',
      entityId: id,
      field: 'deleted',
      oldValue: JSON.stringify(await this.findOne(id)),
      newValue: null,
      userId: user.id,
    });
    
    await this.gradesRepository.delete(id);
    
    this.realtimeGateway.broadcastGradeUpdate(id).catch(console.error);
  }

  async updateStudentCount(id: string): Promise<void> {
    const grade = await this.gradesRepository.findOne({
      where: { id },
      relations: ['students'],
    });
    if (grade) {
      grade.studentCount = grade.students?.length || 0;
      await this.gradesRepository.save(grade);
    }
  }
}

