import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/variables.css'
import './styles/global.css'
import './styles/animations.css'
import './styles/topbar.css'
import './styles/controls.css'
import './styles/grid.css'
import './styles/multiplier.css'
import './styles/history.css'
import './styles/popup.css'
import './styles/modal.css'
import './styles/responsive.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
