import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StudentsService } from '../src/students/students.service';
import { Student } from '../src/students/entities/student.entity';
import { AuditService } from '../src/audit/audit.service';

describe('StudentsService', () => {
  let service: StudentsService;
  let repository: Repository<Student>;
  let auditService: AuditService;

  const mockRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StudentsService,
        {
          provide: getRepositoryToken(Student),
          useValue: mockRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<StudentsService>(StudentsService);
    repository = module.get<Repository<Student>>(getRepositoryToken(Student));
    auditService = module.get<AuditService>(AuditService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of students', async () => {
      const mockStudents = [
        { id: '1', firstName: 'John', lastName: 'Doe' },
        { id: '2', firstName: 'Jane', lastName: 'Smith' },
      ];
      mockRepository.find.mockResolvedValue(mockStudents);

      const result = await service.findAll();

      expect(result).toEqual(mockStudents);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a single student', async () => {
      const mockStudent = { id: '1', firstName: 'John', lastName: 'Doe' };
      mockRepository.findOne.mockResolvedValue(mockStudent);

      const result = await service.findOne('1');

      expect(result).toEqual(mockStudent);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: '1' },
        relations: ['grade', 'group', 'assessments', 'attendance', 'files'],
      });
    });
  });

  describe('create', () => {
    it('should create a new student and log audit', async () => {
      const studentData = {
        firstName: 'John',
        lastName: 'Doe',
        studentId: '123456789',
      };
      const mockUser = { id: 'user1', name: 'Test User' };
      const mockStudent = { id: '1', ...studentData };

      mockRepository.create.mockReturnValue(mockStudent);
      mockRepository.save.mockResolvedValue(mockStudent);

      const result = await service.create(studentData, mockUser as any);

      expect(result).toEqual(mockStudent);
      expect(mockRepository.create).toHaveBeenCalledWith(studentData);
      expect(mockRepository.save).toHaveBeenCalled();
      expect(mockAuditService.log).toHaveBeenCalled();
    });
  });
});

