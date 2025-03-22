#!/bin/bash

# Build script for Vercel deployment to a subdirectory

# Make sure environment variables are available
if [ -z "$VITE_SUPABASE_URL" ]; then
  echo "Warning: VITE_SUPABASE_URL is not set. Check your Vercel environment variables."
fi

if [ -z "$VITE_SUPABASE_ANON_KEY" ]; then
  echo "Warning: VITE_SUPABASE_ANON_KEY is not set. Check your Vercel environment variables."
fi

# Create icon directory for generated icons
mkdir -p public/icons

# Generate placeholder icon files if they don't exist (these would normally be proper icons)
if [ ! -f public/icon-192.png ]; then
  echo "Creating placeholder icon-192.png"
  convert public/favicon.ico -resize 192x192 public/icon-192.png 2>/dev/null || :
  # If convert (ImageMagick) is not available, copy favicon as placeholder
  if [ ! -f public/icon-192.png ]; then
    cp public/favicon.ico public/icon-192.png
  fi
fi

if [ ! -f public/icon-512.png ]; then
  echo "Creating placeholder icon-512.png"
  convert public/favicon.ico -resize 512x512 public/icon-512.png 2>/dev/null || :
  # If convert (ImageMagick) is not available, copy favicon as placeholder
  if [ ! -f public/icon-512.png ]; then
    cp public/favicon.ico public/icon-512.png
  fi
fi

if [ ! -f public/maskable-icon.png ]; then
  echo "Creating placeholder maskable-icon.png"
  cp public/favicon.ico public/maskable-icon.png
fi

if [ ! -f public/apple-touch-icon.png ]; then
  echo "Creating placeholder apple-touch-icon.png"
  cp public/favicon.ico public/apple-touch-icon.png
fi

# Build the app
echo "Building app with production base path /wav-track/"
npm run build

# Ensure the app is built to the correct path
echo "Creating subdirectory structure for /wav-track/"
mkdir -p dist/wav-track
cp -r dist/{assets,index.html,*.js,*.css,*.svg,manifest*} dist/wav-track/ 2>/dev/null || :

# Copy static assets explicitly
echo "Copying favicon and static assets"
cp -f public/favicon.ico dist/
cp -f public/favicon.ico dist/wav-track/
cp -f public/favicon.svg dist/ 2>/dev/null || :
cp -f public/favicon.svg dist/wav-track/ 2>/dev/null || :
cp -f public/apple-touch-icon.png dist/ 2>/dev/null || :
cp -f public/apple-touch-icon.png dist/wav-track/ 2>/dev/null || :
cp -f public/icon-192.png dist/ 2>/dev/null || :
cp -f public/icon-192.png dist/wav-track/ 2>/dev/null || :
cp -f public/icon-512.png dist/ 2>/dev/null || :
cp -f public/icon-512.png dist/wav-track/ 2>/dev/null || :
cp -f public/maskable-icon.png dist/ 2>/dev/null || :
cp -f public/maskable-icon.png dist/wav-track/ 2>/dev/null || :
cp -f public/og-image.png dist/ 2>/dev/null || :
cp -f public/og-image.png dist/wav-track/ 2>/dev/null || :
cp -f public/manifest.json dist/ 2>/dev/null || :
cp -f public/manifest.json dist/wav-track/ 2>/dev/null || :

# Create .nojekyll file to prevent GitHub Pages issues
touch dist/.nojekyll

# Copy _redirects file to root and add favicon redirect
echo "Setting up redirects"
echo "/wav-track/* /wav-track/index.html 200" > dist/_redirects
echo "/wav-track /wav-track/index.html 200" >> dist/_redirects
echo "/favicon.ico /favicon.ico 200" >> dist/_redirects
echo "/icon-*.png /icon-:splat.png 200" >> dist/_redirects
echo "/apple-touch-icon.png /apple-touch-icon.png 200" >> dist/_redirects
echo "/maskable-icon.png /maskable-icon.png 200" >> dist/_redirects

echo "Build completed successfully!" 