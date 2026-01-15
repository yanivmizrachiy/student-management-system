import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Request,
  Query,
  UseInterceptors,
  UploadedFile,
  Res,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { FilesService } from './files.service';
import { File } from './entities/file.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EditPermissionGuard } from '../auth/guards/edit-permission.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as fs from 'fs';
import * as path from 'path';

@ApiTags('files')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all files' })
  findAll(@Query('studentId') studentId?: string): Promise<File[]> {
    if (studentId) {
      return this.filesService.findByStudent(studentId);
    }
    return this.filesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get file by ID' })
  findOne(@Param('id') id: string): Promise<File> {
    return this.filesService.findOne(id);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download file with signed URL' })
  async downloadFile(
    @Param('id') id: string,
    @Query('expires') expires: string,
    @Query('signature') signature: string,
    @Res() res: Response,
  ) {
    const isValid = await this.filesService.validateSignedUrl(
      id,
      expires,
      signature,
    );
    if (!isValid) {
      return res.status(403).json({ message: 'Invalid or expired URL' });
    }

    const file = await this.filesService.findOne(id);
    if (!file) {
      return res.status(404).json({ message: 'File not found' });
    }

    const filePath = path.join(process.cwd(), file.url);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ message: 'File not found on disk' });
    }

    res.setHeader('Content-Type', file.mimeType);
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${file.fileName}"`,
    );
    return res.sendFile(filePath);
  }

  @Post('upload')
  @UseGuards(EditPermissionGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Upload file (manager only)' })
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('studentId') studentId: string,
    @Body('type') type: string,
    @Request() req,
  ): Promise<File> {
    const fileData: Partial<File> = {
      studentId,
      type,
      url: `/uploads/${file.filename}`,
      fileName: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
    };
    return this.filesService.create(fileData, req.user);
  }

  @Delete(':id')
  @UseGuards(EditPermissionGuard)
  @ApiOperation({ summary: 'Delete file (manager only)' })
  remove(@Param('id') id: string, @Request() req): Promise<void> {
    return this.filesService.remove(id, req.user);
  }
}
