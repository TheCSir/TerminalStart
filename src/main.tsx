import React from 'react';
import ReactDOM from 'react-dom/client';
import App from '@/App';

// Import Styles and Fonts
import '@/index.css';
import '@fontsource/jetbrains-mono';
import '@fontsource/vt323';
import 'dseg/css/dseg.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);