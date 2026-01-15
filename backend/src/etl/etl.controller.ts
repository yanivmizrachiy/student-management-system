import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Request,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { EtlService } from './etl.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EditPermissionGuard } from '../auth/guards/edit-permission.guard';

@ApiTags('etl')
@Controller('etl')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EtlController {
  constructor(private readonly etlService: EtlService) {}

  @Post('import/students')
  @UseGuards(EditPermissionGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype ===
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
          file.mimetype === 'application/vnd.ms-excel'
        ) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              'Only Excel files (.xlsx, .xls) are allowed',
            ),
            false,
          );
        }
      },
    }),
  )
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Import students from Excel file (manager only)' })
  async importStudents(
    @UploadedFile() file: Express.Multer.File,
    @Request() req,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Validate file first
    const validation = await this.etlService.validateExcelFile(file);
    if (!validation.valid) {
      return {
        success: false,
        errors: validation.errors,
        rowCount: validation.rowCount,
      };
    }

    // Import students
    const result = await this.etlService.importStudentsFromExcel(file, req.user);

    return {
      success: true,
      ...result,
      totalRows: validation.rowCount,
    };
  }

  @Post('validate')
  @UseGuards(EditPermissionGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiOperation({ summary: 'Validate Excel file before import (manager only)' })
  async validateFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    return await this.etlService.validateExcelFile(file);
  }
}
