#!/bin/bash

# SEO Domain Checker - Docker Setup Script
# This script helps you set up and run the backend in Docker

set -e

echo "🚀 SEO Domain Checker - Backend Docker Setup"
echo "============================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker is not installed!${NC}"
    echo "Please install Docker from: https://docs.docker.com/get-docker/"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose is not installed!${NC}"
    echo "Please install Docker Compose from: https://docs.docker.com/compose/install/"
    exit 1
fi

echo -e "${GREEN}✅ Docker is installed${NC}"
echo -e "${GREEN}✅ Docker Compose is installed${NC}"
echo ""

# Check if Docker daemon is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker daemon is not running!${NC}"
    echo "Please start Docker Desktop or the Docker daemon"
    exit 1
fi

echo -e "${GREEN}✅ Docker daemon is running${NC}"
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}📝 Creating .env file...${NC}"
    cat > .env << 'EOF'
# API Keys - REPLACE WITH YOUR ACTUAL KEYS!
AHREFS_API_TOKEN=your_ahrefs_api_token_here
SIMILAR_WEB_KEY=your_similarweb_api_key_here
EOF
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Edit the .env file and add your actual API keys!${NC}"
    echo "   You can edit it with: nano .env"
    echo ""
    read -p "Press Enter after you've updated the .env file..."
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Validate .env file
if grep -q "your_ahrefs_api_token_here" .env || grep -q "your_similarweb_api_key_here" .env; then
    echo ""
    echo -e "${YELLOW}⚠️  WARNING: Your .env file still contains placeholder values!${NC}"
    echo "   The application may not work correctly without valid API keys."
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled. Please update .env and run this script again."
        exit 1
    fi
fi

# Create necessary directories
echo ""
echo "📁 Creating directories..."
mkdir -p data logs backups
echo -e "${GREEN}✅ Directories created${NC}"

# Stop any existing containers
echo ""
echo "🛑 Stopping any existing containers..."
docker-compose down 2>/dev/null || true

# Build Docker images
echo ""
echo "🔨 Building Docker images (this may take a few minutes)..."
docker-compose build

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed! Check the error messages above.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Docker images built successfully${NC}"

# Start the containers
echo ""
echo "🚀 Starting containers..."
docker-compose up -d

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to start containers! Check the error messages above.${NC}"
    exit 1
fi

# Wait for services to be ready
echo ""
echo "⏳ Waiting for services to be ready..."
sleep 10

# Test backend health
echo ""
echo "🔍 Checking backend health..."
for i in {1..30}; do
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy!${NC}"
        BACKEND_OK=1
        break
    fi
    echo -n "."
    sleep 2
done

if [ -z "$BACKEND_OK" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  Backend health check timeout${NC}"
    echo "   Check logs with: docker-compose logs backend"
fi

# Final status
echo ""
echo "============================================="
if [ -n "$BACKEND_OK" ]; then
    echo -e "${GREEN}🎉 Setup complete! Backend is running!${NC}"
else
    echo -e "${YELLOW}⚠️  Setup complete but backend may not be healthy${NC}"
fi
echo "============================================="
echo ""
echo "📍 Access your backend:"
echo "   Backend API: http://localhost:8000"
echo "   API Docs:    http://localhost:8000/docs"
echo "   Health:      http://localhost:8000/health"
echo ""
echo "📊 Useful commands:"
echo "   docker-compose ps              # View container status"
echo "   docker-compose logs -f backend # View backend logs"
echo "   docker-compose down            # Stop backend"
echo "   docker-compose restart         # Restart backend"
echo "   docker-compose exec backend bash # Access container shell"
echo ""
echo "🔧 Troubleshooting:"
echo "   If backend isn't working, check logs:"
echo "   docker-compose logs backend"
echo ""
echo "💡 Frontend:"
echo "   Run frontend locally with: cd frontend && npm run dev"
echo "   Frontend will connect to backend at http://localhost:8000"
echo ""
