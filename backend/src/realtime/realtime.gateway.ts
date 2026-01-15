import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Inject, forwardRef } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { GradesService } from '../grades/grades.service';
import { GroupsService } from '../groups/groups.service';
import { StudentsService } from '../students/students.service';
import { ReportsService } from '../reports/reports.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class RealtimeGateway
  implements OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    @Inject(forwardRef(() => GradesService))
    private gradesService: GradesService,
    @Inject(forwardRef(() => GroupsService))
    private groupsService: GroupsService,
    @Inject(forwardRef(() => StudentsService))
    private studentsService: StudentsService,
    @Inject(forwardRef(() => ReportsService))
    private reportsService: ReportsService,
  ) {}

  handleConnection(client: Socket) {
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('subscribe:grades')
  async handleSubscribeGrades(client: Socket) {
    client.join('grades');
    const grades = await this.gradesService.findAll();
    this.server.to('grades').emit('grades:updated', grades);
  }

  @SubscribeMessage('subscribe:groups')
  async handleSubscribeGroups(client: Socket, data: { gradeId?: string }) {
    const room = data.gradeId ? `groups:${data.gradeId}` : 'groups';
    client.join(room);
    const groups = data.gradeId
      ? await this.groupsService.findByGrade(data.gradeId)
      : await this.groupsService.findAll();
    this.server.to(room).emit('groups:updated', groups);
  }

  @SubscribeMessage('subscribe:students')
  async handleSubscribeStudents(
    client: Socket,
    data: { gradeId?: string; groupId?: string },
  ) {
    let room = 'students';
    if (data.groupId) {
      room = `students:group:${data.groupId}`;
    } else if (data.gradeId) {
      room = `students:grade:${data.gradeId}`;
    }
    client.join(room);
    const students = data.groupId
      ? await this.studentsService.findByGroup(data.groupId)
      : data.gradeId
      ? await this.studentsService.findByGrade(data.gradeId)
      : await this.studentsService.findAll();
    this.server.to(room).emit('students:updated', students);
  }

  @SubscribeMessage('subscribe:reports')
  async handleSubscribeReports(client: Socket) {
    client.join('reports');
    const schoolStats = await this.reportsService.getSchoolStats();
    this.server.to('reports').emit('reports:updated', schoolStats);
  }

  // Broadcast updates
  async broadcastGradeUpdate(gradeId: string) {
    try {
      const grades = await this.gradesService.findAll();
      this.server.to('grades').emit('grades:updated', grades);
      this.server.to('grades').emit('grade:updated', { gradeId });
    } catch (error) {
      console.error('Error broadcasting grade update:', error);
    }
  }

  async broadcastGroupUpdate(groupId: string, gradeId?: string) {
    try {
      if (gradeId) {
        const groups = await this.groupsService.findByGrade(gradeId);
        this.server.to(`groups:${gradeId}`).emit('groups:updated', groups);
      }
      const allGroups = await this.groupsService.findAll();
      this.server.to('groups').emit('groups:updated', allGroups);
      this.server.to('groups').emit('group:updated', { groupId });
    } catch (error) {
      console.error('Error broadcasting group update:', error);
    }
  }

  async broadcastStudentUpdate(studentId: string, groupId?: string, gradeId?: string) {
    try {
      if (groupId) {
        const students = await this.studentsService.findByGroup(groupId);
        this.server.to(`students:group:${groupId}`).emit('students:updated', students);
      }
      if (gradeId) {
        const students = await this.studentsService.findByGrade(gradeId);
        this.server.to(`students:grade:${gradeId}`).emit('students:updated', students);
      }
      const allStudents = await this.studentsService.findAll();
      this.server.to('students').emit('students:updated', allStudents);
      this.server.to('students').emit('student:updated', { studentId });
    } catch (error) {
      console.error('Error broadcasting student update:', error);
    }
  }
}
