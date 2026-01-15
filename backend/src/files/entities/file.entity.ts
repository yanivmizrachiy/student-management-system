import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  studentId: string;

  @ManyToOne(() => Student, (student) => student.files)
  @JoinColumn({ name: 'studentId' })
  student: Student;

  @Column()
  type: string; // e.g., "document", "image", "certificate"

  @Column()
  url: string;

  @Column()
  fileName: string;

  @Column('bigint')
  size: number; // in bytes

  @Column()
  mimeType: string;

  @CreateDateColumn()
  uploadedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

