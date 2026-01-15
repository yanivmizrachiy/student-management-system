import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddHebrewIndexes1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create GIN index for Hebrew full-text search on students
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_students_name_hebrew 
      ON students USING gin(to_tsvector('hebrew', "firstName" || ' ' || "lastName"));
    `);

    // Create index for studentId searches
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_students_student_id 
      ON students("studentId");
    `);

    // Create composite index for grade and group filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_students_grade_group 
      ON students("gradeId", "groupId");
    `);

    // Create index for status filtering
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_students_status 
      ON students("status");
    `);

    // Create index for groups name search
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_groups_name_hebrew 
      ON groups USING gin(to_tsvector('hebrew', name));
    `);

    // Create index for grades name search
    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS idx_grades_name 
      ON grades(name);
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS idx_students_name_hebrew;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_students_student_id;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_students_grade_group;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_students_status;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_groups_name_hebrew;`);
    await queryRunner.query(`DROP INDEX IF EXISTS idx_grades_name;`);
  }
}

