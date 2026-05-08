@echo off
REM Run the CivitFree Personal dev server. Double-click to start.
REM On first run, this installs dependencies; on subsequent runs it
REM just starts the dev server. Press Ctrl+C in this window to stop.

cd /d "%~dp0"

where npm >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js doesn't appear to be installed.
  echo Download the LTS installer from https://nodejs.org/ and run it,
  echo then double-click this file again.
  echo.
  pause
  exit /b 1
)

REM Re-run npm install if node_modules is missing OR if a previous
REM install was interrupted before completion. npm writes
REM node_modules\.package-lock.json on a successful install, so its
REM absence is a reliable "this folder is half-installed" signal.
if not exist node_modules\.package-lock.json (
  echo.
  echo Installing or repairing dependencies. This takes a minute.
  echo.
  call npm install
  if errorlevel 1 (
    echo.
    echo npm install failed. Try running it manually in this folder.
    pause
    exit /b 1
  )
)

echo.
echo Starting CivitFree Personal...
echo Browser should open automatically in a moment.
echo Press Ctrl+C in this window when you want to stop the server.
echo.

call npm run dev -- --open
