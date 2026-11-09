#!/bin/bash

# Jekyll Docker Development Scripts

# Function to check which docker compose command is available
get_docker_compose_cmd() {
    if command -v docker.exe &> /dev/null; then
        if docker.exe compose version &> /dev/null 2>&1; then
            echo "docker.exe compose"
        else
            echo "ERROR: docker.exe compose is not available"
            exit 1
        fi
    elif command -v docker-compose &> /dev/null; then
        echo "docker-compose"
    elif docker compose version &> /dev/null; then
        echo "docker compose"
    else
        echo "ERROR: No docker compose command is available"
        exit 1
    fi
}

# Get the correct docker compose command
DOCKER_COMPOSE_CMD=$(get_docker_compose_cmd)

# Build and start the Jekyll container
echo "Building and starting Jekyll container using: $DOCKER_COMPOSE_CMD"
$DOCKER_COMPOSE_CMD up --build

# To run in background, use:
# $DOCKER_COMPOSE_CMD up -d --build
