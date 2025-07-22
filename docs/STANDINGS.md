# Gukina League Standings Guide

This document provides guidance on how to fix and manage league standings in the Gukina application.

## Understanding Season-Based Standings

In Gukina, league standings are:
- Created based on the season parameter
- Generated from match data when available
- Created with default values when no match data exists

## Common Issues and Solutions

### No Standings Showing in Frontend

If standings are not appearing in the frontend:

#### Option 1: Use the batch file (Windows)

Simply run the `fix-standings.bat` file in the backend directory. This will:
1. Fix match seasons
2. Generate standings for all leagues
3. Run diagnostics

#### Option 2: Run individual scripts

1. **Check if matches have season field**:
   ```
   npm run fix-seasons
   ```

2. **Generate standings for all leagues**:
   ```
   npm run generate-all
   ```
   
   Or for a specific league and season (advanced):
   ```
   node scripts/generate-season-standings.js 60a1c2b3d4e5f6a7b8c9d0e1 2023
   ```

3. **Diagnose league endpoint issues**:
   ```
   npm run diagnose-league
   ```

4. **Test league endpoint**:
   ```
   npm run test-league
   ```

### Debugging in Frontend

1. Navigate to a league page
2. If no standings appear, click the "Debug & Refresh" button
3. Check browser console for detailed information
4. Try changing the season using the dropdown

## How Standings Are Generated

1. When a league page is loaded with a specific season:
   - The backend checks if standings exist for that league and season
   - If no standings exist, it tries to generate them from match data
   - If no match data exists, it creates default standings with random values

2. Standings are calculated based on:
   - Matches with status = 'ended'
   - Matches belonging to the specified season
   - Teams associated with the league

## Manual Fixes

If you need to manually fix standings:

1. Use MongoDB Compass to check the `leagueStandings` collection
2. Verify that teams are properly associated with leagues
3. Ensure matches have the correct season field
4. Run the appropriate scripts mentioned above

## API Endpoints

- Get league with standings: `GET /api/leagues/:id?season=2023`
- Get standings directly: `GET /api/standings/league/:leagueId?season=2023`

## Scripts Reference

- `fix-seasons`: Adds missing season field to matches
- `generate-all`: Creates standings for all leagues for the current season
- `generate-season`: Creates standings for a specific league and season (advanced usage)
- `diagnose-league`: Diagnoses issues with league endpoint and standings
- `test-league`: Tests the league endpoint with season parameter
- `fix-standings.bat`: Windows batch file that runs all necessary scripts in sequence