import React from 'react';
import { createRoot } from 'react-dom/client';
import '@fontsource-variable/inter';
import '@fontsource/jetbrains-mono/400.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource-variable/material-symbols-outlined';
import 'leaflet/dist/leaflet.css';
import './styles/tokens.css';
import './styles/app.css';
import './styles/map.css';
import './styles/routing.css';
import './styles/demo.css';
import App from './app/App';

createRoot(document.getElementById('root')).render(<React.StrictMode><App /></React.StrictMode>);
