# Gukina API Documentation

This document provides details about the API endpoints available in the Gukina application.

## Base URL

```
https://your-backend-url.vercel.app/api
```

For local development:
```
http://localhost:5000/api
```

## Authentication

### Login
```
POST /auth/login
```

Request body:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

### Register Admin
```
POST /auth/admin
```

Request body:
```json
{
  "name": "Admin User",
  "email": "admin@example.com",
  "password": "securepassword",
  "secretKey": "your_admin_secret"
}
```

Response:
```json
{
  "token": "jwt_token_here",
  "user": {
    "_id": "user_id",
    "name": "Admin User",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Get Current User
```
GET /auth/me
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Response:
```json
{
  "user": {
    "_id": "user_id",
    "name": "User Name",
    "email": "user@example.com",
    "role": "admin"
  }
}
```

## Countries

### Get All Countries
```
GET /countries
```

Response:
```json
{
  "countries": [
    {
      "_id": "country_id",
      "name": "Rwanda",
      "code": "RW",
      "flag": "flag_url"
    },
    // More countries...
  ]
}
```

### Get Country by ID
```
GET /countries/:id
```

Response:
```json
{
  "country": {
    "_id": "country_id",
    "name": "Rwanda",
    "code": "RW",
    "flag": "flag_url"
  }
}
```

### Create Country
```
POST /countries
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Request body:
```json
{
  "name": "Kenya",
  "code": "KE",
  "flag": "flag_url"
}
```

Response:
```json
{
  "country": {
    "_id": "country_id",
    "name": "Kenya",
    "code": "KE",
    "flag": "flag_url"
  }
}
```

### Update Country
```
PUT /countries/:id
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Request body:
```json
{
  "name": "Kenya Updated",
  "code": "KE",
  "flag": "new_flag_url"
}
```

Response:
```json
{
  "country": {
    "_id": "country_id",
    "name": "Kenya Updated",
    "code": "KE",
    "flag": "new_flag_url"
  }
}
```

### Delete Country
```
DELETE /countries/:id
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Response:
```json
{
  "message": "Country deleted successfully"
}
```

## Leagues

### Get All Leagues
```
GET /leagues
```

Response:
```json
{
  "leagues": [
    {
      "_id": "league_id",
      "name": "Rwanda Premier League",
      "country": {
        "_id": "country_id",
        "name": "Rwanda"
      },
      "logo": "logo_url",
      "season": "2023-2024",
      "isActive": true
    },
    // More leagues...
  ]
}
```

### Get League by ID
```
GET /leagues/:id
```

Query parameters:
- `season`: Optional season filter (e.g., "2023-2024")

Response:
```json
{
  "league": {
    "_id": "league_id",
    "name": "Rwanda Premier League",
    "country": {
      "_id": "country_id",
      "name": "Rwanda"
    },
    "logo": "logo_url",
    "season": "2023-2024",
    "isActive": true
  },
  "availableSeasons": ["2023-2024", "2022-2023"]
}
```

### Get Leagues by Country
```
GET /leagues/country/:countryId
```

Response:
```json
{
  "leagues": [
    {
      "_id": "league_id",
      "name": "Rwanda Premier League",
      "country": "country_id",
      "logo": "logo_url",
      "season": "2023-2024",
      "isActive": true
    },
    // More leagues...
  ]
}
```

### Get Top Leagues
```
GET /leagues/top
```

Query parameters:
- `limit`: Number of leagues to return (default: 5)

Response:
```json
{
  "leagues": [
    {
      "_id": "league_id",
      "name": "Rwanda Premier League",
      "country": {
        "_id": "country_id",
        "name": "Rwanda"
      },
      "logo": "logo_url",
      "season": "2023-2024",
      "isActive": true
    },
    // More leagues...
  ]
}
```

### Create League
```
POST /leagues
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Request body:
```json
{
  "name": "Kenya Premier League",
  "country": "country_id",
  "logo": "logo_url",
  "season": "2023-2024",
  "isActive": true
}
```

Response:
```json
{
  "league": {
    "_id": "league_id",
    "name": "Kenya Premier League",
    "country": "country_id",
    "logo": "logo_url",
    "season": "2023-2024",
    "isActive": true
  }
}
```

### Update League
```
PUT /leagues/:id
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Request body:
```json
{
  "name": "Kenya Premier League Updated",
  "logo": "new_logo_url",
  "season": "2023-2024",
  "isActive": true
}
```

Response:
```json
{
  "league": {
    "_id": "league_id",
    "name": "Kenya Premier League Updated",
    "country": "country_id",
    "logo": "new_logo_url",
    "season": "2023-2024",
    "isActive": true
  }
}
```

### Delete League
```
DELETE /leagues/:id
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Response:
```json
{
  "message": "League deleted successfully"
}
```

## Teams

