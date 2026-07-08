import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css' //points to the css file for styling
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)