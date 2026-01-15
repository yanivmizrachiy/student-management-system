import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Assessment } from './entities/assessment.entity';
import { AuditService } from '../audit/audit.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AssessmentsService {
  constructor(
    @InjectRepository(Assessment)
    private assessmentsRepository: Repository<Assessment>,
    private auditService: AuditService,
  ) {}

  async findAll(): Promise<Assessment[]> {
    return this.assessmentsRepository.find({
      relations: ['student', 'group'],
      order: { date: 'DESC' },
    });
  }

  async findByStudent(studentId: string): Promise<Assessment[]> {
    return this.assessmentsRepository.find({
      where: { studentId },
      relations: ['student', 'group'],
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Assessment> {
    return this.assessmentsRepository.findOne({
      where: { id },
      relations: ['student', 'group'],
    });
  }

  async create(assessmentData: Partial<Assessment>, user: User): Promise<Assessment> {
    const assessment = this.assessmentsRepository.create(assessmentData);
    const saved = await this.assessmentsRepository.save(assessment);
    
    await this.auditService.log({
      entity: 'Assessment',
      entityId: saved.id,
      field: 'created',
      newValue: JSON.stringify(saved),
      userId: user.id,
    });
    
    return saved;
  }

  async update(id: string, assessmentData: Partial<Assessment>, user: User): Promise<Assessment> {
    const oldAssessment = await this.findOne(id);
    await this.assessmentsRepository.update(id, assessmentData);
    const newAssessment = await this.findOne(id);
    
    // Log changes
    for (const key in assessmentData) {
      if (oldAssessment[key] !== newAssessment[key]) {
        await this.auditService.log({
          entity: 'Assessment',
          entityId: id,
          field: key,
          oldValue: String(oldAssessment[key]),
          newValue: String(newAssessment[key]),
          userId: user.id,
        });
      }
    }
    
    return newAssessment;
  }

  async remove(id: string, user: User): Promise<void> {
    await this.auditService.log({
      entity: 'Assessment',
      entityId: id,
      field: 'deleted',
      oldValue: JSON.stringify(await this.findOne(id)),
      newValue: null,
      userId: user.id,
    });
    
    await this.assessmentsRepository.delete(id);
  }
}

