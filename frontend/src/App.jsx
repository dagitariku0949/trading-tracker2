import React from 'react'
import { HashRouter as Router, Routes, Route } from 'react-router-dom'
import Dashboard from './pages/Dashboard'
import AdminPage from './pages/AdminPage'
import { LearningProvider } from './contexts/LearningContext'

export default function App() {
  console.log('App component loaded - HashRouter active')
  return (
    <LearningProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
    </LearningProvider>
  )
}
