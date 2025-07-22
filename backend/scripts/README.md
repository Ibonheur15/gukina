# Gukina Backend Scripts

This directory contains utility scripts for managing and testing the Gukina backend.

## League Standings Scripts

### Test League Endpoint

Tests the league endpoint with season-based standings.

```
npm run test-league
```

### Generate Season Standings

Generates standings for a specific league and season.

```
npm run generate-season <leagueId> [season]
```

Example:
```
npm run generate-season 60a1c2b3d4e5f6a7b8c9d0e1 2023
```

If season is not provided, the current year will be used.

## How to Use

1. Make sure the MongoDB server is running
2. Make sure the backend server is running (for API tests)
3. Run the desired script using npm run commands

## Notes

- The `generate-season` script will delete existing standings for the specified league and season before creating new ones
- If no match data is found for a season, default standings will be generated with random values
- Standings are calculated based on completed matches (status = 'ended')