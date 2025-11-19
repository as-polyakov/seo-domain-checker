# 🚀 Deployment Guide for DevOps

This guide provides step-by-step instructions for deploying the SEO Domain Checker backend using Docker.

## 📋 Prerequisites

- **Docker Engine** 20.10+ ([Install Docker](https://docs.docker.com/get-docker/))
- **Docker Compose** 2.0+ (included with Docker Desktop)
- **Git** (to clone the repository)
- **API Keys**:
  - Ahrefs API Token ([Get here](https://ahrefs.com/api))
  - SimilarWeb API Key ([Get here](https://account.similarweb.com/))

## 🎯 Quick Start (3 Steps)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd seo-domain-checker
```

### 2. Configure Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit with your favorite editor
nano .env
# or
vim .env
```

**Update these values in `.env`:**
```env
AHREFS_API_TOKEN=your_actual_ahrefs_token
SIMILAR_WEB_KEY=your_actual_similarweb_key
```

### 3. Start the Application

```bash
docker-compose up -d
```

**That's it!** The application will:
- ✅ Build the Docker image
- ✅ Create the database automatically
- ✅ Initialize all tables
- ✅ Start the API server
- ✅ Run health checks

### 4. Verify Deployment

```bash
# Check container status
docker-compose ps

# Test health endpoint
curl http://localhost:8000/health
# Expected: {"status":"healthy"}

# View API documentation
curl http://localhost:8000/
# or open in browser: http://localhost:8000/docs
```

## 📊 Accessing the Application

- **Backend API**: http://localhost:8000
- **API Documentation (Swagger)**: http://localhost:8000/docs
- **API Documentation (ReDoc)**: http://localhost:8000/redoc
- **Health Check**: http://localhost:8000/health

## 🔧 Common Operations

### View Logs

```bash
# Follow all logs
docker-compose logs -f

# Follow backend logs only
docker-compose logs -f backend

# View last 100 lines
docker-compose logs --tail=100 backend
```

### Restart the Application

```bash
docker-compose restart
```

### Stop the Application

```bash
docker-compose down
```

### Stop and Remove All Data (⚠️ Destructive)

```bash
docker-compose down -v
```

### Update the Application

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose up -d --build
```

### Access Container Shell

```bash
docker-compose exec backend bash
```

### Backup Database

```bash
# Create backup directory
mkdir -p backups

# Backup database
docker cp seo-backend:/app/ahrefs_data.db backups/ahrefs_data_$(date +%Y%m%d_%H%M%S).db
```

### Restore Database

```bash
# Stop the application
docker-compose down

# Restore database file
cp backups/ahrefs_data_YYYYMMDD_HHMMSS.db ahrefs_data.db

# Start the application
docker-compose up -d
```

## 🔐 Security Best Practices

### 1. Environment Variables

**Development:**
- Use `.env` file (already in `.gitignore`)

**Production:**
- Use Docker secrets:
  ```bash
  echo "your_token" | docker secret create ahrefs_token -
  ```
- Or use your orchestration platform's secret management (Kubernetes Secrets, AWS Secrets Manager, etc.)

### 2. Network Security

- The backend exposes port 8000 by default
- Use a reverse proxy (nginx, Traefik, Caddy) for SSL/TLS
- Configure firewall rules to restrict access

### 3. Container Security

- The container runs as non-root user (`appuser`)
- Only necessary ports are exposed
- Minimal base image (Python slim)

## 🌐 Production Deployment

### Using a Reverse Proxy (Recommended)

Example nginx configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Resource Limits

Add to `docker-compose.yml`:

```yaml
services:
  backend:
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
        reservations:
          cpus: '0.5'
          memory: 512M
```

### Log Rotation

Add to `docker-compose.yml`:

```yaml
services:
  backend:
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "5"
```

### High Availability

For production, consider:
- Multiple container instances behind a load balancer
- Shared database storage (NFS, EBS, etc.)
- Container orchestration (Kubernetes, Docker Swarm)

## 🐳 Kubernetes Deployment

### Basic Kubernetes Manifests

**1. Secret for API Keys:**

```yaml
apiVersion: v1
kind: Secret
metadata:
  name: seo-api-keys
type: Opaque
stringData:
  AHREFS_API_TOKEN: "your_token_here"
  SIMILAR_WEB_KEY: "your_key_here"
```

**2. Deployment:**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: seo-backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: seo-backend
  template:
    metadata:
      labels:
        app: seo-backend
    spec:
      containers:
      - name: backend
        image: seo-domain-checker-backend:latest
        ports:
        - containerPort: 8000
        envFrom:
        - secretRef:
            name: seo-api-keys
        volumeMounts:
        - name: data
          mountPath: /app/data
        livenessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 8000
          initialDelaySeconds: 5
          periodSeconds: 5
      volumes:
      - name: data
        persistentVolumeClaim:
          claimName: seo-data-pvc
```

**3. Service:**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: seo-backend
spec:
  selector:
    app: seo-backend
  ports:
  - port: 8000
    targetPort: 8000
  type: ClusterIP
```

## 🔍 Troubleshooting

### Container Won't Start

1. **Check logs:**
   ```bash
   docker-compose logs backend
   ```

2. **Verify environment variables:**
   ```bash
   docker-compose config
   ```

3. **Check if port is in use:**
   ```bash
   lsof -i :8000  # macOS/Linux
   netstat -ano | findstr :8000  # Windows
   ```

### Database Issues

1. **Check database file:**
   ```bash
   docker-compose exec backend ls -la /app/ahrefs_data.db
   ```

2. **Reinitialize database:**
   ```bash
   docker-compose down
   rm ahrefs_data.db
   docker-compose up -d
   ```

### API Keys Not Working

1. **Verify keys are loaded:**
   ```bash
   docker-compose exec backend printenv | grep -E 'AHREFS|SIMILAR'
   ```

2. **Check .env file format:**
   - No spaces around `=`
   - No quotes unless part of the key
   - No trailing whitespace

### Health Check Failing

1. **Test manually:**
   ```bash
   docker-compose exec backend curl http://localhost:8000/health
   ```

2. **Check if server is listening:**
   ```bash
   docker-compose exec backend netstat -tlnp | grep 8000
   ```

## 📈 Monitoring

### Container Metrics

```bash
# Real-time stats
docker stats seo-backend

# Resource usage
docker-compose ps
```

### Application Logs

```bash
# Application logs
docker-compose logs -f backend

# Error logs only
docker-compose logs backend 2>&1 | grep ERROR
```

### Health Monitoring

Set up monitoring with:
- **Prometheus** + **Grafana** for metrics
- **ELK Stack** for log aggregation
- **Uptime monitoring** (UptimeRobot, Pingdom, etc.)

Example Prometheus scrape config:

```yaml
scrape_configs:
  - job_name: 'seo-backend'
    static_configs:
      - targets: ['localhost:8000']
    metrics_path: '/metrics'
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy Backend

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Build Docker image
        run: docker build -t seo-backend:latest .
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push seo-backend:latest
      
      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          script: |
            cd /opt/seo-domain-checker
            docker-compose pull
            docker-compose up -d
```

## 📞 Support

For issues and questions:
- Check the [main README](README.md)
- Review [troubleshooting section](#-troubleshooting)
- Open an issue on GitHub

## 📝 Changelog

Track application updates and deployment notes in your version control system.

---

**Last Updated**: November 2025  
**Maintained by**: DevOps Team

