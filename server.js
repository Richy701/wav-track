import express from 'express';
import compression from 'compression';
import { handler as ssrHandler } from './dist/server/entry-server.js';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 3000;

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
    res.setHeader('Cache-Control', 'no-cache, must-revalidate');
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

// Serve static files from dist with appropriate headers
app.use(express.static('dist/client', {
  etag: true, // Enable ETag
  lastModified: true, // Enable Last-Modified
  setHeaders: (res, path) => {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
  }
}));

// Handle SSR
app.use('*', async (req, res) => {
  try {
    const url = req.originalUrl;
    const template = fs.readFileSync(
      path.resolve('dist/client/index.html'),
      'utf-8'
    );
    
    const rendered = await ssrHandler(url, {
      request: req,
      response: res,
      template
    });
    
    res.status(200).set({ 'Content-Type': 'text/html' }).end(rendered);
  } catch (e) {
    console.error(e);
    res.status(500).end('Internal Server Error');
  }
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 