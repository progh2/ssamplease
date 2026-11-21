import React from 'react';
import ReactDOM from 'react-dom/client';
import './i18n';
import './styles.css';
import { GameShell } from './components/GameShell';

ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><GameShell /></React.StrictMode>);
