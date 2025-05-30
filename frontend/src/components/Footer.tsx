import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { TwitterIcon, InstagramIcon, FacebookIcon } from './Icons'; // Import icons

// Social Media Icons (These are now moved to Icons.tsx)
// const TwitterIcon = () => (...)
// const InstagramIcon = () => (...)
// const FacebookIcon = () => (...)

export default function Footer() {
  const { isDarkMode } = useTheme();
  
  return (
    <footer className="w-full mt-auto bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
      {/* Decorative top gradient wave */}
      <div className="relative h-16 overflow-hidden">
        <div className="absolute inset-0 h-32 bg-gradient-to-b from-transparent via-primary-500/10 to-primary-500/20 blur-xl" />
      </div>
      
      {/* Main footer content */}
      <div className="bg-gradient-to-b from-gray-50/80 to-gray-100/80 dark:from-gray-900/80 dark:to-gray-950/80 backdrop-blur-sm pt-16 pb-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-6 gap-10">
            {/* Logo and description section */}
            <div className="col-span-1 md:col-span-3">
              <Link to="/" className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-secondary-500 grid place-items-center text-white font-bold text-xl">
                  RH
                </div>
                <span className="text-xl font-bold text-gradient">Running Hub</span>
              </Link>
              <p className="mt-4 text-gray-600 dark:text-gray-400">
                India's premier platform for discovering running events across the country. Find your next marathon, trail run, or fun run.
              </p>
              
              {/* Social media links */}
              <div className="mt-6 flex space-x-4">
                <a href="#" className="text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <TwitterIcon />
                  <span className="sr-only">Twitter</span>
                </a>
                <a href="#" className="text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <InstagramIcon />
                  <span className="sr-only">Instagram</span>
                </a>
                <a href="#" className="text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                  <FacebookIcon />
                  <span className="sr-only">Facebook</span>
                </a>
              </div>
            </div>
            
            {/* Navigation columns */}
            <div className="md:col-span-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Explore
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/events" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    Events
                  </Link>
                </li>
                <li>
                  <Link to="/clubs" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    Running Clubs
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    Blog
                  </a>
                </li>
              </ul>
            </div>
            
            <div className="md:col-span-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Legal
              </h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/terms" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    Terms of Use
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-600 dark:text-gray-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
            
            {/* Newsletter */}
            {/* <div className="col-span-1 md:col-span-1">
              <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider mb-4">
                Subscribe
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Get notified about upcoming events
              </p>
              <form className="flex flex-col space-y-2">
                <div className="relative">
                  <input
                    type="email"
                    placeholder="Your email"
                    className="w-full px-4 py-2 bg-white/50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 dark:focus:ring-primary-400 dark:focus:border-primary-400 transition-all"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-500 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all font-medium shadow-sm hover:shadow-md"
                >
                  Subscribe
                </button>
              </form>
            </div> */}
          </div>
          
          {/* Bottom copyright section */}
          <div className="mt-12 pt-8 border-t border-gray-200/50 dark:border-gray-700/50 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Running Hub. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-200">
                Privacy Policy
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-200">
                Terms of Service
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-900 dark:hover:text-gray-200">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 