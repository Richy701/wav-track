import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Lazy load components
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Index = lazy(() => import('./pages/Index'))
const NotFound = lazy(() => import('./pages/NotFound'))

const FAQTest = lazy(() => import('./pages/FAQTest'))
const AudioCleanup = lazy(() => import('./pages/AudioCleanup'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/faq-test" element={<FAQTest />} />
        <Route path="/audio-cleanup" element={<AudioCleanup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
