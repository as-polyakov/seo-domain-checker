# Domain Evaluation Tool

This repository contains an experimental tool for evaluating domain suitability
for article publishing. It was independently developed by **Anton Polyakov**
as a personal side project.

The source code is made publicly available under a **non-commercial license**.

## License and Usage

- Licensed under **MIT License with Commons Clause Restriction**.
- **Commercial use, resale, or SaaS deployment is strictly prohibited**
  without written permission from the author.
- You may freely review, modify, or use this tool for internal or research
  purposes.

## Authorship and Acknowledgments

- **Primary developer**: Anton Polyakov
- **Concept origin**: inspired by discussions with Nataliia Oher
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

### For DevOps / Production Deployment

**See [DEPLOYMENT.md](DEPLOYMENT.md) for comprehensive deployment guide.**

Quick start:

```bash
cp .env.example .env
# Edit .env with your API keys
docker-compose up -d
```

### For Local Development

#### Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn
- Docker & Docker Compose

#### 1. Set Environment Variables

```bash
cp .env.example .env
# Edit .env and add your API keys:
# - AHREFS_API_TOKEN
# - SIMILAR_WEB_KEY
```

#### 2. Start the Backend (Docker)

```bash
docker-compose up -d
```

The backend will automatically:

- ✅ Initialize the database
- ✅ Create all tables
- ✅ Start the API server

Access:

- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

#### 3. Start the Frontend

```bash
cd frontend
npm install  # First time only
npm run dev
```

Access: http://localhost:3000

#### 4. Useful Commands

```bash
# View backend logs
docker-compose logs -f backend

# Stop backend
docker-compose down

# Restart backend
docker-compose restart

# Check status
docker-compose ps
```
