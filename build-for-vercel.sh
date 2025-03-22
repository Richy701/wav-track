#!/bin/bash

# Build script for Vercel deployment to a subdirectory

# Make sure environment variables are available
if [ -z "$VITE_SUPABASE_URL" ]; then
  echo "Warning: VITE_SUPABASE_URL is not set. Check your Vercel environment variables."
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  echo "Warning: VITE_SUPABASE_ANON_KEY is not set. Check your Vercel environment variables."
fi

# Build the app
echo "Building app with production base path /wav-track/"
npm run build

# Ensure the app is built to the correct path
echo "Creating subdirectory structure for /wav-track/"
mkdir -p dist/wav-track
cp -r dist/{assets,index.html,favicon.ico,*.js,*.css,*.svg,*.png,manifest*} dist/wav-track/ 2>/dev/null || :

# Copy _redirects file to root
echo "Setting up redirects"
echo "/wav-track/* /wav-track/index.html 200" > dist/_redirects

echo "Build completed successfully!" 