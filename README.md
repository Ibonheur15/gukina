# Gukina - African Sports Platform

Gukina is a sports platform focused on African leagues, providing live scores, fixtures, and league tables for various sports across the continent.

## Features

### Admin Panel (CRUD System)
- Manage countries (Rwanda, Kenya, Nigeria, etc.)
- Create and manage leagues associated with countries
- Add and manage teams linked to leagues
- Add matches with details (home team, away team, date, time, venue)
- Add real-time match events:
  - Goals (team, scorer, minute)
  - Red/yellow cards
  - Match status updates (not started, live, halftime, ended)
- Complete dashboard with CRUD operations

### User-Facing Pages
- Live Matches: showing current live matches and recent results
- Fixtures: upcoming matches by league
- League Tables: teams, matches played, wins, losses, points
- Team Pages: details about teams (name, league, country)
- Search functionality for teams and leagues
- Single match view

### Additional Features
- Admin authentication
- Public access to match information
- Timestamps for match and event updates
- Dark mode theme with green accent color (#00C851)
- Mobile-friendly layout using Tailwind CSS

## Tech Stack

### Backend
- Node.js with Express
- MongoDB database
- JWT authentication
- RESTful API

### Frontend
- React
- Tailwind CSS for styling
- React Router for navigation
- Context API for state management

## Project Structure

```
gukina/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── .env
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── context/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── tailwind.config.js
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14+)
- MongoDB Atlas account or local MongoDB instance
- GitHub account
- Vercel account

### Local Development Setup

1. Clone the repository
```
git clone https://github.com/yourusername/gukina.git
cd gukina
```

2. Install all dependencies at once
```
npm run install:all
```

Or install dependencies separately:

```
# Backend dependencies
cd backend
npm install

# Frontend dependencies
cd ../frontend
npm install
```

3. Set up environment variables

Create a `.env` file in the backend directory:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gukina
JWT_SECRET=your_jwt_secret
ADMIN_SECRET_KEY=your_admin_secret
```

Create a `.env.development` file in the frontend directory:
```
REACT_APP_API_URL=http://localhost:5000/api
```

4. Start the development servers

From the root directory:
```
npm start
```

Or start servers separately:

Backend:
```
cd backend
npm run dev
```

Frontend:
```
cd frontend
npm start
```

5. Create an admin user
Send a POST request to `/api/auth/admin` with:
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "securepassword",
  "secretKey": "your_admin_secret"
}
```

## Deployment

### Backend Deployment (Vercel)

1. Push your code to GitHub

2. Create a new project on Vercel and connect to your GitHub repository

3. Configure the following settings:
   - Framework Preset: Other
   - Root Directory: backend
   - Build Command: npm run build
   - Output Directory: ./
   - Install Command: npm install

4. Add the following environment variables:
   - MONGODB_URI: Your MongoDB Atlas connection string
   - JWT_SECRET: Your JWT secret key
   - ADMIN_SECRET_KEY: Your admin secret key

5. Deploy the project

### Frontend Deployment (Vercel)

1. Create another new project on Vercel for the frontend

2. Configure the following settings:
   - Framework Preset: Create React App
   - Root Directory: frontend
   - Build Command: npm run build
   - Output Directory: build
   - Install Command: npm install

3. Add the following environment variable:
   - REACT_APP_API_URL: Your deployed backend URL + /api (e.g., https://gukina-api.vercel.app/api)

4. Deploy the project

### MongoDB Atlas Setup

1. Create a MongoDB Atlas account if you don't have one

2. Create a new cluster

3. Create a database user with read/write permissions

4. Add your IP address to the IP Access List (or allow access from anywhere for development)

5. Get your connection string and replace `<username>`, `<password>`, and `<dbname>` with your actual values

## License
This project is licensed under the MIT License.