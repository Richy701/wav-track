import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ProjectsPage from '@/pages/ProjectsPage'
import { Toaster } from 'sonner'
import Navigation from '@/components/layout/Navigation'

export default function App() {
  return (
    <Router>
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <main className="relative">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_50%_at_50%_50%,rgba(56,189,248,0.06)_0%,rgba(56,189,248,0)_100%)]" />
          <Routes>
            <Route path="/" element={<ProjectsPage />} />
            {/* Add other routes here */}
          </Routes>
        </main>
        <Toaster />
      </div>
    </Router>
  )
} 