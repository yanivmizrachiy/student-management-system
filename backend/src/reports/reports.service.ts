import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Student } from '../students/entities/student.entity';
import { Grade } from '../grades/entities/grade.entity';
import { Group } from '../groups/entities/group.entity';
import { Assessment } from '../assessments/entities/assessment.entity';
import { Attendance, AttendanceStatus } from '../attendance/entities/attendance.entity';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Student)
    private studentsRepository: Repository<Student>,
    @InjectRepository(Grade)
    private gradesRepository: Repository<Grade>,
    @InjectRepository(Group)
    private groupsRepository: Repository<Group>,
    @InjectRepository(Assessment)
    private assessmentsRepository: Repository<Assessment>,
    @InjectRepository(Attendance)
    private attendanceRepository: Repository<Attendance>,
  ) {}

  // School-level reports
  async getSchoolStats() {
    const grades = await this.gradesRepository.find({
      relations: ['students'],
      order: { name: 'ASC' },
    });

    const studentsByGrade = grades.map((grade) => ({
      name: grade.name,
      count: grade.students?.length || 0,
    }));

    const totalStudents = await this.studentsRepository.count();

    // Get student count over time (last 12 months)
    const studentCountOverTime = await this.getStudentCountOverTime();

    return {
      totalStudents,
      studentsByGrade,
      totalGrades: grades.length,
      studentCountOverTime, // For line chart
      // Pie chart data
      pieChartData: studentsByGrade.map((g) => ({
        name: g.name,
        value: g.count,
      })),
    };
  }

  private async getStudentCountOverTime(): Promise<
    Array<{ date: string; count: number }>
  > {
    const months = 12;
    const data: Array<{ date: string; count: number }> = [];
    const now = new Date();

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const count = await this.studentsRepository
        .createQueryBuilder('student')
        .where('student.createdAt <= :date', { date })
        .getCount();

      data.push({
        date: date.toISOString().split('T')[0],
        count,
      });
    }

    return data;
  }

  // Grade-level reports
  async getGradeStats(gradeId: string) {
    const grade = await this.gradesRepository.findOne({
      where: { id: gradeId },
      relations: ['groups', 'students'],
    });

    const groups = await this.groupsRepository.find({
      where: { gradeId },
      relations: ['students'],
    });

    const studentsByGroup = groups.map((group) => ({
      name: group.name,
      count: group.students?.length || 0,
    }));

    // Average grades for the grade over time
    const assessments = await this.assessmentsRepository
      .createQueryBuilder('assessment')
      .leftJoin('assessment.student', 'student')
      .where('student.gradeId = :gradeId', { gradeId })
      .orderBy('assessment.date', 'ASC')
      .getMany();

    const avgGrade =
      assessments.length > 0
        ? assessments.reduce((sum, a) => sum + Number(a.value), 0) /
          assessments.length
        : 0;

    // Calculate average grades over time (line chart)
    const avgGradesOverTime = this.calculateAverageGradesOverTime(assessments);

    return {
      gradeName: grade.name,
      totalStudents: grade.students?.length || 0,
      studentsByGroup,
      averageGrade: avgGrade.toFixed(2),
      // Bar chart data for students per group
      barChartData: studentsByGroup,
      // Line chart data for average grades over time
      lineChartData: avgGradesOverTime,
    };
  }

  private calculateAverageGradesOverTime(
    assessments: Assessment[],
  ): Array<{ date: string; average: number }> {
    const groupedByDate: { [key: string]: number[] } = {};

    assessments.forEach((a) => {
      const date = a.date.toISOString().split('T')[0];
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      groupedByDate[date].push(Number(a.value));
    });

    return Object.entries(groupedByDate)
      .map(([date, values]) => ({
        date,
        average: values.reduce((sum, v) => sum + v, 0) / values.length,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Group-level reports
  async getGroupStats(groupId: string) {
    const group = await this.groupsRepository.findOne({
      where: { id: groupId },
      relations: ['students'],
    });

    const attendance = await this.attendanceRepository.find({
      where: { student: { groupId } },
    });

    const attendanceStats = {
      present: attendance.filter((a) => a.status === AttendanceStatus.PRESENT)
        .length,
      absent: attendance.filter((a) => a.status === AttendanceStatus.ABSENT)
        .length,
      late: attendance.filter((a) => a.status === AttendanceStatus.LATE).length,
    };

    const assessments = await this.assessmentsRepository.find({
      where: { groupId },
    });

    const gradeDistribution = this.calculateGradeDistribution(assessments);

    return {
      groupName: group.name,
      totalStudents: group.students?.length || 0,
      attendanceStats,
      gradeDistribution,
      // Pie chart data for attendance
      attendancePieChart: [
        { name: 'נוכח', value: attendanceStats.present },
        { name: 'נעדר', value: attendanceStats.absent },
        { name: 'מאחר', value: attendanceStats.late },
      ],
      // Histogram data for grade distribution
      gradeHistogram: Object.entries(gradeDistribution).map(([grade, count]) => ({
        grade: Number(grade),
        count,
      })),
    };
  }

  // Student-level reports
  async getStudentStats(studentId: string) {
    const student = await this.studentsRepository.findOne({
      where: { id: studentId },
      relations: ['assessments', 'attendance'],
    });

    const gradesOverTime = student.assessments
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((a) => ({
        date: a.date.toISOString().split('T')[0],
        value: Number(a.value),
        metric: a.metric,
      }));

    const attendanceByDay = student.attendance
      .sort((a, b) => a.date.getTime() - b.date.getTime())
      .map((a) => ({
        date: a.date.toISOString().split('T')[0],
        status: a.status,
        value: a.status === AttendanceStatus.PRESENT ? 1 : a.status === AttendanceStatus.LATE ? 0.5 : 0,
      }));

    return {
      studentName: student.getFullName(),
      gradesOverTime,
      attendanceByDay,
      totalAssessments: student.assessments.length,
      totalAttendance: student.attendance.length,
      // Line chart data for grades over time
      gradesLineChart: gradesOverTime,
      // Bar chart data for attendance by day
      attendanceBarChart: attendanceByDay,
    };
  }

  private calculateGradeDistribution(assessments: Assessment[]): {
    [key: number]: number;
  } {
    const distribution: { [key: number]: number } = {};
    assessments.forEach((a) => {
      const grade = Math.floor(Number(a.value));
      distribution[grade] = (distribution[grade] || 0) + 1;
    });
    return distribution;
  }
}

