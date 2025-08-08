# Jekyll Docker Setup

This repository includes Docker configuration to run Jekyll in a containerized environment.

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. **Build and start the container:**
   ```bash
   ./start-jekyll.sh
   ```

   Or manually:
   ```bash
   docker-compose up --build
   ```

2. **Access your site:**
   - Local: http://localhost:4000
   - From other devices: http://YOUR_IP:4000

3. **Stop the container:**
   ```bash
   docker-compose down
   ```

## Features

- **Live Reload**: Changes to your files are automatically reflected
- **Volume Mounting**: Your local files are synced with the container
- **Port Forwarding**: Jekyll runs on port 4000, live reload on 35729
- **Persistent Dependencies**: Gems are cached in a Docker volume

## Development Workflow

1. Start the container with `./start-jekyll.sh`
2. Edit your Jekyll files locally
3. Changes are automatically reflected in the browser
4. Stop with `Ctrl+C` or `docker-compose down`

## Troubleshooting

- If you get permission errors, make sure Docker has access to your project directory
- If live reload doesn't work, try refreshing the browser manually
- To rebuild completely: `docker-compose down && docker-compose up --build`
