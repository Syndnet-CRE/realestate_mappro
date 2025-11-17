#!/bin/bash

echo "🚀 ScoutGPT Backend Setup Script"
echo "================================"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if Python 3.11+ is installed
echo -e "\n${YELLOW}Checking Python version...${NC}"
python_version=$(python3 --version 2>&1 | awk '{print $2}')
required_version="3.11"

if [ "$(printf '%s\n' "$required_version" "$python_version" | sort -V | head -n1)" != "$required_version" ]; then
    echo -e "${RED}Error: Python 3.11+ is required. You have $python_version${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python $python_version found${NC}"

# Create virtual environment
echo -e "\n${YELLOW}Creating virtual environment...${NC}"
python3 -m venv venv
echo -e "${GREEN}✓ Virtual environment created${NC}"

# Activate virtual environment
echo -e "\n${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate
echo -e "${GREEN}✓ Virtual environment activated${NC}"

# Install dependencies
echo -e "\n${YELLOW}Installing Python dependencies...${NC}"
pip install --upgrade pip
pip install -r requirements.txt
echo -e "${GREEN}✓ Dependencies installed${NC}"

# Copy .env file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "\n${YELLOW}Creating .env file from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env file created${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env with your API keys and database credentials${NC}"
else
    echo -e "\n${GREEN}✓ .env file already exists${NC}"
fi

# Check if Docker is installed
if command -v docker &> /dev/null; then
    echo -e "\n${YELLOW}Docker detected. Would you like to start PostgreSQL and Redis with Docker? (y/n)${NC}"
    read -r start_docker

    if [ "$start_docker" = "y" ]; then
        echo -e "\n${YELLOW}Starting PostgreSQL and Redis containers...${NC}"
        docker-compose up -d postgres redis
        echo -e "${GREEN}✓ Database services started${NC}"

        # Wait for PostgreSQL to be ready
        echo -e "\n${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
        sleep 5

        # Install pgvector extension
        echo -e "\n${YELLOW}Installing pgvector extension...${NC}"
        docker exec scoutgpt_postgres psql -U postgres -d scoutgpt -c "CREATE EXTENSION IF NOT EXISTS vector;"
        echo -e "${GREEN}✓ pgvector extension installed${NC}"
    fi
else
    echo -e "\n${YELLOW}⚠️  Docker not found. Please install PostgreSQL and Redis manually.${NC}"
fi

# Initialize Alembic migrations
echo -e "\n${YELLOW}Would you like to run database migrations? (y/n)${NC}"
read -r run_migrations

if [ "$run_migrations" = "y" ]; then
    echo -e "\n${YELLOW}Initializing Alembic migrations...${NC}"
    alembic init alembic 2>/dev/null || echo "Alembic already initialized"

    echo -e "\n${YELLOW}Running migrations...${NC}"
    alembic upgrade head
    echo -e "${GREEN}✓ Database migrations completed${NC}"
fi

# Print next steps
echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}🎉 Setup Complete!${NC}"
echo -e "${GREEN}================================${NC}"
echo -e "\nNext steps:"
echo -e "1. Edit ${YELLOW}.env${NC} file with your API keys"
echo -e "2. Start the API server:"
echo -e "   ${YELLOW}source venv/bin/activate${NC}"
echo -e "   ${YELLOW}uvicorn app.main:app --reload --port 8000${NC}"
echo -e "3. Visit ${YELLOW}http://localhost:8000/docs${NC} for API documentation"
echo -e "\nOptional:"
echo -e "- Start Celery worker: ${YELLOW}celery -A app.tasks.celery_app worker --loglevel=info${NC}"
echo -e "- Run tests: ${YELLOW}pytest${NC}"
echo -e "\nFor help, see ${YELLOW}README.md${NC}"
