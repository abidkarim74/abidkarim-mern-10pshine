import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import App from './App.tsx'
import { AuthProvider } from './context/authContext.tsx';
import { NotificationProvider } from './context/notificationContext.tsx'
import { SearchProvider } from './context/searchContext.tsx'


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <SearchProvider>
          <NotificationProvider>
            <App />
          </NotificationProvider>
        </SearchProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
//`http://localhost:8080` + note.creator.profile_pic