#!/bin/bash

# Exit on error
set -e

# Ensure we have a .env file
if [ ! -f .env ]; then
  echo "No .env file found. Creating one from example..."
  if [ -f backend/.env.example ]; then
    cp backend/.env.example .env
    echo ".env file created. Please edit it with your actual credentials."
  else
    echo "Warning: Could not find backend/.env.example to create .env file."
    echo "Please create a .env file manually before deploying."
    exit 1
  fi
fi

# Load environment variables safely
echo "Loading environment variables..."
# Fixed to handle special characters and empty lines properly
while IFS= read -r line || [ -n "$line" ]; do
  # Skip comments and empty lines
  [[ "$line" =~ ^#.*$ ]] || [[ -z "$line" ]] && continue
  
  # Parse key=value, handling quotes correctly
  if [[ "$line" =~ ^([^=]+)=(.*)$ ]]; then
    key="${BASH_REMATCH[1]}"
    value="${BASH_REMATCH[2]}"
    
    # Remove leading/trailing whitespace from key
    key=$(echo "$key" | xargs)
    
    # Skip if key is empty
    [ -z "$key" ] && continue
    
    # Export the variable
    export "$key=$value"
  fi
done < .env

# Validate required environment variables
echo "Validating environment variables..."
REQUIRED_VARS=("HUBSPOT_CLIENT_ID" "HUBSPOT_CLIENT_SECRET" "AIRTABLE_CLIENT_ID" "AIRTABLE_CLIENT_SECRET" "NOTION_CLIENT_ID" "NOTION_CLIENT_SECRET")
MISSING_VARS=0

for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR}" ] || [ "${!VAR}" == "demo_"* ]; then
    echo "Warning: $VAR is not set or using demo value"
    MISSING_VARS=1
  fi
done

if [ $MISSING_VARS -eq 1 ]; then
  echo "Some environment variables are missing or using demo values."
  read -p "Do you want to continue anyway? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment aborted. Please update your .env file."
    exit 1
  fi
fi

# Build and deploy services
echo "Building and deploying services..."
docker-compose build

echo "Starting services..."
docker-compose up -d

echo "Checking service health..."
sleep 10
docker-compose ps

echo "Deployment complete. Services available at:"
echo "- Frontend: http://localhost:3000"
echo "- Backend API: http://localhost:8000"
