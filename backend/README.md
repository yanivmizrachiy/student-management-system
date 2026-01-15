# Smart Student Management System - Backend

Backend API built with NestJS, PostgreSQL, and WebSocket for real-time updates.

## Features

- ✅ Authentication & Authorization (JWT)
- ✅ Role-based permissions (Manager/Read-only)
- ✅ Complete CRUD for Students, Grades, Groups, Assessments, Attendance
- ✅ File upload system
- ✅ Audit Trail for all changes
- ✅ Smart search with Hebrew support
- ✅ Reports and statistics
- ✅ Real-time updates via WebSocket
- ✅ Swagger API documentation

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file (copy from `.env.example`):
```bash
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=student_management
JWT_SECRET=your-secret-key
PORT=3001
```

3. Create PostgreSQL database:
```sql
CREATE DATABASE student_management;
```

4. Run migrations (TypeORM will auto-sync in development):
```bash
npm run start:dev
```

5. Create manager user (Yaniv Raz):
```bash
# Use the API or create via SQL
```

## API Endpoints

### Authentication
- `POST /auth/login` - Login
- `GET /auth/profile` - Get current user
- `POST /auth/logout` - Logout

### Grades
- `GET /grades` - Get all grades
- `GET /grades/:id` - Get grade by ID
- `POST /grades` - Create grade (manager only)
- `PATCH /grades/:id` - Update grade (manager only)
- `DELETE /grades/:id` - Delete grade (manager only)

### Groups
- `GET /groups` - Get all groups
- `GET /groups?gradeId=xxx` - Get groups by grade
- `GET /groups/:id` - Get group by ID
- `POST /groups` - Create group (manager only)
- `PATCH /groups/:id` - Update group (manager only)
- `DELETE /groups/:id` - Delete group (manager only)

### Students
- `GET /students` - Get all students
- `GET /students?gradeId=xxx` - Get students by grade
- `GET /students?groupId=xxx` - Get students by group
- `GET /students/:id` - Get student by ID
- `POST /students` - Create student (manager only)
- `PATCH /students/:id` - Update student (manager only)
- `DELETE /students/:id` - Delete student (manager only)

### Assessments
- `GET /assessments` - Get all assessments
- `GET /assessments?studentId=xxx` - Get assessments by student
- `POST /assessments` - Create assessment (manager only)

### Attendance
- `GET /attendance` - Get all attendance records
- `GET /attendance?studentId=xxx` - Get attendance by student
- `POST /attendance` - Create attendance (manager only)

### Files
- `GET /files` - Get all files
- `GET /files?studentId=xxx` - Get files by student
- `POST /files/upload` - Upload file (manager only)
- `DELETE /files/:id` - Delete file (manager only)

### Search
- `GET /search?q=query` - Smart search

### Reports
- `GET /reports/school` - School-level stats
- `GET /reports/grade/:gradeId` - Grade-level stats
- `GET /reports/group/:groupId` - Group-level stats
- `GET /reports/student/:studentId` - Student-level stats

### Audit
- `GET /audit` - Get all audit logs
- `GET /audit/:entity/:entityId` - Get audit logs for entity

## WebSocket Events

### Subscribe
- `subscribe:grades` - Subscribe to grade updates
- `subscribe:groups` - Subscribe to group updates
- `subscribe:students` - Subscribe to student updates
- `subscribe:reports` - Subscribe to report updates

### Receive
- `grades:updated` - Grades updated
- `groups:updated` - Groups updated
- `students:updated` - Students updated
- `reports:updated` - Reports updated

## Permissions

- **Manager (Yaniv Raz)**: Full edit rights (create, update, delete)
- **Others**: Read-only access

## Development

```bash
# Development mode
npm run start:dev

# Production build
npm run build
npm run start:prod

# Run tests
npm test
```

## API Documentation

Swagger documentation available at: `http://localhost:3001/api`

