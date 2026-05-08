#!/bin/sh
# Run the CivitFree Personal dev server. Mac/Linux companion to start.bat.

cd "$(dirname "$0")"

if ! command -v npm >/dev/null 2>&1; then
  echo
  echo "Node.js doesn't appear to be installed."
  echo "Install the LTS version from https://nodejs.org/ and run this again."
  echo
  exit 1
fi

if [ ! -d node_modules ]; then
  echo
  echo "First-time setup: installing dependencies. This takes a minute."
  echo
  npm install || {
    echo
    echo "npm install failed. Try running it manually in this folder."
    exit 1
  }
fi

echo
echo "Starting CivitFree Personal..."
echo "Browser should open automatically in a moment."
echo "Press Ctrl+C when you want to stop the server."
echo

npm run dev -- --open
