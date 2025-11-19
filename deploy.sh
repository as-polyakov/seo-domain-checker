#!/bin/bash
# Quick deployment script for SEO Domain Checker
# Usage: ./deploy.sh

set -e

echo "🚀 SEO Domain Checker - Quick Deploy"
echo "====================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
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

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found${NC}"
    
    if [ -f .env.example ]; then
        echo "📝 Creating .env from .env.example..."
        cp .env.example .env
        echo -e "${GREEN}✅ Created .env file${NC}"
        echo ""
        echo -e "${YELLOW}⚠️  IMPORTANT: Edit .env and add your API keys!${NC}"
        echo "   Required keys:"
        echo "   - AHREFS_API_TOKEN"
        echo "   - SIMILAR_WEB_KEY"
        echo ""
        read -p "Press Enter after you've updated the .env file..."
    else
        echo -e "${RED}❌ .env.example not found!${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ .env file exists${NC}"
fi

# Check if API keys are configured
if grep -q "your_ahrefs_api_token_here" .env || grep -q "your_similarweb_api_key_here" .env; then
    echo ""
    echo -e "${YELLOW}⚠️  WARNING: .env file contains placeholder values!${NC}"
    echo "   The application may not work without valid API keys."
    echo ""
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Deployment cancelled. Please update .env with valid API keys."
        exit 1
    fi
fi

echo ""
echo "🔨 Building and starting containers..."
docker-compose up -d --build

echo ""
echo "⏳ Waiting for backend to be ready..."
sleep 5

# Wait for health check
for i in {1..30}; do
    if curl -f http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is healthy!${NC}"
        BACKEND_OK=1
        break
    fi
    echo -n "."
    sleep 2
done

echo ""
if [ -z "$BACKEND_OK" ]; then
    echo -e "${YELLOW}⚠️  Backend health check timeout${NC}"
    echo "   Check logs with: docker-compose logs backend"
else
    echo ""
    echo "======================================"
    echo -e "${GREEN}🎉 Deployment Complete!${NC}"
    echo "======================================"
    echo ""
    echo "📍 Access your application:"
    echo "   Backend API:  http://localhost:8000"
    echo "   API Docs:     http://localhost:8000/docs"
    echo "   Health Check: http://localhost:8000/health"
    echo ""
    echo "📊 Useful commands:"
    echo "   docker-compose ps              # Check status"
    echo "   docker-compose logs -f backend # View logs"
    echo "   docker-compose down            # Stop services"
    echo "   docker-compose restart         # Restart services"
    echo ""
fi

