# Setup Guide

## Quick Start

### 1. First Time Setup

Run the appropriate startup script for your operating system:

**macOS/Linux:**
```bash
./start-dev.sh
```

**Windows:**
```cmd
start-dev.bat
```

The script will automatically:
- ✅ Create Python virtual environment
- ✅ Install all Python dependencies
- ✅ Install all Node.js dependencies  
- ✅ Start backend server on port 8000
- ✅ Start frontend dev server on port 3000

### 2. Access the Application

Once both servers are running:

- **Frontend UI:** http://localhost:3000
- **Backend API:** http://localhost:8000

## Manual Setup

If you prefer to set up components individually:

### Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate it
source venv/bin/activate  # macOS/Linux
# or
venv\Scripts\activate     # Windows

# Install dependencies
pip install -r requirements.txt

# Run backend
python main.py
```

### Frontend Setup

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

## Verification Checklist

After setup, verify everything is working:

- [ ] Backend runs on http://localhost:8000
- [ ] Frontend runs on http://localhost:3000
- [ ] No console errors in browser
- [ ] Can see the Verseo UI with mock domain data
- [ ] Filters and search work
- [ ] Preview sidebar opens when clicking "Open" button
- [ ] Dark mode toggle works

## Common Issues

### Issue: Port Already in Use

**Solution:** Kill the process using the port or change the port number.

```bash
# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9

# Kill process on port 8000 (backend)
lsof -ti:8000 | xargs kill -9
```

On Windows:
```cmd
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Issue: Python Dependencies Fail

**Solution:** Upgrade pip and try again.

```bash
pip install --upgrade pip
pip install -r requirements.txt
```

### Issue: Node Modules Installation Fails

**Solution:** Clear cache and reinstall.

```bash
cd frontend
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### Issue: Module Not Found Errors

**Solution:** Ensure virtual environment is activated.

```bash
# You should see (venv) in your terminal prompt
source venv/bin/activate  # macOS/Linux
venv\Scripts\activate     # Windows
```

## Development Workflow

### Starting Development

1. Pull latest changes: `git pull`
2. Activate virtual environment: `source venv/bin/activate`
3. Update dependencies if needed:
   - Backend: `pip install -r requirements.txt`
   - Frontend: `cd frontend && npm install`
4. Run startup script: `./start-dev.sh` or `start-dev.bat`

### Making Changes

**Frontend Changes:**
- Edit files in `frontend/src/`
- Changes hot-reload automatically
- Check browser console for errors

**Backend Changes:**
- Edit Python files
- Restart backend server manually (Ctrl+C then run again)
- Check terminal for errors

### Stopping Services

**Unix/macOS:** Press `Ctrl+C` in the terminal running the startup script

**Windows:** Close the command windows running backend and frontend

## Production Build

### Build Frontend

```bash
cd frontend
npm run build
```

Output will be in `frontend/dist/`

### Run Production Build Locally

```bash
cd frontend
npm run preview
```

This serves the production build on port 4173 for testing.

## Database

### Initialize Database

```bash
# Run migrations
alembic upgrade head
```

### Reset Database

```bash
# Remove database file
rm ahrefs_data.db

# Run migrations again
alembic upgrade head
```

## Environment Variables

Create a `.env` file in the root directory for environment-specific configuration:

```env
# Backend
DATABASE_URL=sqlite:///ahrefs_data.db
API_PORT=8000

# Frontend (create frontend/.env)
VITE_API_URL=http://localhost:8000
```

## Next Steps

After successful setup:

1. ✅ Explore the UI and test all features
2. ✅ Review the code structure
3. ✅ Familiarize yourself with keyboard shortcuts
4. ✅ Check out the rules engine in `rules/`
5. ✅ Understand the data model in `db/`

## Getting Help

- Check the main [README.md](README.md) for more information
- Review frontend docs in [frontend/README.md](frontend/README.md)
- Check error messages in terminal and browser console
- Review component code for inline documentation

