@echo off
echo Gukina Standings Generator
echo ========================
echo.
echo This script will help you fix and generate standings for leagues.
echo.

echo Step 1: Fixing match seasons...
call npm run fix-seasons
echo.

echo Step 2: Generating match seasons...
call npm run generate-match-seasons
echo.

echo Step 3: Generating standings for all leagues...
call npm run generate-all
echo.

echo Step 4: Running diagnostics...
call npm run diagnose-league
echo.

echo All done! Standings should now be available in the frontend.
echo If you still have issues, check the documentation in docs/STANDINGS.md
echo.
pause