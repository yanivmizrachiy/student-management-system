import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as XLSX from 'xlsx';
import { Student } from '../students/entities/student.entity';
import { Grade } from '../grades/entities/grade.entity';
import { Group } from '../groups/entities/group.entity';
import { StudentsService } from '../students/students.service';
import { GradesService } from '../grades/grades.service';
import { GroupsService } from '../groups/groups.service';
import { User } from '../users/entities/user.entity';

interface ImportResult {
  success: number;
  failed: number;
  errors: Array<{ row: number; error: string }>;
}

@Injectable()
export class EtlService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    private studentsService: StudentsService,
    private gradesService: GradesService,
    private groupsService: GroupsService,
  ) {}

  async importStudentsFromExcel(
    file: Express.Multer.File,
    user: User,
  ): Promise<ImportResult> {
    const result: ImportResult = {
      success: 0,
      failed: 0,
      errors: [],
    };

    try {
      // Read Excel file
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      // Validate headers
      const requiredHeaders = [
        'firstName',
        'lastName',
        'studentId',
        'gradeName',
        'groupName',
      ];
      const headers = Object.keys(data[0] || {});
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h),
      );

      if (missingHeaders.length > 0) {
        throw new BadRequestException(
          `Missing required columns: ${missingHeaders.join(', ')}`,
        );
      }

      // Process each row
      for (let i = 0; i < data.length; i++) {
        const row = data[i] as any;
        try {
          // Find or create grade
          let grade = await this.gradesRepository.findOne({
            where: { name: row.gradeName },
          });

          if (!grade) {
            grade = await this.gradesService.create(
              { name: row.gradeName, studentCount: 0 },
              user,
            );
          }

          // Find or create group
          let group = await this.groupsRepository.findOne({
            where: { name: row.groupName, gradeId: grade.id },
          });

          if (!group) {
            // Find teacher (if provided)
            const teacherId = row.teacherId || null;
            group = await this.groupsService.create(
              {
                name: row.groupName,
                gradeId: grade.id,
                teacherId: teacherId,
                studentCount: 0,
              },
              user,
            );
          }

          // Check if student already exists
          const existingStudent = await this.studentsRepository.findOne({
            where: { studentId: row.studentId },
          });

          if (existingStudent) {
            // Update existing student
            await this.studentsService.update(
              existingStudent.id,
              {
                firstName: row.firstName,
                lastName: row.lastName,
                gradeId: grade.id,
                groupId: group.id,
                status: row.status || 'active',
              },
              user,
            );
          } else {
            // Create new student
            await this.studentsService.create(
              {
                firstName: row.firstName,
                lastName: row.lastName,
                studentId: row.studentId,
                gradeId: grade.id,
                groupId: group.id,
                status: row.status || 'active',
              },
              user,
            );
          }

          result.success++;
        } catch (error: any) {
          result.failed++;
          result.errors.push({
            row: i + 2, // +2 because Excel rows start at 1 and we have header
            error: error.message || 'Unknown error',
          });
        }
      }

      // Update student counts
      const grades = await this.gradesRepository.find();
      for (const grade of grades) {
        await this.gradesService.updateStudentCount(grade.id);
      }

      const groups = await this.groupsRepository.find();
      for (const group of groups) {
        await this.groupsService.updateStudentCount(group.id);
      }

      return result;
    } catch (error: any) {
      throw new BadRequestException(
        `Failed to import Excel file: ${error.message}`,
      );
    }
  }

  async validateExcelFile(file: Express.Multer.File): Promise<{
    valid: boolean;
    errors: string[];
    rowCount: number;
  }> {
    const errors: string[] = [];

    try {
      const workbook = XLSX.read(file.buffer, { type: 'buffer' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(worksheet);

      if (data.length === 0) {
        errors.push('Excel file is empty');
        return { valid: false, errors, rowCount: 0 };
      }

      // Check required headers
      const requiredHeaders = [
        'firstName',
        'lastName',
        'studentId',
        'gradeName',
        'groupName',
      ];
      const headers = Object.keys(data[0] || {});
      const missingHeaders = requiredHeaders.filter(
        (h) => !headers.includes(h),
      );

      if (missingHeaders.length > 0) {
        errors.push(`Missing required columns: ${missingHeaders.join(', ')}`);
      }

      // Validate data types and required fields
      data.forEach((row: any, index: number) => {
        if (!row.firstName || !row.firstName.trim()) {
          errors.push(`Row ${index + 2}: firstName is required`);
        }
        if (!row.lastName || !row.lastName.trim()) {
          errors.push(`Row ${index + 2}: lastName is required`);
        }
        if (!row.studentId || !row.studentId.toString().trim()) {
          errors.push(`Row ${index + 2}: studentId is required`);
        }
        if (!row.gradeName || !row.gradeName.trim()) {
          errors.push(`Row ${index + 2}: gradeName is required`);
        }
        if (!row.groupName || !row.groupName.trim()) {
          errors.push(`Row ${index + 2}: groupName is required`);
        }
      });

      return {
        valid: errors.length === 0,
        errors,
        rowCount: data.length,
      };
    } catch (error: any) {
      errors.push(`Failed to read Excel file: ${error.message}`);
      return { valid: false, errors, rowCount: 0 };
    }
  }
}
