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

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/settings" element={<NewsletterPreferences />} />
          <Route path="/summaries" element={<TopicSelection />} />
          <Route path="/sources" element={<ContentSourceInput />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
