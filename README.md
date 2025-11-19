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

### Prerequisites

- Python 3.8 or higher
- Node.js 18 or higher
- npm or yarn
- Docker & Docker Compose (optional, for containerized deployment)

### How to Use

#### 1. Set Environment Variables

Before starting, copy `.env.example` to `.env` and fill in the required API keys:

```sh
cp .env.example .env
# Edit .env and provide values for AHREFS_API_TOKEN and SIMILAR_WEB_KEY
```

#### 2. Start the Backend (Docker)

Launch the backend server in detached mode:

```sh
docker-compose up -d
```

- Backend API accessible at: [http://localhost:8000](http://localhost:8000)
- API documentation at: [http://localhost:8000/docs](http://localhost:8000/docs)

#### 3. Start the Frontend

In another terminal, navigate to the frontend folder and run:

```sh
cd frontend
npm install        # Only required on first run
npm run dev
```

- Frontend app available at: [http://localhost:3000](http://localhost:3000)

#### 4. View Logs

Monitor backend logs (for debugging or monitoring):

```sh
docker-compose logs -f backend
```

#### 5. Stopping the Backend

To stop all Docker services:

```sh
docker-compose down
```

**Note:**

- Ensure you have provided valid API keys in your `.env` for full functionality.
- You may customize port bindings in `docker-compose.yml` if defaults (8000 for backend, 3000 for frontend) are in use by other applications.
