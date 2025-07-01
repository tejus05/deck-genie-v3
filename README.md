# Deck Genie - AI-Powered Presentation Generator

A modern web application that generates professional presentations using AI. Built with Next.js frontend and FastAPI backend.

## 📋 Table of Contents

- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Environment Configuration](#environment-configuration)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [API Keys Setup](#api-keys-setup)
- [Troubleshooting](#troubleshooting)

## 🔧 Prerequisites

Make sure you have the following installed on your system:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://python.org/)
- **pnpm** (Package manager) - [Installation Guide](https://pnpm.io/installation)
- **Git** - [Download](https://git-scm.com/)

### Install pnpm globally:
```bash
npm install -g pnpm
```

## 🚀 Installation

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd deck-genie-v3
```

### 2. Install All Dependencies
```bash
# Install root dependencies and both frontend/backend dependencies
pnpm run setup
```

**Or install manually:**
```bash
# Install root dependencies
pnpm install

# Install frontend dependencies
cd frontend
pnpm install
cd ..

# Install backend dependencies (Python)
cd backend
pip install -r requirements.txt
cd ..
```

## 🗄️ Database Setup

This project uses **NeonDB (PostgreSQL)** as the database for production and team collaboration.

### Option 1: Use NeonDB (Recommended for Teams)

#### 1. Create a NeonDB Account
1. Go to [neon.tech](https://neon.tech)
2. Sign up for a free account
3. Create a new project
4. Copy your connection string

#### 2. Configure Database URL
Add your NeonDB connection string to `backend/.env`:

```env
# Replace with your actual NeonDB connection string
DATABASE_URL=postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/neondb?sslmode=require
```

#### 3. Initialize Database
```bash
# Navigate to backend directory
cd backend

# Install Python dependencies (includes PostgreSQL drivers)
pip install -r requirements.txt

# Initialize the database tables
python init_db.py
```

#### 4. Migrate Existing Data (if you have SQLite data)
```bash
# Migrate data from existing SQLite database
python migrate_data.py
```

### Option 2: Use Local SQLite (Development Only)

If you prefer to use SQLite for local development:

```env
# For local development only
DATABASE_URL=sqlite:///./auth_database.db
```

**Note**: SQLite is not recommended for team collaboration as the database file would need to be shared manually.

### Database Schema

The application automatically creates these tables:
- **users** - User authentication and profiles
- **presentations** - Generated presentation metadata  
- **userfiles** - Uploaded files and assets

### Team Collaboration

**For team members:**
1. **Get the NeonDB connection string** from your team lead
2. **Add it to your `.env` file** in the backend directory
3. **Run the initialization script**: `python init_db.py`
4. **No manual database setup needed** - tables are created automatically

## ⚙️ Environment Configuration

### 1. Backend Environment Setup
Create a `.env` file in the `backend/` directory:

```bash
cd backend
cp .env.example .env  # If .env.example exists, or create manually
```

Add the following configuration to `backend/.env`:

```env
# Database Configuration (NeonDB)
DATABASE_URL=postgresql://your_username:your_password@your_host/neondb?sslmode=require&channel_binding=require

# Application Configuration
APP_DATA_DIRECTORY=./data

# JWT Configuration
SECRET_KEY=your-secret-key-here-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Google Gemini AI API Key (REQUIRED for PPT generation)
GOOGLE_API_KEY=your-google-api-key-here

# Google OAuth Configuration (REQUIRED for Google Sign-in)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FRONTEND_URL=http://localhost:3000
BACKEND_URL=http://localhost:8000

# Unsplash API Key (REQUIRED for image search)
UNSPLASH_API_KEY=your-unsplash-api-key

# LLM Configuration
LLM=google

# Presentation Configuration
PRESENTATION_CLEANUP_HOURS=24
```

### 2. Frontend Environment Setup
Create a `.env.local` file in the `frontend/` directory:

```bash
cd frontend
```

Add the following to `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-here
```

## 🔑 API Keys Setup

You'll need to obtain the following API keys:

### 1. Google Gemini AI API Key
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add it to `GOOGLE_API_KEY` in your `.env` file

### 2. Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 Client IDs
3. Add authorized redirect URIs: `http://localhost:3000/api/auth/callback/google`
4. Add the Client ID and Secret to your `.env` file

### 3. Unsplash API Key
1. Go to [Unsplash Developers](https://unsplash.com/developers)
2. Create a new application
3. Add the Access Key to `UNSPLASH_API_KEY` in your `.env` file

## 🏃‍♂️ Running the Application

### Development Mode

#### Option 1: Run Both Frontend and Backend Together
```bash
# Run both frontend and backend concurrently
pnpm run dev
```

#### Option 2: Run Separately
```bash
# Terminal 1 - Backend
pnpm run dev:backend

# Terminal 2 - Frontend  
pnpm run dev:frontend
```

### Production Mode

#### Build the Application
```bash
# Build frontend for production
pnpm run build
```

#### Start Production Server
```bash
# Start both frontend and backend in production mode
pnpm run start
```

### Access the Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 📁 Project Structure

```
deck-genie-v3/
├── backend/                 # FastAPI backend
│   ├── api/                # API routes and handlers
│   ├── auth/               # Authentication logic
│   ├── data/               # Application data storage
│   ├── ppt_generator/      # PowerPoint generation logic
│   ├── requirements.txt    # Python dependencies
│   ├── server.py          # Main server file
│   └── .env               # Backend environment variables
├── frontend/               # Next.js frontend
│   ├── app/               # Next.js app directory
│   ├── components/        # Reusable UI components
│   ├── public/            # Static assets
│   ├── package.json       # Frontend dependencies
│   └── .env.local         # Frontend environment variables
├── scripts/               # Build and development scripts
├── package.json           # Root package.json
└── README.md             # This file
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Database Issues
```bash
# If database is locked or corrupted
rm backend/auth_database.db
pnpm run dev:backend  # Will recreate the database
```

#### 2. Port Already in Use
```bash
# Kill processes using the ports
# Windows:
netstat -ano | findstr :3000
netstat -ano | findstr :8000
taskkill /PID <process_id> /F

# macOS/Linux:
lsof -ti:3000 | xargs kill -9
lsof -ti:8000 | xargs kill -9
```

#### 3. Build Errors
```bash
# Clear Next.js cache
cd frontend
rm -rf .next
pnpm build
```

#### 4. Python Package Issues
```bash
# Reinstall Python packages
cd backend
pip install --upgrade pip
pip install -r requirements.txt --force-reinstall
```

#### 5. Node Modules Issues
```bash
# Clear and reinstall node modules
cd frontend
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Environment Variables Checklist

Make sure all required environment variables are set:

**Backend (.env):**
- ✅ `DATABASE_URL`
- ✅ `SECRET_KEY`
- ✅ `GOOGLE_API_KEY`
- ✅ `GOOGLE_CLIENT_ID`
- ✅ `GOOGLE_CLIENT_SECRET`
- ✅ `UNSPLASH_API_KEY`

**Frontend (.env.local):**
- ✅ `NEXT_PUBLIC_API_URL`
- ✅ `NEXTAUTH_URL`
- ✅ `NEXTAUTH_SECRET`

## 🤝 Team Development

### For New Team Members:

1. **Clone the repository**
2. **Run the setup command**: `pnpm run setup`
3. **Configure environment variables** (get API keys from team lead)
4. **Start development**: `pnpm run dev`
5. **Database will be ready** (either from existing file or auto-created)

### Git Workflow:
```bash
# Always pull latest changes
git pull origin main

# Install any new dependencies
pnpm run setup

# Start development
pnpm run dev
```

## 📝 Additional Notes

- **Database file** (`auth_database.db`) can be included in Git for shared development
- **Environment files** (`.env`, `.env.local`) should be in `.gitignore`
- **API keys** should be shared securely among team members
- **SQLite** makes database setup simple - no separate database server needed

## 🆘 Need Help?

If you encounter any issues:

1. Check this README for troubleshooting steps
2. Ensure all environment variables are properly set
3. Verify all dependencies are installed
4. Check that required ports (3000, 8000) are available
5. Contact the team lead for API keys and credentials

---

**Happy coding! 🚀**
