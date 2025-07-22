# Gukina Database Schema

This document outlines the MongoDB schema used in the Gukina application.

## Collections

### Users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashed),
  role: String (enum: ['admin', 'user']),
  createdAt: Date,
  updatedAt: Date
}
```

### Countries
```javascript
{
  _id: ObjectId,
  name: String,
  code: String,
  flag: String (URL),
  createdAt: Date,
  updatedAt: Date
}
```

### Leagues
```javascript
{
  _id: ObjectId,
  name: String,
  country: ObjectId (ref: 'Country'),
  logo: String (URL),
  season: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Teams
```javascript
{
  _id: ObjectId,
  name: String,
  logo: String (URL),
  country: ObjectId (ref: 'Country'),
  league: ObjectId (ref: 'League'),
  stadium: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Matches
```javascript
{
  _id: ObjectId,
  homeTeam: ObjectId (ref: 'Team'),
  awayTeam: ObjectId (ref: 'Team'),
  league: ObjectId (ref: 'League'),
  season: String,
  date: Date,
  time: String,
  venue: String,
  status: String (enum: ['not_started', 'live', 'halftime', 'ended']),
  homeScore: Number,
  awayScore: Number,
  events: [
    {
      type: String (enum: ['goal', 'yellow_card', 'red_card', 'substitution']),
      team: ObjectId (ref: 'Team'),
      player: String,
      minute: Number,
      description: String
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

### LeagueStandings
```javascript
{
  _id: ObjectId,
  league: ObjectId (ref: 'League'),
  season: String,
  team: ObjectId (ref: 'Team'),
  played: Number,
  won: Number,
  drawn: Number,
  lost: Number,
  goalsFor: Number,
  goalsAgainst: Number,
  points: Number,
  position: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### News
```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  image: String (URL),
  author: String,
  tags: [String],
  relatedTeams: [ObjectId] (ref: 'Team'),
  relatedLeagues: [ObjectId] (ref: 'League'),
  createdAt: Date,
  updatedAt: Date
}
```

## Relationships

- **Country** has many **Leagues**
- **Country** has many **Teams**
- **League** belongs to **Country**
- **League** has many **Teams**
- **League** has many **Matches**
- **League** has many **LeagueStandings**
- **Team** belongs to **Country**
- **Team** belongs to **League**
- **Team** has many **Matches** (as homeTeam or awayTeam)
- **Team** has one **LeagueStanding** per season
- **Match** belongs to **League**
- **Match** has one **homeTeam** (Team)
- **Match** has one **awayTeam** (Team)

## Indexes

For optimal performance, the following indexes should be created:

```javascript
// Countries
db.countries.createIndex({ name: 1 });
db.countries.createIndex({ code: 1 }, { unique: true });

// Leagues
db.leagues.createIndex({ country: 1 });
db.leagues.createIndex({ name: 1, country: 1 });
db.leagues.createIndex({ season: 1 });

// Teams
db.teams.createIndex({ country: 1 });
db.teams.createIndex({ league: 1 });
db.teams.createIndex({ name: 1 });

// Matches
db.matches.createIndex({ homeTeam: 1 });
db.matches.createIndex({ awayTeam: 1 });
db.matches.createIndex({ league: 1 });
db.matches.createIndex({ date: 1 });
db.matches.createIndex({ status: 1 });
db.matches.createIndex({ season: 1 });

// LeagueStandings
db.leagueStandings.createIndex({ league: 1, season: 1 });
db.leagueStandings.createIndex({ team: 1 });
db.leagueStandings.createIndex({ league: 1, team: 1, season: 1 }, { unique: true });

// News
db.news.createIndex({ createdAt: -1 });
db.news.createIndex({ tags: 1 });
db.news.createIndex({ relatedTeams: 1 });
db.news.createIndex({ relatedLeagues: 1 });
```

## Data Validation

MongoDB schema validation can be added to enforce data integrity:

```javascript
db.createCollection("users", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["name", "email", "password", "role"],
      properties: {
        name: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        email: {
          bsonType: "string",
          pattern: "^.+@.+$",
          description: "must be a valid email and is required"
        },
        password: {
          bsonType: "string",
          description: "must be a string and is required"
        },
        role: {
          enum: ["admin", "user"],
          description: "must be either admin or user and is required"
        }
      }
    }
  }
});

// Similar validation can be added for other collections
```

## Notes on Data Management

1. **Seasons**: Seasons are stored as strings (e.g., "2023-2024") and are used to filter league standings and matches.

2. **Match Events**: Match events are stored as subdocuments within the Match document for simplicity. If the number of events grows significantly, consider moving them to a separate collection.

3. **League Standings**: League standings are pre-calculated and stored in the LeagueStandings collection rather than being calculated on-the-fly for performance reasons.

4. **Cascading Deletes**: When implementing delete operations, ensure that related documents are also deleted or updated accordingly to maintain data integrity.