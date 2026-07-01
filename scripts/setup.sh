#!/bin/bash

echo "Setting up Cofounder Matrimony..."

# Install dependencies
cd frontend && npm install && cd ..
cd backend && npm install && cd ..

# Create env files
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env

echo "Setup complete!"
echo "Edit .env files with your configuration"
