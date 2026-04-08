import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { TimerProvider } from './context/TimerContext'
import { AppProvider } from './context/AppContext'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AppProvider>
        <TimerProvider>
          <App />
        </TimerProvider>
      </AppProvider>
    </BrowserRouter>
  </StrictMode>,
)
