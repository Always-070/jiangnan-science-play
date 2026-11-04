import React from 'react';
import { createRoot } from 'react-dom/client';
import './base.css';
import { StrainPersonality } from './contents/strain-personality';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode><StrainPersonality /></React.StrictMode>,
);
