/* Entry point
 * Purpose: Mount React app with i18n
 * Deps: react, react-dom, i18n, App
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './lib/i18n';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
