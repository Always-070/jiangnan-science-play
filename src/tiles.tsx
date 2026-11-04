import React from 'react';
import { createRoot } from 'react-dom/client';
import './base.css';
import { SteroidTileAtlas } from './contents/steroid-tile-atlas';

createRoot(document.getElementById('root')!).render(
  <React.StrictMode><SteroidTileAtlas /></React.StrictMode>,
);
