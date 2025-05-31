import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getEvents, Event } from '../services/api'
import { compareDates } from '../utils/dateUtils'
import '../styles/custom.css'
import PageContainer from '../components/PageContainer'
import EventCard from '../components/EventCard'
import { SearchIcon, FilterIcon } from '../components/Icons'

// Extended event interface that includes optional description
interface ExtendedEvent extends Event {
  description?: string;
}

export default function EventsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [isFilterVisible, setIsFilterVisible] = useState(false)

  const { data: allEvents = [], isLoading: isLoadingAllEvents, error: allError } = useQuery<ExtendedEvent[]>({
    queryKey: ['allEvents'],
    queryFn: getEvents,
  })

    // Sort all events by date (ascending)
  const sortedAllEvents = useMemo(() => {
    return [...allEvents].sort((a, b) => compareDates(a.date, b.date));
  }, [allEvents]);


  // Memoize categories and locations from all fetched events
  const { categories, locations } = useMemo(() => {
    const categoriesSet = new Set<string>()
    const locationsSet = new Set<string>()
    sortedAllEvents.forEach((event: ExtendedEvent) => {
      event.categories.forEach((category: string) => categoriesSet.add(category))
      locationsSet.add(event.location)
    })
    return {
      categories: Array.from(categoriesSet).sort(),
      locations: Array.from(locationsSet).sort(),
    }
  }, [sortedAllEvents])

  // Memoize filtered events based on search and select states
  // const filteredEvents = useMemo(() => {
  //   return sortedAllEvents.filter((event: ExtendedEvent) => {
  //     const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase())
  //     const matchesCategory = !selectedCategory || event.categories.includes(selectedCategory)
  //     const matchesLocation = !selectedLocation || event.location.toLowerCase().includes(selectedLocation.toLowerCase())
  //     return matchesSearch && matchesCategory && matchesLocation
  //   })
  // }, [sortedAllEvents, searchTerm, selectedCategory, selectedLocation])
  
  const filteredEvents = useMemo(() => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // reset time to start of today

  return sortedAllEvents.filter((event: ExtendedEvent) => {
    const eventDate = new Date(event.date);
    eventDate.setHours(0, 0, 0, 0); // also normalize event date
    const isUpcoming = eventDate >= today;
    const matchesSearch = event.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || event.categories.includes(selectedCategory);
    const matchesLocation = !selectedLocation || event.location.toLowerCase().includes(selectedLocation.toLowerCase());

    return isUpcoming && matchesSearch && matchesCategory && matchesLocation;
  });
}, [sortedAllEvents, searchTerm, selectedCategory, selectedLocation]);

  if (isLoadingAllEvents) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="relative w-20 h-20 mb-6">
            <div className="animate-ping absolute inset-0 rounded-full bg-primary-400 opacity-75"></div>
            <div className="relative rounded-full w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.618 5.968l1.453-1.453 1.414 1.414-1.453 1.453a9 9 0 11-1.414-1.414zM12 20a7 7 0 100-14 7 7 0 000 14zM11 8v6h6v-2h-4V8h-2z"></path>
              </svg>
            </div>
          </div>
          <p className="text-xl font-medium animate-pulse text-gradient">Loading your running adventures...</p>
        </div>
      </PageContainer>
    )
  }

  if (allError) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-2">Oops! Something went wrong.</h2>
          <p className="text-gray-600 dark:text-gray-300">We couldn't load the events. Please check your connection or try again later.</p>
          <button 
            className="mt-6 bg-gradient-to-r from-primary-600 to-secondary-500 hover:opacity-90 transition-opacity text-white px-6 py-2 rounded-lg shadow-lg"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </PageContainer>
    )
  }

  return (
    <PageContainer>
      <div className="min-h-screen w-full px-4 py-12 md:py-16 flex flex-col">
        {/* Background Elements */}
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[70%] h-[50%] bg-gradient-to-br from-primary-500/5 to-secondary-500/10 rounded-[50%] blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[70%] h-[50%] bg-gradient-to-tr from-secondary-500/5 to-primary-500/10 rounded-[50%] blur-3xl"></div>
        </div>
        
        {/* <header className="mb-10 md:mb-16 text-center max-w-3xl mx-auto"> */}
        <header className="mt-7 md:mt-5 mb-10 md:mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-5 tracking-tight">
            <span className="text-gradient">Discover</span> Your <br className="md:hidden" />
            <span className="relative">
              Next Run
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-secondary-500/10"></span>
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Filter through categories and locations to find events that match your pace.
          </p>
        </header>

        <section className="mb-12 md:mb-16 max-w-5xl mx-auto relative w-full">
          {/* Search Bar */}
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl border border-white/20 dark:border-gray-700/20">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                className="bg-white/50 dark:bg-gray-900/50 w-full pl-10 pr-4 py-4 rounded-xl text-lg border border-gray-200/50 dark:border-gray-700/50 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
                placeholder="Search events by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button 
                className="md:hidden absolute inset-y-0 right-0 px-4 flex items-center"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
              >
                <FilterIcon />
              </button>
            </div>
            
            {/* Filters - Desktop */}
            <div className="hidden md:flex mt-6 gap-6">
              <div className="flex-1">
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  id="category"
                  className="bg-white/50 dark:bg-gray-900/50 w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all"
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
              <div className="flex-1">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <select
                  id="location"
                  className="bg-white/50 dark:bg-gray-900/50 w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all"
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
            
            {/* Filters - Mobile */}
            <div className={`md:hidden mt-6 space-y-4 overflow-hidden transition-all duration-300 ${isFilterVisible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div>
                <label htmlFor="category-mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  id="category-mobile"
                  className="bg-white/50 dark:bg-gray-900/50 w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all"
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
                <label htmlFor="location-mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <select
                  id="location-mobile"
                  className="bg-white/50 dark:bg-gray-900/50 w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all"
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

        <section className="max-w-7xl mx-auto w-full flex-grow mb-20">
          {/* Results count and stats */}
          <div className="flex justify-between items-center mb-8 px-2">
            <div>
              <p className="text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">{filteredEvents.length}</span> events found
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {selectedCategory && `Category: ${selectedCategory}`}
              {selectedCategory && selectedLocation && ' • '}
              {selectedLocation && `Location: ${selectedLocation}`}
            </div>
          </div>

          {filteredEvents.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 animate-staggered-fade-in">
              {filteredEvents.map((event: ExtendedEvent, index: number) => (
                <div key={event.id} className="animate-slide-in-bottom h-[500px]" style={{ animationDelay: `${index * 50}ms` }}>
                  <EventCard event={event} index={index} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/20 dark:border-gray-700/20 shadow-xl">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <FilterIcon />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">No Events Found</h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6">
                Try adjusting your filters or check back later for new events.
              </p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedLocation('');
                }}
                className="inline-flex items-center px-6 py-2 rounded-lg text-primary-600 dark:text-primary-400 border border-primary-600/20 dark:border-primary-400/20 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  )
} 