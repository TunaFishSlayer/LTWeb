# LTWeb - Project Setup Guide

LTWeb is a laptop e-commerce application with React frontend and Node.js/Express backend connected to MongoDB.

## 📋 System Requirements

- **Node.js**: version 20 or higher
- **npm**: comes with Node.js
- **Docker** and **Docker Compose**: for running MongoDB (or pre-installed MongoDB)
- **Git**: to clone repository

## 🏗️ Project Structure

```
LTWeb/
├── backend/          # Backend API (Node.js + Express + MongoDB)
├── frontend/         # Frontend (React)
├── docker-compose.yml # Docker configuration for MongoDB
└── README.md         # This file
```

## 🚀 Project Setup Instructions

### Step 1: Clone Repository

```bash
git clone <repository-url>
cd LTWeb
```

### Step 2: Run Database (MongoDB)

There are 2 ways to run MongoDB:

#### Method 1: Using Docker Compose (Recommended)

From the project root directory:

```bash
docker-compose up -d
```

This command will:
- Download and run MongoDB container
- Expose MongoDB on port `27017`
- Save data to `./backend/mongodbdata`

To stop MongoDB:
```bash
docker-compose down
```

#### Method 2: Using Pre-installed MongoDB

If you have MongoDB installed on your machine, ensure MongoDB is running:
```bash
# Windows
net start MongoDB

# Linux/Mac
sudo systemctl start mongod
# or
mongod
```

### Step 3: Configure and Run Backend

1. **Install dependencies:**
```bash
cd backend
npm install
```

2. **Set up environment file:**
```bash
npm run setup:env
```

3. **Edit `.env` file** (created in `backend` directory):
```env
MONGO_URI=mongodb://localhost:27017
MONGO_DB=alaptop
JWT_SECRET=your-secret-key-here
PORT=5000
```

4. **Run backend:**
```bash
npm run dev
```

Backend will run at: **http://localhost:5000**

API Documentation (Swagger UI): **http://localhost:5000/api-docs**

### Step 4: Configure and Run Frontend

Open new terminal (keep backend running):

1. **Install dependencies:**
```bash
cd frontend
npm install
```

2. **Create `.env` file** in `frontend` directory:
```env
REACT_APP_GOOGLE_CLIENT_ID=your-google-client-id
```

3. **Run frontend:**
```bash
npm start
```

Frontend will automatically open at: **http://localhost:3000**

## 📝 Quick Start Commands Summary

From `LTWeb` root directory:

### Terminal 1 - Database:
```bash
docker-compose up -d
```

### Terminal 2 - Backend:
```bash
cd backend
npm install
npm run setup:env
# Edit .env file
npm run dev
```

### Terminal 3 - Frontend:
```bash
cd frontend
npm install
# Create .env file with required environment variables
npm start
```

## 🔧 Default Ports

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **MongoDB**: localhost:27017
- **Swagger UI**: http://localhost:5000/api-docs

## 📚 Detailed Documentation

- [Backend README](./backend/README.md) - Backend API details, entities, and endpoints
- [Frontend README](./frontend/README.md) - Frontend details, components, and features

## 🛠️ Useful Commands

### Backend
```bash
cd backend
npm run dev          # Run development server
npm run build        # Build production
npm run start        # Run production build
npm run setup:env    # Create .env from template
```

### Frontend
```bash
cd frontend
npm start            # Run development server
npm run build        # Build production
npm test             # Run tests
```

### Docker
```bash
docker-compose up -d     # Run MongoDB
docker-compose down      # Stop MongoDB
docker-compose logs      # View logs
docker-compose ps        # Check status
```

## ⚠️ Important Notes

1. **MongoDB must run before starting backend** - Backend won't connect if MongoDB is not ready
2. **Environment files** - Ensure you have configured all environment variables in both `backend/.env` and `frontend/.env`
3. **API Keys** - You need the following API keys:
   - Google OAuth Client ID (for frontend)

## 🐛 Common Troubleshooting

### MongoDB Connection Issues
- Check if MongoDB is running: `docker-compose ps`
- Check if port 27017 is occupied
- View logs: `docker-compose logs mongodb`

### Backend Won't Start
- Check if `.env` file exists and has correct format
- Check if MongoDB is running
- View logs in terminal for specific errors

### Frontend Can't Connect to Backend
- Check if backend is running on port 5000
- Check CORS settings in backend
- Check API endpoints in frontend code

## 📞 Support

If you encounter issues, please:
1. Check logs of each service
2. View detailed documentation in `backend/README.md` and `frontend/README.md`
3. Create issue on repository

