import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Or } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Grade } from '../grades/entities/grade.entity';
import { Group } from '../groups/entities/group.entity';

@Injectable()
export class SearchService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
  ) {}

  async search(query: string): Promise<{
    students: Student[];
    grades: Grade[];
    groups: Group[];
  }> {
    // Normalize Hebrew text (remove diacritics, handle common variations)
    const normalizedQuery = this.normalizeHebrew(query);
    const correctedQuery = this.correctTypo(normalizedQuery);
    const searchTerm = `%${correctedQuery}%`;
    
    // Use PostgreSQL full-text search for better Hebrew support
    const [students, grades, groups] = await Promise.all([
      this.studentsRepository
        .createQueryBuilder('student')
        .leftJoinAndSelect('student.grade', 'grade')
        .leftJoinAndSelect('student.group', 'group')
        .where(
          'student.firstName ILIKE :search OR student.lastName ILIKE :search OR student.studentId ILIKE :search',
          { search: searchTerm },
        )
        .orWhere(
          "to_tsvector('hebrew', student.firstName || ' ' || student.lastName) @@ plainto_tsquery('hebrew', :query)",
          { query: correctedQuery },
        )
        .take(50)
        .getMany(),
      this.gradesRepository.find({
        where: { name: ILike(searchTerm) },
        take: 20,
      }),
      this.groupsRepository
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.grade', 'grade')
        .leftJoinAndSelect('group.teacher', 'teacher')
        .where('group.name ILIKE :search', { search: searchTerm })
        .take(20)
        .getMany(),
    ]);

    return { students, grades, groups };
  }

  // Normalize Hebrew text for better search
  normalizeHebrew(text: string): string {
    // Remove Hebrew diacritics (nikud)
    const nikudRegex = /[\u0591-\u05C7]/g;
    let normalized = text.replace(nikudRegex, '');
    
    // Handle common Hebrew character variations
    normalized = normalized
      .replace(/[א]/g, 'א')
      .replace(/[ה]/g, 'ה')
      .replace(/[ו]/g, 'ו')
      .replace(/[י]/g, 'י');
    
    return normalized.trim();
  }

  // Enhanced typo correction for Hebrew
  correctTypo(word: string): string {
    const commonTypos: { [key: string]: string } = {
      // Common keyboard typos (Hebrew QWERTY layout)
      'תלמיד': 'תלמיד',
      'תלמידה': 'תלמידה',
      'כיתה': 'כיתה',
      'מורה': 'מורה',
      'בית ספר': 'בית ספר',
      // Add more common typos and corrections
    };

    // Check for exact match
    if (commonTypos[word]) {
      return commonTypos[word];
    }

    // Check for partial matches (fuzzy matching)
    for (const [typo, correct] of Object.entries(commonTypos)) {
      if (this.levenshteinDistance(word, typo) <= 2) {
        return correct;
      }
    }

    return word;
  }

  // Levenshtein distance for fuzzy matching
  private levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1,
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }
}