### Get All Teams
```
GET /teams
```

Response:
```json
{
  "teams": [
    {
      "_id": "team_id",
      "name": "Team Name",
      "logo": "logo_url",
      "country": {
        "_id": "country_id",
        "name": "Rwanda"
      },
      "league": {
        "_id": "league_id",
        "name": "Rwanda Premier League"
      },
      "stadium": "Stadium Name"
    },
    // More teams...
  ]
}
```

### Get Team by ID
```
GET /teams/:id
```

Response:
```json
{
  "team": {
    "_id": "team_id",
    "name": "Team Name",
    "logo": "logo_url",
    "country": {
      "_id": "country_id",
      "name": "Rwanda"
    },
    "league": {
      "_id": "league_id",
      "name": "Rwanda Premier League"
    },
    "stadium": "Stadium Name"
  }
}
```

### Get Teams by Country
```
GET /teams/country/:countryId
```

Response:
```json
{
  "teams": [
    {
      "_id": "team_id",
      "name": "Team Name",
      "logo": "logo_url",
      "country": "country_id",
      "league": "league_id",
      "stadium": "Stadium Name"
    },
    // More teams...
  ]
}
```

### Get Teams by League
```
GET /teams/league/:leagueId
```

Response:
```json
{
  "teams": [
    {
      "_id": "team_id",
      "name": "Team Name",
      "logo": "logo_url",
      "country": "country_id",
      "league": "league_id",
      "stadium": "Stadium Name"
    },
    // More teams...
  ]
}
```

### Get Popular Teams
```
GET /teams/popular
```

Query parameters:
- `limit`: Number of teams to return (default: 12)

Response:
```json
{
  "teams": [
    {
      "_id": "team_id",
      "name": "Team Name",
      "logo": "logo_url",
      "country": {
        "_id": "country_id",
        "name": "Rwanda"
      },
      "league": {
        "_id": "league_id",
        "name": "Rwanda Premier League"
      },
      "stadium": "Stadium Name"
    },
    // More teams...
  ]
}
```

### Create Team
```
POST /teams
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Request body:
```json
{
  "name": "New Team",
  "logo": "logo_url",
  "country": "country_id",
  "league": "league_id",
  "stadium": "Stadium Name"
}
```

Response:
```json
{
  "team": {
    "_id": "team_id",
    "name": "New Team",
    "logo": "logo_url",
    "country": "country_id",
    "league": "league_id",
    "stadium": "Stadium Name"
  }
}
```

### Update Team
```
PUT /teams/:id
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Request body:
```json
{
  "name": "Updated Team Name",
  "logo": "new_logo_url",
  "stadium": "New Stadium Name"
}
```

Response:
```json
{
  "team": {
    "_id": "team_id",
    "name": "Updated Team Name",
    "logo": "new_logo_url",
    "country": "country_id",
    "league": "league_id",
    "stadium": "New Stadium Name"
  }
}
```

### Delete Team
```
DELETE /teams/:id
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Response:
```json
{
  "message": "Team deleted successfully"
}
```

## Matches

### Get All Matches
```
GET /matches
```

Response:
```json
{
  "matches": [
    {
      "_id": "match_id",
      "homeTeam": {
        "_id": "team_id",
        "name": "Home Team",
        "logo": "logo_url"
      },
      "awayTeam": {
        "_id": "team_id",
        "name": "Away Team",
        "logo": "logo_url"
      },
      "league": {
        "_id": "league_id",
        "name": "League Name"
      },
      "season": "2023-2024",
      "date": "2023-05-15T18:00:00.000Z",
      "time": "18:00",
      "venue": "Stadium Name",
      "status": "not_started",
      "homeScore": 0,
      "awayScore": 0,
      "events": []
    },
    // More matches...
  ]
}
```

### Get Match by ID
```
GET /matches/:id
```

Response:
```json
{
  "match": {
    "_id": "match_id",
    "homeTeam": {
      "_id": "team_id",
      "name": "Home Team",
      "logo": "logo_url"
    },
    "awayTeam": {
      "_id": "team_id",
      "name": "Away Team",
      "logo": "logo_url"
    },
    "league": {
      "_id": "league_id",
      "name": "League Name"
    },
    "season": "2023-2024",
    "date": "2023-05-15T18:00:00.000Z",
    "time": "18:00",
    "venue": "Stadium Name",
    "status": "not_started",
    "homeScore": 0,
    "awayScore": 0,
    "events": []
  }
}
```

### Get Live Matches
```
GET /matches/live
```

Response:
```json
{
  "matches": [
    {
      "_id": "match_id",
      "homeTeam": {
        "_id": "team_id",
        "name": "Home Team",
        "logo": "logo_url"
      },
      "awayTeam": {
        "_id": "team_id",
        "name": "Away Team",
        "logo": "logo_url"
      },
      "league": {
        "_id": "league_id",
        "name": "League Name"
      },
      "season": "2023-2024",
      "date": "2023-05-15T18:00:00.000Z",
      "time": "18:00",
      "venue": "Stadium Name",
      "status": "live",
      "homeScore": 1,
      "awayScore": 0,
      "events": [
        {
          "type": "goal",
          "team": "home_team_id",
          "player": "Player Name",
          "minute": 35,
          "description": "Goal description"
        }
      ]
    },
    // More matches...
  ]
}
```

### Get Matches by Date Range
```
GET /matches/date
```

Query parameters:
- `startDate`: Start date in ISO format (e.g., "2023-05-15")
- `endDate`: End date in ISO format (e.g., "2023-05-20")

Response:
```json
{
  "matches": [
    // Matches within the date range...
  ]
}
```

### Get Matches by Day
```
GET /matches/date
```

Query parameters:
- `day`: Date in ISO format (e.g., "2023-05-15")

Response:
```json
{
  "matches": [
    // Matches on the specified day...
  ]
}
```

### Get Matches by League
```
GET /matches/league/:leagueId
```

Response:
```json
{
  "matches": [
    // Matches for the specified league...
  ]
}
```

### Get Matches by Team
```
GET /matches/team/:teamId
```

Response:
```json
{
  "matches": [
    // Matches for the specified team...
  ]
}
```

### Create Match
```
POST /matches
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Request body:
```json
{
  "homeTeam": "home_team_id",
  "awayTeam": "away_team_id",
  "league": "league_id",
  "season": "2023-2024",
  "date": "2023-05-15",
  "time": "18:00",
  "venue": "Stadium Name"
}
```

