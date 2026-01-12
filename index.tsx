
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

// Robust PWA Service Worker Registration
const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      // Determine the correct relative path for the sw.js file
      // In some environments, a leading ./ is problematic with strict origin checks
      const swUrl = new URL('./sw.js', import.meta.url).href;
      
      // Only attempt registration if origins match to avoid the reported error
      if (new URL(swUrl).origin === window.location.origin) {
        const registration = await navigator.serviceWorker.register('./sw.js');
        console.log('Bankai SW registered:', registration.scope);
      } else {
        console.warn('Bankai: Service Worker skipped due to origin mismatch in this environment.');
      }
    } catch (err) {
      // Silent fail for SW - PWA features are progressive and shouldn't break the app
      console.warn('Bankai SW registration skipped or failed:', err);
    }
  }
};

window.addEventListener('load', registerServiceWorker);

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
