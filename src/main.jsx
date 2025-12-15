import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AppProvider } from './context/userContext.jsx'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Auth from './components/Auth.jsx'
import Navbar from "./components/Navbar.jsx"
import TodoDetails from './components/todoDetails.jsx'
import AcceptInvitation from '@/components/AcceptInvitation.jsx'
import Profile from './components/Profile.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path='/auth' element={
            <>
              <Navbar />
              <Auth />
            </>
          } />
          <Route path='/todo/:todoId' element={
            <>
              <Navbar />
              <TodoDetails />
            </>
          } />
          <Route path='/invite' element={<AcceptInvitation />} />
          <Route path='/profile' element={
            <>
              <Navbar />
              <Profile />
            </>
          } />
        </Routes>
      </BrowserRouter>
    </AppProvider>
  </StrictMode>,
)
