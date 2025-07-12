import { useState } from 'react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

export default function NavigationHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="absolute inset-x-0 top-0 z-50">
      <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5">
            <span className="sr-only">WavTrack</span>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent">
              WavTrack
            </h1>
          </Link>
        </div>
        <div className="flex lg:hidden">
          <button 
            type="button" 
            className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-gray-700"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
        <div className="hidden lg:flex lg:gap-x-12">
          <Link to="/features" className="text-sm/6 font-semibold text-gray-900 dark:text-white px-3 py-2 rounded-md transition hover:bg-zinc-100 dark:hover:bg-zinc-800">Product</Link>
          <Link to="/features" className="text-sm/6 font-semibold text-gray-900 dark:text-white px-3 py-2 rounded-md transition hover:bg-zinc-100 dark:hover:bg-zinc-800">Features</Link>
          <Link to="/marketplace" className="text-sm/6 font-semibold text-gray-900 dark:text-white px-3 py-2 rounded-md transition hover:bg-zinc-100 dark:hover:bg-zinc-800">Marketplace</Link>
          <Link to="/about" className="text-sm/6 font-semibold text-gray-900 dark:text-white px-3 py-2 rounded-md transition hover:bg-zinc-100 dark:hover:bg-zinc-800">Company</Link>
        </div>
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <Link to="/login" className="text-sm/6 font-semibold text-gray-900 dark:text-white">
            Log in <span aria-hidden="true">&rarr;</span>
          </Link>
        </div>
      </nav>
      
      {/* Mobile menu, show/hide based on menu open state. */}
      <div className={cn("lg:hidden", isMobileMenuOpen ? "block" : "hidden")} role="dialog" aria-modal="true">
        {/* Background backdrop, show/hide based on slide-over state. */}
        <div className="fixed inset-0 z-50"></div>
        <div className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white dark:bg-black px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
          <div className="flex items-center justify-between">
            <Link to="/" className="-m-1.5 p-1.5">
              <span className="sr-only">WavTrack</span>
              <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-[#8257E5] to-[#B490FF] bg-clip-text text-transparent">
                WavTrack
              </h1>
            </Link>
            <button 
              type="button" 
              className="-m-2.5 rounded-md p-2.5 text-gray-700 dark:text-gray-300"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="sr-only">Close menu</span>
              <svg className="size-6" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true" data-slot="icon">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="mt-6 flow-root">
            <div className="-my-6 divide-y divide-gray-500/10">
              <div className="space-y-2 py-6">
                <Link to="/features" className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">Product</Link>
                <Link to="/features" className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">Features</Link>
                <Link to="/marketplace" className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">Marketplace</Link>
                <Link to="/about" className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">Company</Link>
              </div>
              <div className="py-6">
                <Link to="/login" className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800">Log in</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
} 