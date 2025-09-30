# OfficeFood Deployment Guide

This guide covers deploying the OfficeFood SaaS application to production environments.

## 🚀 Quick Deployment with Docker

### Prerequisites

- Docker and Docker Compose installed
- Domain name configured (optional)
- SSL certificate (for HTTPS)

### 1. Environment Configuration

Create a production `.env` file:

```bash
# Database
DATABASE_URL="postgresql://username:password@your-db-host:5432/officefood_prod"

# JWT
JWT_SECRET="your-super-secure-jwt-secret-key-min-32-chars"
JWT_EXPIRES_IN="7d"

# OTP Service
OTP_EXPIRES_IN="300"
# Remove MOCK_OTP_CODE for production

# API Configuration
PORT=3001
NODE_ENV="production"

# Frontend
VITE_API_URL="https://your-domain.com/api/v1"

# Email Service (for OTP delivery)
SMTP_HOST="your-smtp-host"
SMTP_PORT="587"
SMTP_USER="your-smtp-username"
SMTP_PASS="your-smtp-password"

# File Upload
MAX_FILE_SIZE="10485760"
UPLOAD_PATH="./uploads"
```

### 2. Deploy with Docker Compose

```bash
# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Check status
docker-compose ps
```

### 3. Initialize Database

```bash
# Run migrations
docker-compose exec backend npx prisma db push

# Seed with initial data
docker-compose exec backend npx prisma db seed
```

## ☁️ Cloud Deployment Options

### AWS Deployment

#### Using AWS ECS with Fargate

1. **Create ECS Cluster**
   ```bash
   aws ecs create-cluster --cluster-name officefood-cluster
   ```

2. **Build and Push Images**
   ```bash
   # Build images
   docker build -t officefood-backend ./backend
   docker build -t officefood-frontend ./frontend
   
   # Tag for ECR
   docker tag officefood-backend:latest your-account.dkr.ecr.region.amazonaws.com/officefood-backend:latest
   docker tag officefood-frontend:latest your-account.dkr.ecr.region.amazonaws.com/officefood-frontend:latest
   
   # Push to ECR
   docker push your-account.dkr.ecr.region.amazonaws.com/officefood-backend:latest
   docker push your-account.dkr.ecr.region.amazonaws.com/officefood-frontend:latest
   ```

3. **Create Task Definitions**
   - Backend task definition
   - Frontend task definition
   - Database (RDS PostgreSQL)

4. **Create Services**
   - Backend service
   - Frontend service
   - Load balancer configuration

#### Using AWS App Runner

1. **Create App Runner Service**
   - Connect to GitHub repository
   - Configure build settings
   - Set environment variables

2. **Database Setup**
   - Use AWS RDS PostgreSQL
   - Configure security groups
   - Set up connection pooling

### Google Cloud Platform

#### Using Cloud Run

1. **Build and Deploy**
   ```bash
   # Build images
   gcloud builds submit --tag gcr.io/your-project/officefood-backend ./backend
   gcloud builds submit --tag gcr.io/your-project/officefood-frontend ./frontend
   
   # Deploy to Cloud Run
   gcloud run deploy officefood-backend --image gcr.io/your-project/officefood-backend
   gcloud run deploy officefood-frontend --image gcr.io/your-project/officefood-frontend
   ```

2. **Database Setup**
   - Use Cloud SQL PostgreSQL
   - Configure private IP
   - Set up connection pooling

### DigitalOcean

#### Using App Platform

1. **Create App**
   - Connect GitHub repository
   - Configure build settings
   - Set environment variables

2. **Database Setup**
   - Create managed PostgreSQL database
   - Configure connection string
   - Set up backups

## 🐳 Docker Production Configuration

### Production Dockerfile Optimizations

```dockerfile
# Multi-stage build for smaller images
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine AS production
WORKDIR /app
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
USER nestjs
EXPOSE 3001
CMD ["node", "dist/main"]
```

