import React from 'react';
import ReactDOM from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = `${process.env.PUBLIC_URL}/sw.js`;
    navigator.serviceWorker.register(swUrl)
      .then(registration => {
        console.log('SW registered:', registration.scope);
      })
      .catch(error => {
        console.log('SW registration failed:', error);
      });
  });
}

const rootElement = document.getElementById('root');

if (rootElement.hasChildNodes()) {
  const root = ReactDOM.hydrateRoot(
    rootElement,
    <React.StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </React.StrictMode>
  );
} else {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </React.StrictMode>
  );
}