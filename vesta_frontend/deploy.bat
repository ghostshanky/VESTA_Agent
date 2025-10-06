@echo off
REM VESTA Frontend Deployment Script for Netlify (Windows)
REM This script prepares the frontend for Netlify deployment

echo 🚀 Starting VESTA Frontend deployment for Netlify...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18 or higher.
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm.
    pause
    exit /b 1
)

echo ✅ Node.js and npm are installed

REM Install dependencies
echo 📦 Installing dependencies...
npm install
if %errorlevel% neq 0 (
    echo ❌ Failed to install dependencies
    pause
    exit /b 1
)

echo ✅ Dependencies installed successfully

REM Build the application
echo 🔨 Building the application...
npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed
    pause
    exit /b 1
)

echo ✅ Application built successfully

REM Export static files
echo 📤 Exporting static files...
npm run export
if %errorlevel% neq 0 (
    echo ❌ Static export failed
    pause
    exit /b 1
)

echo ✅ Static files exported successfully

REM Check if out directory exists
if not exist "out" (
    echo ❌ 'out' directory not found. Export may have failed.
    pause
    exit /b 1
)

echo 🎉 Deployment preparation complete!
echo.
echo 📋 Next steps for Netlify deployment:
echo 1. Push this code to your Git repository
echo 2. Connect the repository to Netlify
echo 3. Configure Netlify settings:
echo    - Build command: npm run build ^&^& npm run export
echo    - Publish directory: out
echo    - Node version: 18
echo.
echo 🌐 Your VESTA frontend will be ready for deployment!
pause