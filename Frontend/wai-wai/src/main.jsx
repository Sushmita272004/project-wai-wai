import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'

// =======================================================
// 1. FOUNDATION STYLES (CRITICAL: Must load FIRST)
// =======================================================
import './index.css' 
import './styles/variables.css'       // Defines colors & spacing
import './styles/globals.css'         // Base resets
import './styles/design-system.css'   // Shared buttons & inputs
import './responsive.css'             // Global media queries

// =======================================================
// 2. GLOBAL COMPONENT STYLES
// =======================================================
import './styles/auth-global.css'           
import './styles/navbar-global.css'         
import './styles/footer-global.css'
import './styles/footer-mobile.css'   // <--- Renamed file

// =======================================================
// 3. PAGE SPECIFIC STYLES
// =======================================================
import './styles/home-page.css'             
import './styles/parser.css'          // <--- Renamed file
import './styles/dashboard.css'       // <--- Renamed file
import './styles/generator.css'       // <--- Renamed file
import './styles/analytics.css'       // <--- Renamed file
import './styles/notifications.css'   // <--- Renamed file

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)