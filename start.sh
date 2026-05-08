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

# Re-run npm install if node_modules is missing OR if a previous
# install was interrupted before completion. npm writes
# node_modules/.package-lock.json on a successful install, so its
# absence is a reliable "this folder is half-installed" signal.
if [ ! -f node_modules/.package-lock.json ]; then
  echo
  echo "Installing or repairing dependencies. This takes a minute."
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