Response:
```json
{
  "match": {
    "_id": "match_id",
    "homeTeam": "home_team_id",
    "awayTeam": "away_team_id",
    "league": "league_id",
    "season": "2023-2024",
    "date": "2023-05-15T18:00:00.000Z",
    "time": "18:00",
    "venue": "Stadium Name",
    "status": "not_started",
    "homeScore": 0,
    "awayScore": 0,
    "events": []
  }
}
```

### Update Match
```
PUT /matches/:id
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Request body:
```json
{
  "date": "2023-05-16",
  "time": "19:00",
  "venue": "New Stadium Name"
}
```

Response:
```json
{
  "match": {
    "_id": "match_id",
    "homeTeam": "home_team_id",
    "awayTeam": "away_team_id",
    "league": "league_id",
    "season": "2023-2024",
    "date": "2023-05-16T19:00:00.000Z",
    "time": "19:00",
    "venue": "New Stadium Name",
    "status": "not_started",
    "homeScore": 0,
    "awayScore": 0,
    "events": []
  }
}
```

### Add Match Event
```
POST /matches/:id/events
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Request body:
```json
{
  "type": "goal",
  "team": "home_team_id",
  "player": "Player Name",
  "minute": 35,
  "description": "Goal description"
}
```

Response:
```json
{
  "match": {
    "_id": "match_id",
    "homeTeam": "home_team_id",
    "awayTeam": "away_team_id",
    "league": "league_id",
    "season": "2023-2024",
    "date": "2023-05-16T19:00:00.000Z",
    "time": "19:00",
    "venue": "Stadium Name",
    "status": "live",
    "homeScore": 1,
    "awayScore": 0,
    "events": [
      {
        "type": "goal",
        "team": "home_team_id",
        "player": "Player Name",
        "minute": 35,
        "description": "Goal description"
      }
    ]
  }
}
```

### Update Match Status
```
PUT /matches/:id/status
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Request body:
```json
{
  "status": "live"
}
```

Response:
```json
{
  "match": {
    "_id": "match_id",
    "homeTeam": "home_team_id",
    "awayTeam": "away_team_id",
    "league": "league_id",
    "season": "2023-2024",
    "date": "2023-05-16T19:00:00.000Z",
    "time": "19:00",
    "venue": "Stadium Name",
    "status": "live",
    "homeScore": 0,
    "awayScore": 0,
    "events": []
  }
}
```

### Delete Match
```
DELETE /matches/:id
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Response:
```json
{
  "message": "Match deleted successfully"
}
```

## League Standings

### Get Standings by League
```
GET /standings/league/:leagueId
```

Query parameters:
- `season`: Optional season filter (e.g., "2023-2024")

Response:
```json
{
  "standings": [
    {
      "_id": "standing_id",
      "league": "league_id",
      "season": "2023-2024",
      "team": {
        "_id": "team_id",
        "name": "Team Name",
        "logo": "logo_url"
      },
      "played": 10,
      "won": 7,
      "drawn": 2,
      "lost": 1,
      "goalsFor": 20,
      "goalsAgainst": 8,
      "points": 23,
      "position": 1
    },
    // More standings...
  ],
  "availableSeasons": ["2023-2024", "2022-2023"]
}
```

