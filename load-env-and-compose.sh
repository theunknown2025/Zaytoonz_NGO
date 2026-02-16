#!/bin/bash

# Script to load .env.production and run docker compose commands
# Usage: ./load-env-and-compose.sh [docker compose command]
# Example: ./load-env-and-compose.sh up -d

set -e

COMPOSE_FILE="docker-compose-beta.yml"
ENV_FILE=".env.production"

# Check if .env.production exists
if [ ! -f "$ENV_FILE" ]; then
    echo "Error: $ENV_FILE not found!"
    echo "Please create $ENV_FILE with your environment variables."
    exit 1
fi

# Load environment variables from .env.production
echo "Loading environment variables from $ENV_FILE..."

# Export variables from .env.production
set -a
while IFS= read -r line || [ -n "$line" ]; do
    # Skip comments and empty lines
    [[ "$line" =~ ^[[:space:]]*# ]] && continue
    [[ -z "$line" ]] && continue
    # Only process lines that look like valid env vars (VAR=value format)
    if [[ "$line" =~ ^[[:space:]]*[A-Za-z_][A-Za-z0-9_]*= ]]; then
        # Remove leading/trailing whitespace
        line=$(echo "$line" | sed 's/^[[:space:]]*//;s/[[:space:]]*$//')
        # Export the variable
        export "$line" 2>/dev/null || true
    fi
done < "$ENV_FILE"
set +a

echo "Environment variables loaded successfully."
echo ""

# Run docker compose with the provided arguments
if [ $# -eq 0 ]; then
    echo "Usage: $0 [docker compose command]"
    echo "Example: $0 up -d"
    echo "Example: $0 down"
    echo "Example: $0 ps"
    exit 1
fi

# Execute docker compose command
docker compose -f "$COMPOSE_FILE" "$@"
