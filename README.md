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
- MongoDB

### Installation

1. Clone the repository
```
git clone https://github.com/yourusername/gukina.git
cd gukina
```

2. Install backend dependencies
```
cd backend
npm install
```

3. Set up environment variables
Create a `.env` file in the backend directory with the following:
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/gukina
JWT_SECRET=your_jwt_secret
ADMIN_SECRET_KEY=your_admin_secret
```

4. Install frontend dependencies
```
cd ../frontend
npm install
```

5. Start the development servers

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

6. Create an admin user
Send a POST request to `/api/auth/admin` with:
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "securepassword",
  "secretKey": "your_admin_secret"
}
```

## License
This project is licensed under the MIT License.