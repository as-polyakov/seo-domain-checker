# AWS Deployment Guide - Verseo SEO Domain Checker

## Stack

- **Backend**: FastAPI (Python 3.13) + Uvicorn (Port 8000)
- **Frontend**: React + Vite + TypeScript (Port 3000)
- **Database**: SQLite (local file, migrations via Alembic)

---

## EC2 Instance Setup

### 1. Initial Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.13
sudo apt install python3.13 python3.13-venv python3-pip -y

# Install Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install nodejs -y

# Install Git
sudo apt install git -y
```

### 2. Clone & Setup Project

```bash
# Clone repository
git clone <repository-url> /opt/verseo
cd /opt/verseo

# Backend setup
python3.13 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend setup
cd frontend
npm install
npm run build
cd ..
```

### 3. Database Initialization

```bash
# Database will auto-initialize on first backend run via Alembic migrations
# File location: /opt/verseo/ahrefs_data.db
```

---

## Production Deployment

### Backend (Systemd Service)

**File: `/etc/systemd/system/verseo-backend.service`**

```ini
[Unit]
Description=Verseo SEO Backend API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=/opt/verseo
Environment="PATH=/opt/verseo/venv/bin"
ExecStart=/opt/verseo/venv/bin/python api_server.py
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
```

**Enable & Start:**

```bash
sudo systemctl daemon-reload
sudo systemctl enable verseo-backend
sudo systemctl start verseo-backend
sudo systemctl status verseo-backend
```

---

### Frontend (Nginx)

**Install Nginx:**

```bash
sudo apt install nginx -y
```

**File: `/etc/nginx/sites-available/verseo`**

```nginx
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        root /opt/verseo/frontend/dist;
        try_files $uri /index.html;
    }

    # Backend API proxy
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Direct backend proxy (for compatibility)
    location ~ ^/(analyses|health) {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
    }
}
```

**Enable site:**

```bash
sudo ln -s /etc/nginx/sites-available/verseo /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Security Groups (AWS)

**Inbound Rules:**

- Port 80 (HTTP) - 0.0.0.0/0
- Port 443 (HTTPS) - 0.0.0.0/0
- Port 22 (SSH) - Your IP only

**Note:** Ports 3000 and 8000 should NOT be exposed directly. Nginx handles all traffic.

---

## Monitoring & Logs

```bash
# Backend logs
sudo journalctl -u verseo-backend -f

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# Backend application log
tail -f /opt/verseo/backend.log
```

---

## Quick Commands

```bash
# Restart backend
sudo systemctl restart verseo-backend

# Rebuild frontend after changes
cd /opt/verseo/frontend
npm run build
sudo systemctl reload nginx

# Check backend health
curl http://localhost:8000/health

# Database backup
cp /opt/verseo/ahrefs_data.db /opt/verseo/backups/ahrefs_data_$(date +%Y%m%d).db
```

---

## Development Mode (Optional)

For testing on EC2:

```bash
cd /opt/verseo

# Backend (terminal 1)
source venv/bin/activate
python api_server.py

# Frontend dev server (terminal 2)
cd frontend
npm run dev
```

Frontend: http://<ec2-ip>:3000  
Backend API: http://<ec2-ip>:8000

---

## Notes

- Frontend automatically detects API URL based on hostname (uses port 8000)
- SQLite database is file-based, suitable for small-medium traffic
- For high traffic, consider migrating to PostgreSQL/RDS
- No environment variables currently required
- Alembic handles database schema migrations automatically
