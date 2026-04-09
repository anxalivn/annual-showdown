import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import RulesPage from './RulesPage.tsx'
import RequirementsPage from './RequirementsPage.tsx'

function Root() {
  const [currentPage, setCurrentPage] = useState<'home' | 'rules' | 'requirements'>('home')

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1)
      if (hash === 'rules') {
        setCurrentPage('rules')
      } else if (hash === 'requirements') {
        setCurrentPage('requirements')
      } else {
        setCurrentPage('home')
      }
    }

    window.addEventListener('hashchange', handleHashChange)
    handleHashChange() // Initial page based on current hash

    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  if (currentPage === 'rules') return <RulesPage />
  if (currentPage === 'requirements') return <RequirementsPage />
  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
