
import express from 'express';
import compression from 'compression';
import { handler as ssrHandler } from './dist/server/entry-server.js';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 8080;
const BASE_URL = '/wav-track';

// Compression middleware
app.use(compression());

// Cache Control Middleware
const cacheControl = (req, res, next) => {
  // Assets with hash in filename (JS, CSS, images)
  if (req.url.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)(\?.*)?$/)) {
    const longCache = req.url.includes('-') || req.url.includes('chunk-');
    if (longCache) {
      // Cache for 1 year
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else {
      // Cache for 24 hours
      res.setHeader('Cache-Control', 'public, max-age=86400, must-revalidate');
    }
  }
  
  // HTML and JSON responses
  else if (req.url.match(/\.(html|json)$/)) {
    // No cache for HTML and JSON
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.setHeader('Clear-Site-Data', '"cache"');
  }
  
  // Service Worker
  else if (req.url.match(/sw\.js$/)) {
    // No cache for service worker
    res.setHeader('Cache-Control', 'no-store');
  }
  
  // API responses
  else if (req.url.startsWith('/api/')) {
    // Cache for 5 minutes, must revalidate
    res.setHeader('Cache-Control', 'public, max-age=300, must-revalidate');
  }
  
  next();
};

// Apply cache control
app.use(cacheControl);

// Redirect root to /wav-track/
app.get('/', (req, res) => {
  res.redirect(BASE_URL);
});

// Serve static files from dist with appropriate headers
app.use(BASE_URL, express.static('dist/client', {
  etag: true, // Enable ETag
  lastModified: true, // Enable Last-Modified
  setHeaders: (res, path) => {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    
    // For HTML files, set no-cache
    if (path.endsWith('.html')) {
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
    }
  }
}));

// Handle SSR with base URL
app.use('*', async (req, res) => {
  try {
    const url = req.originalUrl;
    
    // If the URL doesn't start with the base URL, redirect
    if (!url.startsWith(BASE_URL)) {
      return res.redirect(BASE_URL + url);
    }
    
    // Remove the base URL from the path for SSR
    const pathWithoutBase = url.replace(BASE_URL, '') || '/';
    
    const template = fs.readFileSync(
      path.resolve('dist/client/index.html'),
      'utf-8'
    );
    
    const rendered = await ssrHandler(pathWithoutBase, {
      request: req,
      response: res,
      template
    });
    
    // Set cache control for HTML content
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    res.status(200).set({ 'Content-Type': 'text/html' }).end(rendered);
  } catch (e) {
    console.error(e);
    res.status(500).end('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}${BASE_URL}`);
});
