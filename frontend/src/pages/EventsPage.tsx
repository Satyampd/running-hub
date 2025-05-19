import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { getEvents, Event } from '../services/api'
import { useTheme } from '../contexts/ThemeContext'
import { formatDate } from '../utils/dateUtils'
import '../styles/custom.css'

// Icons (simple SVGs as components)
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 dark:text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 dark:text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 7.998.654a.75.75 0 01.752.752V6.69a.75.75 0 01-.34.632l-4.072 3.29a.75.75 0 00-.34.633v4.037c0 .19-.08.37-.214.504l-2.21 2.056a.75.75 0 01-1.062-.006l-2.198-2.05a.75.75 0 01-.217-.506V11.343a.75.75 0 00-.34-.632L3.6 7.422a.75.75 0 01-.34-.632V4.406a.75.75 0 01.752-.752C6.545 3.232 9.245 3 12 3z" />
  </svg>
);

export default function EventsPage() {
  const { isDarkMode } = useTheme()
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<string>('')

  const { data: allEvents = [], isLoading: isLoadingAllEvents, error: allError } = useQuery<Event[]>({
    queryKey: ['allEvents'],
    queryFn: getEvents,
  })

  // Memoize categories and locations from all fetched events
  const { categories, locations } = useMemo(() => {
    const categoriesSet = new Set<string>()
    const locationsSet = new Set<string>()
    allEvents.forEach((event: Event) => {
      event.categories.forEach((category: string) => categoriesSet.add(category))
      locationsSet.add(event.location)
    })
    return {
      categories: Array.from(categoriesSet).sort(),
      locations: Array.from(locationsSet).sort(),
    }
  }, [allEvents])

  // Memoize filtered events based on search and select states
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event: Event) => {
      const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !selectedCategory || event.categories.includes(selectedCategory)
      const matchesLocation = !selectedLocation || event.location.toLowerCase().includes(selectedLocation.toLowerCase())
      return matchesSearch && matchesCategory && matchesLocation
    })
  }, [allEvents, searchTerm, selectedCategory, selectedLocation])

  if (isLoadingAllEvents) {
    return (
      <div className={`events-gradient-bg ${isDarkMode ? 'dark' : ''}`}>
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-3xl" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center text-gray-500 dark:text-gray-400">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600 dark:border-primary-400 mb-4" />
            <p className="text-lg">Loading your running adventures...</p>
          </div>
        </div>
      </div>
    )
  }

  if (allError) {
    return (
      <div className={`events-gradient-bg ${isDarkMode ? 'dark' : ''}`}>
        <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-3xl" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex flex-col items-center text-center px-4">
            <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-2">Oops! Something went wrong.</h2>
            <p className="text-gray-600 dark:text-gray-300">We couldn't load the events. Please check your connection or try again later.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`events-gradient-bg ${isDarkMode ? 'dark' : ''}`}>
      <div className="absolute inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-3xl" />
      
      <div className="absolute inset-0 overflow-auto">
        <div className="min-h-full w-full px-4 py-12 md:py-16">
          <header className="mb-10 md:mb-12 text-center">
            <h1 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white mb-3">
              Find Your Perfect Run
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Filter through categories and locations to discover events that match your pace.
            </p>
          </header>

          <section className="mb-10 md:mb-12 max-w-7xl mx-auto">
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-6 md:p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
                <div className="relative">
                  <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Search by Name
                  </label>
                  <div className="absolute inset-y-0 left-0 pl-3 pt-7 flex items-center pointer-events-none">
                    <SearchIcon />
                  </div>
                  <input
                    type="text"
                    id="search"
                    className="input pl-10 w-full"
                    placeholder="E.g., Mumbai Marathon"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Filter by Category
                  </label>
                  <select
                    id="category"
                    className="input w-full appearance-none"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category: string) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Filter by Location
                  </label>
                  <select
                    id="location"
                    className="input w-full appearance-none"
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                  >
                    <option value="">All Locations</option>
                    {locations.map((location: string) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          <section className="max-w-7xl mx-auto">
            {filteredEvents.length > 0 ? (
              <div className="grid gap-8 md:gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filteredEvents.map((event: Event, index: number) => (
                  <div
                    key={event.id}
                    className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg overflow-hidden group flex flex-col h-full transition-all duration-300 hover:shadow-2xl hover-run-animation hover-border-pulse animate-fade-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-start justify-between mb-3">
                        <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                          {event.categories.join(', ') || 'General'}
                        </span>
                        <time className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded">
                          {formatDate(event.date)}
                        </time>
                      </div>

                      <Link to={`/events/${event.id}`} className="block mb-3">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-200 leading-snug">
                          {event.title}
                        </h3>
                      </Link>
                      
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 flex-shrink-0">
                        {event.location} <span className="mx-1">•</span> {event.source}
                      </p>
                      
                      <div className="mt-auto flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <span className="text-md font-semibold text-gray-800 dark:text-gray-200">
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
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-lg p-10 text-center">
                <FilterIcon />
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mt-4 mb-2">No Events Found</h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Try adjusting your filters or check back later for new events.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  )
} 