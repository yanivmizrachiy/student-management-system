# Deployment Guide - Smart Student Management System

## Prerequisites

- Docker & Docker Compose
- PostgreSQL 15+ (or use Docker)
- Node.js 20+ (for local development)
- npm or yarn

## Quick Start with Docker

### 1. Backend Deployment

```bash
cd backend

# Create .env file
cp .env.example .env
# Edit .env with your configuration

# Start services
docker-compose up -d

# Check logs
docker-compose logs -f backend
```

Backend will be available at `http://localhost:3001`
API Documentation: `http://localhost:3001/api`

### 2. Frontend Deployment

```bash
cd frontend

# Build Docker image
docker build -t student-management-frontend .

# Run container
docker run -d \
  -p 80:80 \
  -e VITE_API_URL=http://your-backend-url:3001 \
  --name student-management-frontend \
  student-management-frontend
```

Frontend will be available at `http://localhost`

## Production Deployment

### Environment Variables

#### Backend (.env)

```env
NODE_ENV=production
PORT=3001
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=your_db_user
DB_PASSWORD=your_secure_password
DB_NAME=student_management
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://your-frontend-domain.com
STORAGE_TYPE=s3
STORAGE_PATH=your-s3-bucket
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
ENCRYPTION_KEY=your-32-character-encryption-key
```

#### Frontend (.env)

```env
VITE_API_URL=https://your-backend-api.com
```

### Database Setup

1. **Create PostgreSQL Database**

```sql
CREATE DATABASE student_management;
CREATE USER student_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE student_management TO student_user;
```

2. **Run Migrations**

```bash
cd backend
npm run migration:run
```

### SSL/TLS Configuration

For production, use a reverse proxy (nginx) with SSL:

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## Backup & Recovery

### Database Backup

```bash
# Daily backup script
pg_dump -U postgres student_management > backup_$(date +%Y%m%d).sql

# Restore
psql -U postgres student_management < backup_20240101.sql
```

### Automated Backups

Add to crontab:

```bash
0 2 * * * /path/to/backup-script.sh
```

## Monitoring

### Health Checks

- Backend: `GET http://localhost:3001/health`
- Frontend: `GET http://localhost/`

### Logs

```bash
# Backend logs
docker-compose logs -f backend

# Frontend logs
docker logs -f student-management-frontend
```

### Performance Monitoring

- Use tools like Prometheus + Grafana
- Monitor API response times
- Track database query performance
- Monitor WebSocket connections

## Security Checklist

- [ ] Change all default passwords
- [ ] Use strong JWT secret (min 32 chars)
- [ ] Enable HTTPS/TLS
- [ ] Configure CORS properly
- [ ] Set up firewall rules
- [ ] Enable database encryption at rest
- [ ] Use signed URLs for file access
- [ ] Regular security updates
- [ ] Enable audit logging
- [ ] Set up rate limiting

## Scaling

### Horizontal Scaling

1. **Backend**: Use load balancer (nginx/HAProxy)
2. **Database**: PostgreSQL replication (master-slave)
3. **WebSocket**: Use Redis adapter for Socket.IO

### Vertical Scaling

- Increase database connection pool
- Add more memory/CPU to containers
- Optimize database queries with indexes

## Maintenance

### Daily

- Check application logs
- Monitor error rates
- Verify backups completed

### Weekly

- Review audit logs
- Check database performance
- Update dependencies (if needed)

### Monthly

- Security updates
- Database optimization
- Review and clean old data

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check DB_HOST, DB_PORT, credentials
   - Verify PostgreSQL is running
   - Check firewall rules

2. **WebSocket Connection Failed**
   - Verify CORS settings
   - Check WebSocket gateway configuration
   - Ensure ports are open

3. **File Upload Issues**
   - Check storage configuration
   - Verify file permissions
   - Check disk space

## Support

For issues or questions, contact: **Yaniv Raz**

