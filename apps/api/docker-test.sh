#!/bin/bash
# Script to test the Docker build locally before pushing to Azure

set -e

echo "🐳 Building Docker image for Fit API..."
docker build -t fit-api:local -f apps/api/Dockerfile .

echo ""
echo "✅ Build successful!"
echo ""
echo "📋 Image details:"
docker images fit-api:local

echo ""
echo "🔍 Image layers:"
docker history fit-api:local --human --format "table {{.CreatedBy}}\t{{.Size}}"

echo ""
echo "To run the container locally:"
echo "  docker run -p 3001:3001 --env-file .env fit-api:local"
echo ""
echo "To run with specific environment variables:"
echo "  docker run -p 3001:3001 \\"
echo "    -e DATABASE_URL='your-neon-connection-string' \\"
echo "    -e BETTER_AUTH_SECRET='your-secret' \\"
echo "    -e API_BASE_URL='http://localhost:3001' \\"
echo "    fit-api:local"
echo ""
echo "To run interactively and inspect:"
echo "  docker run -it --entrypoint /bin/sh fit-api:local"