### Docker Compose Production

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: officefood_prod
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - officefood_network
    restart: unless-stopped

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    environment:
      DATABASE_URL: ${DATABASE_URL}
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      - postgres
    networks:
      - officefood_network
    restart: unless-stopped

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    environment:
      VITE_API_URL: ${VITE_API_URL}
    depends_on:
      - backend
    networks:
      - officefood_network
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    networks:
      - officefood_network
    restart: unless-stopped

volumes:
  postgres_data:

networks:
  officefood_network:
    driver: bridge
```

## 🔒 Security Configuration

### SSL/TLS Setup

1. **Obtain SSL Certificate**
   ```bash
   # Using Let's Encrypt
   certbot certonly --standalone -d your-domain.com
   ```

2. **Nginx SSL Configuration**
   ```nginx
   server {
       listen 443 ssl http2;
       server_name your-domain.com;
       
       ssl_certificate /etc/nginx/ssl/cert.pem;
       ssl_certificate_key /etc/nginx/ssl/key.pem;
       
       location / {
           proxy_pass http://frontend:80;
       }
       
       location /api/ {
           proxy_pass http://backend:3001/api/;
       }
   }
   ```

### Environment Security

- Use strong, unique passwords
- Rotate JWT secrets regularly
- Enable database encryption
- Use environment-specific configurations
- Implement rate limiting
- Enable CORS properly

## 📊 Monitoring and Logging

### Application Monitoring

1. **Health Checks**
   ```bash
   # Backend health check
   curl http://your-domain.com/api/v1/health
   
   # Database connectivity
   docker-compose exec backend npx prisma db push
   ```

2. **Log Management**
   ```bash
   # View application logs
   docker-compose logs -f backend
   docker-compose logs -f frontend
   
   # Log rotation
   docker-compose exec backend logrotate /etc/logrotate.conf
   ```

### Performance Monitoring

- Set up APM (Application Performance Monitoring)
- Monitor database performance
- Track API response times
- Monitor memory and CPU usage
- Set up alerts for critical metrics

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build and Deploy
        run: |
          docker-compose -f docker-compose.prod.yml build
          docker-compose -f docker-compose.prod.yml up -d
          
      - name: Run Migrations
        run: |
          docker-compose -f docker-compose.prod.yml exec backend npx prisma db push
          
      - name: Health Check
        run: |
          curl -f http://your-domain.com/api/v1/health || exit 1
```

## 🗄️ Database Management

### Backup Strategy

```bash
# Create backup
docker-compose exec postgres pg_dump -U officefood officefood_prod > backup.sql

# Restore backup
docker-compose exec -T postgres psql -U officefood officefood_prod < backup.sql
```

### Migration Strategy

```bash
# Run migrations
docker-compose exec backend npx prisma migrate deploy

# Rollback (if needed)
docker-compose exec backend npx prisma migrate reset
```

## 🚨 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   ```bash
   # Check database status
   docker-compose exec postgres pg_isready -U officefood
   
   # Check connection string
   echo $DATABASE_URL
   ```

2. **Application Won't Start**
   ```bash
   # Check logs
   docker-compose logs backend
   
   # Check environment variables
   docker-compose exec backend env
   ```

3. **Frontend Build Issues**
   ```bash
   # Check build logs
   docker-compose logs frontend
   
   # Rebuild frontend
   docker-compose build --no-cache frontend
   ```

### Performance Issues

- Check database query performance
- Monitor memory usage
- Optimize Docker images
- Use connection pooling
- Implement caching

## 📈 Scaling Considerations

### Horizontal Scaling

- Use load balancers
- Implement database read replicas
- Use Redis for session storage
- Implement microservices architecture

### Vertical Scaling

- Increase container resources
- Optimize database configuration
- Use CDN for static assets
- Implement caching strategies

## 🔧 Maintenance

### Regular Tasks

- Update dependencies
- Monitor security vulnerabilities
- Backup database regularly
- Review and rotate secrets
- Monitor performance metrics
- Update SSL certificates

### Updates and Patches

```bash
# Update application
git pull origin main
docker-compose build
docker-compose up -d

# Update dependencies
cd backend && npm update
cd ../frontend && npm update
```

---

For additional support, refer to the main README.md or create an issue in the repository.

