import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import LandingPage from './pages/LandingPage'
import Layout from './pages/Layout'
import Summaries from './pages/Summaries'
import Dashboard from './pages/Dashboard'
import NewsletterPreferences from './pages/Settings'
import TopicSelection from './pages/Selection'
import ContentSourceInput from './pages/Source'
import { AuthProvider } from './contexts/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route index element={<LandingPage />} />
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<NewsletterPreferences />} />
            <Route path="/summaries" element={<TopicSelection />} />
            <Route path="/sources" element={<ContentSourceInput />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  </StrictMode>
)
