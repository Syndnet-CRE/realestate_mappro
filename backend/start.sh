#!/bin/bash
# Startup script for ScoutGPT Backend

echo "🚀 Starting ScoutGPT Real Estate RAG Platform Backend..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install dependencies
echo "📥 Installing dependencies..."
pip install -r requirements.txt

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp .env.example .env
    echo "✏️  Please edit .env with your API keys and configuration."
    echo "   nano .env"
    exit 1
fi

# Initialize database
echo "🗄️  Initializing database..."
python -m models.database

# Create uploads directory
mkdir -p uploads

# Start server
echo "🌐 Starting FastAPI server on http://localhost:8000"
echo "📖 API docs available at http://localhost:8000/docs"
echo ""
uvicorn main:app --reload --host 0.0.0.0 --port 8000
