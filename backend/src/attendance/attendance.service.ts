import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Attendance } from './entities/attendance.entity';
import { AuditService } from '../audit/audit.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AttendanceService {
  constructor(
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
    private auditService: AuditService,
  ) {}

  async findAll(): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      relations: ['student'],
      order: { date: 'DESC' },
    });
  }

  async findByStudent(studentId: string): Promise<Attendance[]> {
    return this.attendanceRepository.find({
      where: { studentId },
      relations: ['student'],
      order: { date: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Attendance> {
    return this.attendanceRepository.findOne({
      where: { id },
      relations: ['student'],
    });
  }

  async create(attendanceData: Partial<Attendance>, user: User): Promise<Attendance> {
    const attendance = this.attendanceRepository.create(attendanceData);
    const saved = await this.attendanceRepository.save(attendance);
    
    await this.auditService.log({
      entity: 'Attendance',
      entityId: saved.id,
      field: 'created',
      newValue: JSON.stringify(saved),
      userId: user.id,
    });
    
    return saved;
  }

  async update(id: string, attendanceData: Partial<Attendance>, user: User): Promise<Attendance> {
    const oldAttendance = await this.findOne(id);
    await this.attendanceRepository.update(id, attendanceData);
    const newAttendance = await this.findOne(id);
    
    // Log changes
    for (const key in attendanceData) {
      if (oldAttendance[key] !== newAttendance[key]) {
        await this.auditService.log({
          entity: 'Attendance',
          entityId: id,
          field: key,
          oldValue: String(oldAttendance[key]),
          newValue: String(newAttendance[key]),
          userId: user.id,
        });
      }
    }
    
    return newAttendance;
  }

  async remove(id: string, user: User): Promise<void> {
    await this.auditService.log({
      entity: 'Attendance',
      entityId: id,
      field: 'deleted',
      oldValue: JSON.stringify(await this.findOne(id)),
      newValue: null,
      userId: user.id,
    });
    
    await this.attendanceRepository.delete(id);
  }
}

