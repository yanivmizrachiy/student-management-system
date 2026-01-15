import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
import { AuditService } from '../audit/audit.service';
import { User } from '../users/entities/user.entity';

@Injectable()
export class FilesService {
  constructor(
    @InjectRepository(File)
    private filesRepository: Repository<File>,
    private auditService: AuditService,
  ) {}

  async findAll(): Promise<File[]> {
    return this.filesRepository.find({
      relations: ['student'],
      order: { uploadedAt: 'DESC' },
    });
  }

  async findByStudent(studentId: string): Promise<File[]> {
    return this.filesRepository.find({
      where: { studentId },
      relations: ['student'],
      order: { uploadedAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<File> {
    return this.filesRepository.findOne({
      where: { id },
      relations: ['student'],
    });
  }

  async create(fileData: Partial<File>, user: User): Promise<File> {
    const file = this.filesRepository.create(fileData);
    const saved = await this.filesRepository.save(file);
    
    await this.auditService.log({
      entity: 'File',
      entityId: saved.id,
      field: 'created',
      newValue: JSON.stringify(saved),
      userId: user.id,
    });
    
    return saved;
  }

  async remove(id: string, user: User): Promise<void> {
    await this.auditService.log({
      entity: 'File',
      entityId: id,
      field: 'deleted',
      oldValue: JSON.stringify(await this.findOne(id)),
      newValue: null,
      userId: user.id,
    });
    
    await this.filesRepository.delete(id);
  }

  async generateSignedUrl(fileId: string, expiresIn: number = 3600): Promise<string> {
    const file = await this.findOne(fileId);
    if (!file) {
      throw new Error('File not found');
    }

    // In production, use AWS S3, Google Cloud Storage, or Azure Blob Storage
    // For now, generate a simple signed URL with expiration
    const crypto = require('crypto');
    const expires = Math.floor(Date.now() / 1000) + expiresIn;
    const signature = crypto
      .createHmac('sha256', process.env.FILE_SIGNATURE_SECRET || 'change-this-secret')
      .update(`${fileId}:${expires}`)
      .digest('hex');

    return `/files/${fileId}/download?expires=${expires}&signature=${signature}`;
  }

  async validateSignedUrl(fileId: string, expires: string, signature: string): Promise<boolean> {
    const crypto = require('crypto');
    const expectedSignature = crypto
      .createHmac('sha256', process.env.FILE_SIGNATURE_SECRET || 'change-this-secret')
      .update(`${fileId}:${expires}`)
      .digest('hex');

    // Check signature
    if (signature !== expectedSignature) {
      return false;
    }

    // Check expiration
    const expirationTime = parseInt(expires);
    if (Date.now() / 1000 > expirationTime) {
      return false;
    }

    return true;
  }
}

