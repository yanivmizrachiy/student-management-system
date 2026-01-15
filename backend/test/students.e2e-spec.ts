import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('Students (e2e)', () => {
  let app: INestApplication;
  let authToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    // Login to get auth token
    const loginResponse = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        email: 'yaniv@example.com',
        password: 'password',
      });

    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await app.close();
  });

  it('/students (GET) - should return all students', () => {
    return request(app.getHttpServer())
      .get('/students')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });

  it('/students (POST) - should create a student (manager only)', () => {
    return request(app.getHttpServer())
      .post('/students')
      .set('Authorization', `Bearer ${authToken}`)
      .send({
        firstName: 'Test',
        lastName: 'Student',
        studentId: '123456789',
        gradeId: 'grade-id',
        groupId: 'group-id',
      })
      .expect(201);
  });

  it('/students/:id (GET) - should return a student by ID', () => {
    return request(app.getHttpServer())
      .get('/students/test-id')
      .set('Authorization', `Bearer ${authToken}`)
      .expect(200);
  });
});

