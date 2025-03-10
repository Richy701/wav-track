import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Add detailed error logging
window.onerror = function(msg, url, lineNo, columnNo, error) {
  console.error('Global error:', {
    message: msg,
    url: url,
    lineNo: lineNo,
    columnNo: columnNo,
    error: error
  });
  return false;
};

// Register service worker for PWA support
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/wav-track/sw.js').then(registration => {
      console.log('SW registered: ', registration);
    }).catch(registrationError => {
      console.log('SW registration failed: ', registrationError);
    });
  });
}

// Add error boundary
const rootElement = document.getElementById("root");
if (!rootElement) {
  console.error('Root element not found');
  throw new Error('Failed to find the root element');
}

const root = createRoot(rootElement);

try {
  console.log('Starting app render...');
  root.render(<App />);
  console.log('App rendered successfully');
} catch (error) {
  console.error('Failed to render app:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; text-align: center;">
      <h2>Something went wrong</h2>
      <p>Please try refreshing the page</p>
      <p style="color: red; font-size: 12px;">${error instanceof Error ? error.message : 'Unknown error'}</p>
    </div>
  `;
}
