#!/bin/sh

# Generate Prisma client if not exists
if [ ! -d "node_modules/.prisma" ]; then
  echo "Generating Prisma client..."
  npx prisma generate || echo "Failed to generate Prisma client, using existing one"
fi

# Run database migrations
echo "Running database migrations..."
npx prisma migrate deploy || npx prisma db push || echo "Migration failed, continuing..."

# Start the application
echo "Starting the application..."
# Use the correct path for the main file
node dist/src/main.js