# Gukina Project Setup Guide

This guide provides step-by-step instructions for setting up, pushing, and deploying the Gukina project.

## Table of Contents
1. [Initial Setup](#initial-setup)
2. [Git Repository Setup](#git-repository-setup)
3. [Local Development](#local-development)
4. [Backend Deployment](#backend-deployment)
5. [Frontend Deployment](#frontend-deployment)
6. [Database Setup](#database-setup)
7. [Post-Deployment Tasks](#post-deployment-tasks)
8. [Troubleshooting](#troubleshooting)

## Initial Setup

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Git
- MongoDB Atlas account
- Vercel account
- GitHub account

### Install Required Tools
```bash
# Check Node.js version
node -v

# Install or update npm
npm install -g npm@latest
```

## Git Repository Setup

### Create a New GitHub Repository
1. Go to GitHub and create a new repository named "gukina"
2. Initialize the local repository and push to GitHub:

```bash
# Navigate to your project directory
cd d:\project\Gukina Q

# Initialize git repository
git init

# Add all files to git
git add .

# Commit the files
git commit -m "Initial commit"

# Add the remote repository
git remote add origin https://github.com/yourusername/gukina.git

# Push to GitHub
git push -u origin main
```

## Local Development

### Install Dependencies
```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Set Up Environment Variables

1. Backend (.env file):
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gukina
JWT_SECRET=your_jwt_secret
ADMIN_SECRET_KEY=your_admin_secret
```

2. Frontend (.env.development file):
```
REACT_APP_API_URL=http://localhost:5000/api
```

### Run Development Servers
```bash
# From the root directory, run both servers
npm start

# Or run them separately:
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm start
```

## Backend Deployment

### Deploy to Vercel
1. Log in to Vercel and create a new project
2. Connect to your GitHub repository
3. Configure the project:
   - Framework Preset: Other
   - Root Directory: backend
   - Build Command: npm run build
   - Output Directory: ./
   - Install Command: npm install

4. Add environment variables:
   - MONGODB_URI: Your MongoDB Atlas connection string
   - JWT_SECRET: A secure random string
   - ADMIN_SECRET_KEY: A secure random string for admin registration

5. Deploy the project
6. Note the deployment URL (e.g., https://gukina-api.vercel.app)

## Frontend Deployment

### Deploy to Vercel
1. Create another new project on Vercel
2. Connect to the same GitHub repository
3. Configure the project:
   - Framework Preset: Create React App
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: build
   - Install Command: npm install

4. Add environment variables:
   - REACT_APP_API_URL: Your backend API URL (e.g., https://gukina-api.vercel.app/api)

5. Deploy the project
6. Note the deployment URL (e.g., https://gukina.vercel.app)

## Database Setup

### MongoDB Atlas Setup
1. Create a MongoDB Atlas account at https://www.mongodb.com/cloud/atlas
2. Create a new cluster (the free tier is sufficient for development)
3. Create a database user:
   - Go to Database Access > Add New Database User
   - Create a username and password
   - Add database user privileges (Read and Write to any database)

4. Set up network access:
   - Go to Network Access > Add IP Address
   - Add your current IP address or allow access from anywhere (0.0.0.0/0)

5. Get your connection string:
   - Go to Clusters > Connect > Connect your application
   - Copy the connection string
   - Replace `<username>`, `<password>`, and `<dbname>` with your actual values

## Post-Deployment Tasks

### Create Admin User
After deploying, create an admin user by sending a POST request to your API:

```
POST https://your-backend-url.vercel.app/api/auth/admin
Content-Type: application/json

{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "securepassword",
  "secretKey": "your_admin_secret"
}
```

You can use tools like Postman or curl to send this request.

### Verify Deployment
1. Visit your frontend URL
2. Try logging in with the admin credentials
3. Test the admin dashboard functionality
4. Test the public-facing pages

## Troubleshooting

### Common Issues and Solutions

#### Backend Connection Issues
- Check that your MongoDB connection string is correct
- Verify that your IP address is whitelisted in MongoDB Atlas
- Check Vercel logs for any connection errors

#### Frontend API Connection Issues
- Ensure REACT_APP_API_URL is set correctly in the frontend environment variables
- Check for CORS issues in the browser console
- Verify that the backend is responding to requests

#### Database Issues
- Check MongoDB Atlas monitoring for any performance issues
- Verify that your database user has the correct permissions

#### Deployment Issues
- Check Vercel build logs for any errors
- Verify that all environment variables are set correctly
- Make sure the correct directories are specified in your Vercel configuration

### Getting Help
If you encounter issues not covered in this guide, check:
- Vercel documentation: https://vercel.com/docs
- MongoDB Atlas documentation: https://docs.atlas.mongodb.com/
- React documentation: https://reactjs.org/docs/getting-started.html
- Express documentation: https://expressjs.com/