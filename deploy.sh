#!/bin/bash

# Job Application Bot - Deployment Script
# This script helps deploy the application to various platforms

set -e

echo "🚀 Job Application Bot - Deployment Script"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f .env ]; then
    print_error ".env file not found!"
    print_info "Please create a .env file with required environment variables."
    print_info "See DEPLOYMENT.md for details."
    exit 1
fi

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check Node.js version
if ! command_exists node; then
    print_error "Node.js is not installed!"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 22 ]; then
    print_error "Node.js version 22 or higher is required!"
    print_info "Current version: $(node -v)"
    exit 1
fi

# Check pnpm
if ! command_exists pnpm; then
    print_error "pnpm is not installed!"
    print_info "Install with: npm install -g pnpm"
    exit 1
fi

# Deployment target selection
echo ""
echo "Select deployment target:"
echo "1) Local (Development)"
echo "2) Local (Production)"
echo "3) Docker"
echo "4) Railway"
echo "5) Render"
echo "6) Manus Hosting"
echo ""
read -p "Enter choice [1-6]: " choice

case $choice in
    1)
        print_info "Starting local development server..."
        pnpm install
        pnpm db:push
        pnpm dev
        ;;
    
    2)
        print_info "Building for local production..."
        pnpm install --frozen-lockfile
        pnpm db:push
        pnpm build
        
        print_info "Starting production server..."
        print_warning "Make sure to set NODE_ENV=production in your .env file"
        pnpm start
        ;;
    
    3)
        print_info "Building Docker image..."
        
        if ! command_exists docker; then
            print_error "Docker is not installed!"
            exit 1
        fi
        
        docker-compose build
        print_info "Starting Docker containers..."
        docker-compose up -d
        
        print_info "Waiting for services to start..."
        sleep 5
        
        print_info "Running database migrations..."
        docker-compose exec app pnpm db:push
        
        print_info "Deployment complete!"
        print_info "Application running at: http://localhost:3000"
        print_info "View logs with: docker-compose logs -f"
        ;;
    
    4)
        print_info "Deploying to Railway..."
        
        if ! command_exists railway; then
            print_error "Railway CLI is not installed!"
            print_info "Install with: npm install -g @railway/cli"
            exit 1
        fi
        
        print_info "Building application..."
        pnpm install --frozen-lockfile
        pnpm build
        
        print_info "Deploying to Railway..."
        railway up
        
        print_info "Running database migrations..."
        railway run pnpm db:push
        
        print_info "Deployment complete!"
        ;;
    
    5)
        print_info "Deploying to Render..."
        
        print_warning "Render deployment requires:"
        print_info "1. Connected GitHub repository"
        print_info "2. Render service configured"
        print_info "3. Environment variables set in Render dashboard"
        print_info ""
        print_info "Push your code to trigger deployment:"
        echo "  git add ."
        echo "  git commit -m 'Deploy to Render'"
        echo "  git push origin main"
        ;;
    
    6)
        print_info "Deploying to Manus Hosting..."
        
        print_warning "Manus deployment requires:"
        print_info "1. Manus account and project"
        print_info "2. Create checkpoint via Manus UI"
        print_info "3. Click 'Publish' button in Management UI"
        print_info ""
        print_info "Visit: https://manus.im to deploy"
        ;;
    
    *)
        print_error "Invalid choice!"
        exit 1
        ;;
esac

echo ""
print_info "Deployment script completed!"
