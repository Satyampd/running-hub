import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation } from 'react-router-dom'
import { useTheme } from '../contexts/ThemeContext'
import Footer from '../components/Footer'
import { MoonIcon, SunIcon, MenuIcon, CloseIcon } from '../components/Icons'

export default function MainLayout() {
  const { isDarkMode, toggleDarkMode } = useTheme()
  const location = useLocation()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Events', path: '/events' },
    { name: 'Clubs', path: '/clubs' },
    { name: 'Submit Event', path: '/submit-event' },
    { name: 'Submit Club', path: '/submit-club' },
    { name: 'About Us', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ]

  return (
    <div className={`flex flex-col min-h-screen ${isDarkMode ? 'dark' : ''}`}>
      {/* Background Shapes */}
      <div className="fixed inset-0 overflow-hidden -z-10 pointer-events-none">
        <div className="fluid-shape fluid-shape-1"></div>
        <div className="fluid-shape fluid-shape-2"></div>
        <div className="fluid-shape fluid-shape-3"></div>
        <div className="fluid-shape fluid-shape-4"></div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'py-2' : 'py-4'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`${
            scrolled 
              ? 'bg-white/80 dark:bg-gray-900/80 shadow-lg backdrop-blur-lg border border-gray-200/30 dark:border-gray-700/30' 
              : 'bg-transparent'
          } rounded-2xl px-4 py-3 transition-all duration-300`}>
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Link 
                  to="/" 
                  className="flex items-center gap-2 text-xl font-bold transition-colors duration-200"
                >
                  <span className="inline-block w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 grid place-items-center text-white font-bold text-xl">RH</span>
                  <span className="text-gradient text-xl font-bold">Running Hub</span>
                </Link>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex md:items-center md:space-x-1">
                {navLinks.map((link) => (
                  <Link 
                    key={link.path}
                    to={link.path} 
                    className={`relative px-4 py-2 text-base font-medium transition-all duration-200 rounded-lg ${
                      location.pathname === link.path 
                        ? 'text-primary-600 dark:text-primary-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-gradient-to-r after:from-primary-500 after:to-secondary-500' 
                        : 'text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100/50 dark:hover:bg-gray-800/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                ))}
                
                <button
                  onClick={toggleDarkMode}
                  className="p-2 ml-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <SunIcon /> : <MoonIcon />}
                </button>
              </div>
              
              {/* Mobile Navigation Button */}
              <div className="flex items-center md:hidden">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 mr-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300"
                  aria-label="Toggle dark mode"
                >
                  {isDarkMode ? <SunIcon /> : <MoonIcon />}
                </button>
                <button
                  onClick={toggleMenu}
                  className="p-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 rounded-full hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-300"
                  aria-label="Toggle menu"
                >
                  {isMenuOpen ? <CloseIcon /> : <MenuIcon />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <div
          className={`md:hidden bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg mx-4 mt-2 rounded-xl border border-gray-200/50 dark:border-gray-700/50 shadow-xl overflow-hidden transition-all duration-300 ${
            isMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link) => (
              <Link 
                key={link.path}
                to={link.path}
                className={`block px-3 py-2 rounded-lg text-base font-medium ${
                  location.pathname === link.path 
                    ? 'text-white bg-gradient-to-r from-primary-600 to-secondary-500'
                    : 'text-gray-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50/50 dark:hover:bg-gray-700/50'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 w-full">
        <Outlet />
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  )
} 