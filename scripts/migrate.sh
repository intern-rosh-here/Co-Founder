#!/bin/bash

echo "Running migrations..."
cd backend
npm run migrate
cd ..
