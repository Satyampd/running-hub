import { Link } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';

// Social Media Icons
const TwitterIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
  </svg>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
  </svg>
);

const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

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