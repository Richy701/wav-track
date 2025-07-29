# Environment Setup Guide

To fix the module import errors, you need to set up your environment variables. Create a `.env` file in the root directory with the following variables:

## Required Environment Variables

### Supabase Configuration
```
VITE_SUPABASE_URL=your_supabase_url_here
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### Payment Service (Lemon Squeezy)
```
VITE_LEMON_SQUEEZY_STORE_ID=your_lemonsqueezy_store_id_here
```

### AI Services
```
VITE_OPENAI_API_KEY=your_openai_api_key_here
```

### Audio Analysis Services
```
VITE_AUDD_API_TOKEN=your_audd_api_token_here
VITE_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
VITE_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here
```

### Music Services
```
VITE_GENIUS_API_TOKEN=your_genius_api_token_here
```

### Development Settings
```
VITE_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Quick Fix for Development

If you just want to get the app running for development, you can create a minimal `.env` file with placeholder values:

```bash
# Create .env file
touch .env

# Add minimal configuration
echo "VITE_SUPABASE_URL=https://placeholder.supabase.co" >> .env
echo "VITE_SUPABASE_ANON_KEY=placeholder_key" >> .env
```

This will allow the app to start without the module import errors, though some features won't work until you add real API keys.

**Note**: Email functionality has been replaced with console logging for development purposes.

## Getting Real API Keys

1. **Supabase**: Create a project at https://supabase.com
2. **OpenAI**: Get API key from https://platform.openai.com
3. **Lemon Squeezy**: Create store at https://lemonsqueezy.com

After setting up the `.env` file, restart your development server:

```bash
npm run dev
```