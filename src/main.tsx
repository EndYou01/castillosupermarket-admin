import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// import App from './components/App.tsx'
import { MainRouter } from './routes/MainRouter.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <MainRouter/>
  </StrictMode>,
)
