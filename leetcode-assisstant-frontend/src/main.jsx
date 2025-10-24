import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import PopUp from './popup/PopUp.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
   <PopUp />
  </StrictMode>,
)
