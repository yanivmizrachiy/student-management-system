import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Grade } from '../../grades/entities/grade.entity';
import { Group } from '../../groups/entities/group.entity';
import { Assessment } from '../../assessments/entities/assessment.entity';
import { Attendance } from '../../attendance/entities/attendance.entity';
import { File } from '../../files/entities/file.entity';

export enum StudentStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  GRADUATED = 'graduated',
}

@Entity('students')
@Index(['firstName', 'lastName']) // Composite index for name searches
@Index(['studentId']) // Index for student ID searches
@Index(['gradeId']) // Index for grade filtering
@Index(['groupId']) // Index for group filtering
@Index(['status']) // Index for status filtering
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  studentId: string; // Unique student ID

  @Column({ type: 'uuid' })
  gradeId: string;

  @ManyToOne(() => Grade, (grade) => grade.students)
  @JoinColumn({ name: 'gradeId' })
  grade: Grade;

  @Column({ type: 'uuid' })
  groupId: string;

  @ManyToOne(() => Group, (group) => group.students)
  @JoinColumn({ name: 'groupId' })
  group: Group;

  @Column({
    type: 'enum',
    enum: StudentStatus,
    default: StudentStatus.ACTIVE,
  })
  status: StudentStatus;

  @Column({ nullable: true })
  profileImageUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Assessment, (assessment) => assessment.student)
  assessments: Assessment[];

  @OneToMany(() => Attendance, (attendance) => attendance.student)
  attendance: Attendance[];

  @OneToMany(() => File, (file) => file.student)
  files: File[];

  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}

