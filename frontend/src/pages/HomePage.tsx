import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getEvents, Event } from '../services/api'
import { useTheme } from '../contexts/ThemeContext'
import { formatDate, compareDates } from '../utils/dateUtils'
import '../styles/custom.css'

// Remove unused icons
const RUNNING_QUOTES = [
  {
    quote: "The miracle isn't that I finished. The miracle is that I had the courage to start.",
    author: "John Bingham"
  },
  {
    quote: "Running is the greatest metaphor for life, because you get out of it what you put into it.",
    author: "Oprah Winfrey"
  },
  {
    quote: "Pain is temporary. Quitting lasts forever.",
    author: "Lance Armstrong"
  }
]

export default function HomePage() {
  const { isDarkMode } = useTheme()
  const { data: events = [] } = useQuery<Event[]>({
    queryKey: ['events'],
    queryFn: getEvents,
  })

  // Get the next 3 upcoming events
  const upcomingEvents = events
    .sort((a, b) => compareDates(a.date, b.date))
    .slice(0, 3)

  return (
    <div className={`events-gradient-bg ${isDarkMode ? 'dark' : ''}`}>
      <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-3xl" />
      
      <div className="absolute inset-0 overflow-auto">
        {/* Hero Section */}
        <section className="relative min-h-[90vh] flex items-center">
          {/* Background shapes */}
          <div className="absolute inset-0 overflow-hidden">
            <div className="fluid-shape fluid-shape-1"></div>
            <div className="fluid-shape fluid-shape-2"></div>
            <div className="fluid-shape fluid-shape-3"></div>
            <div className="fluid-shape fluid-shape-4"></div>
            <div className="fluid-shape fluid-shape-5"></div>
          </div>

          {/* Content */}
          <div className="relative w-full max-w-7xl mx-auto px-6 py-20 text-center">
            <p className="text-lg text-gray-800 dark:text-gray-200 font-medium tracking-wider uppercase mb-6 animate-fade-up">
              India's Premier Running Hub
            </p>
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-display font-bold text-gray-900 dark:text-white mb-8 animate-fade-up">
              Discover Your Next Run
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-12 animate-fade-up">
              Explore a comprehensive list of marathons, half-marathons, trail runs, and fun runs across India. 
              Lace up and achieve your personal best!
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-6 animate-fade-up">
              <Link 
                to="/events"
                className="btn btn-primary text-lg px-8 py-4 rounded-full hover:scale-105 transition-transform"
              >
                Browse All Events
              </Link>
              <a 
                href="#upcoming-events"
                className="text-gray-800 dark:text-gray-200 bg-white/10 backdrop-blur text-lg px-8 py-4 rounded-full hover:bg-white/20 transition-colors"
              >
                Upcoming Races
              </a>
            </div>
          </div>
        </section>

        {/* Quotes Section */}
        <section className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-16 text-gray-900 dark:text-white">
              Words to Run By
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {RUNNING_QUOTES.map((item) => (
                <div
                  key={item.quote}
                  className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 shadow-lg hover-card-animation hover-shine hover-run-animation hover-border-pulse"
                >
                  <blockquote className="text-xl font-display text-gray-800 dark:text-gray-100 italic mb-6">
                    "{item.quote}"
                  </blockquote>
                  <p className="text-right text-gray-600 dark:text-gray-400">— {item.author}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Events Section */}
        <section id="upcoming-events" className="py-24 px-6">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-16 text-gray-900 dark:text-white">
              On The Horizon
            </h2>
            
            {upcomingEvents.length > 0 ? (
              <div className="grid md:grid-cols-3 gap-8">
                {upcomingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl overflow-hidden shadow-lg hover-card-animation hover-gradient-border hover-shine hover-run-animation hover-border-pulse"
                  >
                    <div className="bg-gradient-to-r from-primary-600 to-secondary-500 dark:from-primary-500 dark:to-secondary-400 p-6 text-white">
                      <time className="text-sm font-medium">
                        {formatDate(event.date)}
                      </time>
                    </div>
                    <div className="p-6">
                      <div className="mb-4">
                        <p className="text-sm font-medium text-primary-600 dark:text-primary-400 uppercase">
                          {event.categories.join(', ')}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {event.source} / {event.location}
                        </p>
                      </div>
                      <Link to={`/events/${event.id}`}>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                          {event.title}
                        </h3>
                      </Link>
                      <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                        <span className="font-medium text-gray-800 dark:text-gray-300">
                          {event.price || 'Check Site'}
                        </span>
                        <a
                          href={event.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-primary text-sm px-6 py-2 rounded-full"
                        >
                          Register Now
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 text-center text-gray-500 dark:text-gray-400">
                No upcoming events match the criteria right now. Check back soon!
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
} 
