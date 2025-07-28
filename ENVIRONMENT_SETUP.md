# Environment Setup

This document explains how to set up environment variables for the WavTrack application.

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

### Email Service (Resend)
```bash
# Get your API key from https://resend.com/api-keys
VITE_RESEND_API_KEY=re_your_api_key_here
```

### Supabase Configuration
```bash
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

## Getting Started

1. **Copy the example file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your actual values:**
   - Get a Resend API key from [resend.com](https://resend.com)
   - Get your Supabase credentials from your Supabase project dashboard

3. **Restart your development server:**
   ```bash
   npm run dev
   ```

## Notes

- The `.env` file is ignored by git for security
- If the Resend API key is not provided, email functionality will be disabled gracefully
- All environment variables must be prefixed with `VITE_` to be accessible in the frontend 