### Update Team Standing
```
PUT /standings/league/:leagueId/team/:teamId
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Request body:
```json
{
  "played": 11,
  "won": 8,
  "drawn": 2,
  "lost": 1,
  "goalsFor": 22,
  "goalsAgainst": 8,
  "points": 26,
  "season": "2023-2024"
}
```

Response:
```json
{
  "standing": {
    "_id": "standing_id",
    "league": "league_id",
    "season": "2023-2024",
    "team": "team_id",
    "played": 11,
    "won": 8,
    "drawn": 2,
    "lost": 1,
    "goalsFor": 22,
    "goalsAgainst": 8,
    "points": 26,
    "position": 1
  }
}
```

### Update Standings from Match
```
POST /standings/match/:matchId
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Request body:
```json
{
  "homeScore": 2,
  "awayScore": 1,
  "status": "ended"
}
```

Response:
```json
{
  "message": "Standings updated successfully",
  "homeStanding": {
    // Updated home team standing
  },
  "awayStanding": {
    // Updated away team standing
  }
}
```

## Seasons

### Get Seasons by League
```
GET /seasons/league/:leagueId
```

Response:
```json
{
  "seasons": ["2023-2024", "2022-2023", "2021-2022"]
}
```

## Fix Data

### Fix League Data
```
GET /fix/league/:leagueId
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Response:
```json
{
  "message": "League data fixed successfully",
  "details": {
    "matchesUpdated": 10,
    "standingsCreated": 16
  }
}
```

## News

### Get All News
```
GET /news
```

Query parameters:
- `limit`: Number of news items to return (default: 10)
- `page`: Page number for pagination (default: 1)

Response:
```json
{
  "news": [
    {
      "_id": "news_id",
      "title": "News Title",
      "content": "News content...",
      "image": "image_url",
      "author": "Author Name",
      "tags": ["tag1", "tag2"],
      "relatedTeams": [
        {
          "_id": "team_id",
          "name": "Team Name"
        }
      ],
      "relatedLeagues": [
        {
          "_id": "league_id",
          "name": "League Name"
        }
      ],
      "createdAt": "2023-05-15T10:30:00.000Z",
      "updatedAt": "2023-05-15T10:30:00.000Z"
    },
    // More news...
  ],
  "totalPages": 5,
  "currentPage": 1
}
```

### Get News by ID
```
GET /news/:id
```

Response:
```json
{
  "news": {
    "_id": "news_id",
    "title": "News Title",
    "content": "News content...",
    "image": "image_url",
    "author": "Author Name",
    "tags": ["tag1", "tag2"],
    "relatedTeams": [
      {
        "_id": "team_id",
        "name": "Team Name"
      }
    ],
    "relatedLeagues": [
      {
        "_id": "league_id",
        "name": "League Name"
      }
    ],
    "createdAt": "2023-05-15T10:30:00.000Z",
    "updatedAt": "2023-05-15T10:30:00.000Z"
  }
}
```

### Create News
```
POST /news
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Request body:
```json
{
  "title": "New Article",
  "content": "Article content...",
  "image": "image_url",
  "author": "Author Name",
  "tags": ["tag1", "tag2"],
  "relatedTeams": ["team_id1", "team_id2"],
  "relatedLeagues": ["league_id1"]
}
```

Response:
```json
{
  "news": {
    "_id": "news_id",
    "title": "New Article",
    "content": "Article content...",
    "image": "image_url",
    "author": "Author Name",
    "tags": ["tag1", "tag2"],
    "relatedTeams": ["team_id1", "team_id2"],
    "relatedLeagues": ["league_id1"],
    "createdAt": "2023-05-15T10:30:00.000Z",
    "updatedAt": "2023-05-15T10:30:00.000Z"
  }
}
```

### Update News
```
PUT /news/:id
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Request body:
```json
{
  "title": "Updated Article Title",
  "content": "Updated content...",
  "image": "new_image_url"
}
```

Response:
```json
{
  "news": {
    "_id": "news_id",
    "title": "Updated Article Title",
    "content": "Updated content...",
    "image": "new_image_url",
    "author": "Author Name",
    "tags": ["tag1", "tag2"],
    "relatedTeams": ["team_id1", "team_id2"],
    "relatedLeagues": ["league_id1"],
    "createdAt": "2023-05-15T10:30:00.000Z",
    "updatedAt": "2023-05-15T11:15:00.000Z"
  }
}
```

### Delete News
```
DELETE /news/:id
```

Headers:
```
Authorization: Bearer jwt_token_here
```

Response:
```json
{
  "message": "News deleted successfully"
}
```

## Error Responses

All API endpoints return appropriate HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error response format:
```json
{
  "error": "Error message",
  "details": "Additional error details (optional)"
}
```