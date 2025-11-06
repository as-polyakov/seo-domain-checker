# AWS Deployment Guide - Verseo SEO Domain Checker

## Stack

- **Backend**: FastAPI (Python 3.13) + Uvicorn (Port 8000)
- **Frontend**: React + Vite + TypeScript (Port 3000)
- **Database**: SQLite (local file, migrations via Alembic)

---

### 1. Clone & Setup Project

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

### 2. Database Initialization

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
