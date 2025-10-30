# Domain Evaluation Tool

This repository contains an experimental tool for evaluating domain suitability
for article publishing. It was independently developed by **Anton Polyakov**
as a personal side project.

During its development, a **temporary trial API key** was kindly provided by
ahrefs Inc. in a partnership with Universe Group Inc. for evaluation purposes. In appreciation of that support, the
source code is made publicly available under a **non-commercial license**.

## License and Usage

- Licensed under **MIT License with Commons Clause Restriction**.
- **Commercial use, resale, or SaaS deployment is strictly prohibited**
  without written permission from the author.
- You may freely review, modify, or use this tool for internal or research
  purposes.

## Authorship and Acknowledgments

- **Primary developer**: Anton Polyakov  
- **Concept origin**: inspired by discussions with Natalya Oger  
- **No employment or contractual relationship** existed between the author and Universe Group or
  any other company during development.

## Disclaimer

This tool is provided for demonstration and research purposes only. It is not
an official or supported product of [Company Name] or any affiliated entity.


## 🚀 Features

- **Domain Analysis** - Comprehensive SEO metrics including DR, organic traffic, backlinks
- **Advanced Filtering** - Filter by status, topic, country, price range, DR, and more
- **Multi-Criteria Scoring** - Safety, authority, relevance, and commercial scores
- **Keyboard Shortcuts** - Quick actions for efficient workflow
- **Dark Mode** - Toggle between light and dark themes
- **Data Visualization** - Traffic history sparklines and metric indicators
- **Preview Sidebar** - Quick evidence preview with anchors, backlinks, and keywords
- **Batch Operations** - Select and update multiple domains at once

## 🚀 Quick Start

### Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn

### Option 1: Using Startup Scripts (Recommended)

#### On macOS/Linux:
```bash
./start-dev.sh
```

#### On Windows:
```cmd
start-dev.bat
```

This will:
1. Create Python virtual environment (if needed)
2. Install Python dependencies
3. Install Node.js dependencies
4. Start the backend on http://localhost:8000
5. Start the frontend on http://localhost:3000

### Option 2: Manual Setup

#### Backend Setup

1. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Start the backend:
```bash
python main.py
```

#### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser to http://localhost:3000

## ⌨️ Keyboard Shortcuts

When domains are selected:
- **A** - Mark as OK
- **S** - Mark for Review
- **D** - Mark as Reject
- **O** - Open/collapse details

## 🔧 Configuration

### Backend Configuration

Edit `main.py` to configure:
- Database connection
- API endpoints
- Port settings

### Frontend Configuration

Edit `frontend/vite.config.ts` to configure:
- API proxy settings
- Port settings
- Build options

## 📊 Database

The application uses SQLite with Alembic for migrations.

### Run Migrations

```bash
alembic upgrade head
```

### Create New Migration

```bash
alembic revision -m "description"
```

## 🏗️ Building for Production

### Build Frontend

```bash
cd frontend
npm run build
```

The built files will be in `frontend/dist/`.

### Production Deployment

1. Build the frontend
2. Serve static files from `frontend/dist/`
3. Run the Python backend with a production WSGI server (e.g., Gunicorn)

## 📝 Development

### Frontend Development

The frontend uses hot module replacement (HMR) for instant updates during development.

```bash
cd frontend
npm run dev
```

### Backend Development

The backend will need to be restarted after code changes.

```bash
python main.py
```

## 🧪 Testing

### Frontend Tests
```bash
cd frontend
npm run test
```

### Backend Tests
```bash
pytest tests/
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is released under the MIT License with Commons Clause Restriction (non-commercial use only).
See the LICENSE file for details.

## 🔗 Useful Links

- **API Documentation**: [api/README.md](api/README.md)
- **API Integration Guide**: [API_INTEGRATION.md](API_INTEGRATION.md)
- **Frontend README**: [frontend/README.md](frontend/README.md)
- **Frontend Features**: [frontend/FEATURES.md](frontend/FEATURES.md)
- **Database Schema**: [ddl/001-initial-schema.sql](ddl/001-initial-schema.sql)
- **Interactive API Docs**: http://localhost:8000/docs (when server is running)
- **Rules Documentation**: [rules/](rules/)

## 🆘 Troubleshooting

### Port Already in Use

If port 3000 or 8000 is already in use:
- Change the frontend port in `frontend/vite.config.ts`
- Change the backend port in `main.py`

### Dependencies Not Installing

- Ensure Python 3.8+ is installed: `python --version`
- Ensure Node.js 18+ is installed: `node --version`
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and reinstall: `rm -rf frontend/node_modules && cd frontend && npm install`

### Database Issues

- Delete `ahrefs_data.db` and run migrations again
- Check database permissions

## 📞 Support

For issues and questions, please open an issue on GitHub.
