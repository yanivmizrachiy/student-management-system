import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from './entities/student.entity';
import { AuditService } from '../audit/audit.service';
import { User } from '../users/entities/user.entity';
import { RealtimeGateway } from '../realtime/realtime.gateway';

@Injectable()
export class StudentsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    private auditService: AuditService,
    @Inject(forwardRef(() => RealtimeGateway))
    private realtimeGateway: RealtimeGateway,
  ) {}

  async findAll(): Promise<Student[]> {
    return this.studentsRepository.find({
      relations: ['grade', 'group', 'assessments', 'attendance'],
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async findByGrade(gradeId: string): Promise<Student[]> {
    return this.studentsRepository.find({
      where: { gradeId },
      relations: ['grade', 'group'],
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async findByGroup(groupId: string): Promise<Student[]> {
    return this.studentsRepository.find({
      where: { groupId },
      relations: ['grade', 'group'],
      order: { lastName: 'ASC', firstName: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Student> {
    return this.studentsRepository.findOne({
      where: { id },
      relations: ['grade', 'group', 'assessments', 'attendance', 'files'],
    });
  }

  async create(studentData: Partial<Student>, user: User): Promise<Student> {
    const student = this.studentsRepository.create(studentData);
    const saved = await this.studentsRepository.save(student);
    
    await this.auditService.log({
      entity: 'Student',
      entityId: saved.id,
      field: 'created',
      newValue: JSON.stringify(saved),
      userId: user.id,
    });
    
    this.realtimeGateway.broadcastStudentUpdate(saved.id, saved.groupId, saved.gradeId).catch(console.error);
    
    return saved;
  }

  async update(id: string, studentData: Partial<Student>, user: User): Promise<Student> {
    const oldStudent = await this.findOne(id);
    await this.studentsRepository.update(id, studentData);
    const newStudent = await this.findOne(id);
    
    // Log changes
    for (const key in studentData) {
      if (oldStudent[key] !== newStudent[key]) {
        await this.auditService.log({
          entity: 'Student',
          entityId: id,
          field: key,
          oldValue: String(oldStudent[key]),
          newValue: String(newStudent[key]),
          userId: user.id,
        });
      }
    }
    
    this.realtimeGateway.broadcastStudentUpdate(id, newStudent.groupId, newStudent.gradeId).catch(console.error);
    
    return newStudent;
  }

  async remove(id: string, user: User): Promise<void> {
    await this.auditService.log({
      entity: 'Student',
      entityId: id,
      field: 'deleted',
      oldValue: JSON.stringify(await this.findOne(id)),
      newValue: null,
      userId: user.id,
    });
    
    await this.studentsRepository.delete(id);
    
    this.realtimeGateway.broadcastStudentUpdate(id).catch(console.error);
  }
}

