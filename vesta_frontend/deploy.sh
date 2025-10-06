#!/bin/bash

# VESTA Frontend Deployment Script for Netlify
# This script prepares the frontend for Netlify deployment

echo "🚀 Starting VESTA Frontend deployment for Netlify..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18 or higher."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

echo "✅ Dependencies installed successfully"

# Build the application
echo "🔨 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Application built successfully"

# Export static files
echo "📤 Exporting static files..."
npm run export

if [ $? -ne 0 ]; then
    echo "❌ Static export failed"
    exit 1
fi

echo "✅ Static files exported successfully"

# Check if out directory exists
if [ ! -d "out" ]; then
    echo "❌ 'out' directory not found. Export may have failed."
    exit 1
fi

echo "🎉 Deployment preparation complete!"
echo ""
echo "📋 Next steps for Netlify deployment:"
echo "1. Push this code to your Git repository"
echo "2. Connect the repository to Netlify"
echo "3. Configure Netlify settings:"
echo "   - Build command: npm run build && npm run export"
echo "   - Publish directory: out"
echo "   - Node version: 18"
echo ""
echo "🌐 Your VESTA frontend will be ready for deployment!"