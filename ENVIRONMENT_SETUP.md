# Environment Setup

This document explains how to set up environment variables for the WavTrack application.

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

### Supabase Configuration
```bash
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Getting Started

1. **Create a `.env` file** in the root directory with your Supabase credentials

2. **Get your Supabase credentials** from your Supabase project dashboard

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

## Notes

- The `.env` file is ignored by git for security
- All environment variables must be prefixed with `VITE_` to be accessible in the frontend
- Email functionality has been removed for now 