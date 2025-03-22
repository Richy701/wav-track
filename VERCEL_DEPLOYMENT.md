# Deploying to Vercel

This guide will help you successfully deploy this Vite + React + Supabase application to Vercel.

## Prerequisites

1. A Supabase project with necessary tables and authentication set up
2. A Vercel account connected to your GitHub repository

## Environment Variables

Make sure to set these environment variables in your Vercel project settings:

- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anonymous/public key

These can be found in your Supabase dashboard under Project Settings > API.

## Deployment Settings

In Vercel, ensure:

1. **Framework Preset**: Vite
2. **Build Command**: `npm run build` (default)
3. **Output Directory**: `dist` (default)
4. **Install Command**: `npm install` (default)

## Troubleshooting

If you experience a white screen after deployment:

1. Check Vercel deployment logs for build errors
2. Ensure all environment variables are correctly set
3. Verify that Supabase permissions allow access from your deployed domain
4. Look for CORS-related errors in your browser console

## CORS Configuration

In your Supabase project, add the following URL to your CORS allowed origins:

- `https://your-vercel-app-name.vercel.app`
- Any custom domains you're using

This can be found in Supabase dashboard under Project Settings > API > CORS.

## Project Structure

This project has been configured with:

- SPA routing through Vercel rewrites
- Error boundaries for API failures
- Proper loading states during initialization
- Improved dark/light theme persistence

For additional help, refer to the Vercel and Supabase documentation. 