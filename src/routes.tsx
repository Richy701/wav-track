import { Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'

// Lazy load components
const Login = lazy(() => import('./pages/Login'))
const Register = lazy(() => import('./pages/Register'))
const Index = lazy(() => import('./pages/Index'))
const NotFound = lazy(() => import('./pages/NotFound'))
const PricingTest = lazy(() => import('./pages/PricingTest'))
const PricingNewTest = lazy(() => import('./pages/PricingNewTest'))
const FAQTest = lazy(() => import('./pages/FAQTest'))

export default function AppRoutes() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/pricing-test" element={<PricingTest />} />
        <Route path="/pricing-new-test" element={<PricingNewTest />} />
        <Route path="/faq-test" element={<FAQTest />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  )
}
