
// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEvents, Event } from '../services/api';
import { compareDates } from '../utils/dateUtils';
import '../styles/custom.css';
import PageContainer from '../components/PageContainer';
import { useEffect, useRef, useState } from 'react';
import { cityImages, PREDEFINED_EVENT_CATEGORIES, MAJOR_CITIES } from '../config/constants';
import EventCard from '../components/EventCard';
import ClubCard from '../components/ClubCard'; 
import api from '../services/api'; 
import { CalendarIcon, UsersIcon } from '../components/Icons';

interface AnimatedElementProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

const FadeInWhenVisible: React.FC<AnimatedElementProps> = ({ 
  children, delay = 0, className = "" 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const domRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    
    const currentElement = domRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }
    
    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  return (
    <div
      ref={domRef}
      className={`transition-all duration-700 ${
        isVisible
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10"
      } ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

interface ExtendedEvent extends Event {
  description?: string;
}

interface RunningClub {
  id: string;
  name: string;
  location: string;
  description: string;
  skill_level: string;
  logo_url?: string;
  meeting_times: string[];
  membership_fee: string;
  group_size: string;
}

export default function HomePage() {
  const { data: events = [] } = useQuery<ExtendedEvent[]>({
    queryKey: ['events'],
    queryFn: getEvents,
  });

  const { data: clubs = [], isLoading: isLoadingClubs, error: clubsError } = useQuery<RunningClub[]>({
    queryKey: ['clubs'],
    queryFn: async () => {
      try {
        const response = await api.get('/clubs');
        return response.data;
      } catch (error: any) {
        throw new Error(error?.response?.data?.message || 'Failed to load running clubs');
      }
    },
  });
  
  // Sort upcoming events by date, show up to 8 for marquee
  const upcomingEvents = events
    .sort((a, b) => compareDates(a.date, b.date))
    .slice(0, 8);

  const featuredClubs = clubs.slice(0, 3);

  // Calculate event counts per city for major cities only
  const eventCountsByCity = MAJOR_CITIES.reduce((acc, city) => {
    const count = events.filter(event => event.location.toLowerCase() === city.toLowerCase()).length;
    if (count > 0) {
      acc[city] = count;
    }
    return acc;
  }, {} as Record<string, number>);

  // Top 6 cities sorted descending by event count
  const topCities = Object.entries(eventCountsByCity)
    .sort(([, countA], [, countB]) => countB - countA)
    .slice(0, 6)
    .map(([city]) => city);

  // Calculate event counts per category
  const eventCountsByCategory = PREDEFINED_EVENT_CATEGORIES.reduce((acc, category) => {
    const count = events.filter(event => event.categories.includes(category)).length;
    if (count > 0) {
      acc[category] = count;
    }
    return acc;
  }, {} as Record<string, number>);

  // Duplicate events for smooth marquee scrolling
  const scrollingEvents = [...upcomingEvents, ...upcomingEvents];

  return (
    <PageContainer>
      <div className="relative min-h-screen flex flex-col pt-16">

          <section className="relative min-h-[30vh] flex items-center justify-center text-center overflow-hidden">
          {/* Background image takes full screen within this section */}
          <div className="absolute inset-0 z-0">
            
          {/* <img src="https://bitsdroid.com/wp-content/uploads/2025/06/RunnersHigh-Kolkata.jpeg" alt="Runzaar - Running Events In India"
              className="w-full h-full object-cover object-center opacity-20 dark:opacity-10"
            /> */}
            {/* Added a subtle gradient overlay to ensure text readability */}
            {/* <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent"></div> */}
          </div>

          {/* Hero Content - Centered */}
          <div className="relative z-10 pt-24 pb-16 px-4 sm:px-6 max-w-7xl mx-auto"> {/* Added padding-top to push content below assumed fixed navbar */}
            <FadeInWhenVisible delay={0}>
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold text-gray-900 dark:text-white leading-tight mb-4 tracking-tight animate-fade-in-up">
                Your Next Run Starts <span className="text-gradient">Here</span>
              </h1>
            </FadeInWhenVisible>
            <FadeInWhenVisible delay={200}>
              <p className="text-lg sm:text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-8 animate-fade-in-up-delay">
                Discover local running events, join vibrant running clubs, and connect with the running community.
              </p>
            </FadeInWhenVisible>
            <FadeInWhenVisible delay={400}>
              <div className="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up-delay-more">
                <Link
                  to="/events"
                  className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-full shadow-lg text-white bg-primary-600 hover:bg-primary-700 transition-colors transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <CalendarIcon className="w-5 h-5 mr-2" /> Find Events
                </Link>
                <Link
                  to="/clubs"
                  className="inline-flex items-center px-8 py-3 border border-primary-600 dark:border-primary-400 text-base font-medium rounded-full shadow-lg text-primary-600 dark:text-primary-400 bg-white dark:bg-gray-800 hover:bg-primary-50 dark:hover:bg-gray-700 transition-colors transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  <UsersIcon className="w-5 h-5 mr-2" /> Discover Clubs
                </Link>
              </div>
            </FadeInWhenVisible>
          </div>
        </section>

        {/* Events Section on Top */}
        <section className="py-8 sm:py-12 px-4 sm:px-6 relative overflow-hidden bg-gradient-to-b from-transparent to-gray-50/50 dark:to-gray-900/50">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-10 gap-4">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight text-center sm:text-left">
                Upcoming <span className="text-gradient">Events</span>
              </h2>
              <Link 
                to="/events"
                className="inline-flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 font-medium group bg-white/50 dark:bg-gray-800/50 rounded-lg px-4 py-2 sm:bg-transparent sm:p-0"
              >
                <span>View All Events</span>
                <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="marquee-container rounded-xl overflow-hidden bg-white/50 dark:bg-gray-800/50 backdrop-blur-xl p-4">
                <div className="marquee-track">
                  {scrollingEvents.map((event, index) => (
                    <div 
                      key={`${event.id}-${index}`} 
                      className="flex-shrink-0 w-[280px] sm:w-[300px] md:w-[340px] px-2 sm:px-3"
                    >
                      <EventCard event={event} index={index % upcomingEvents.length} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 text-center text-gray-500 dark:text-gray-400 shadow-lg border border-white/30 dark:border-gray-700/30">
                <div className="flex flex-col items-center">
                  <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mb-2 text-lg font-medium">No upcoming events right now</p>
                  <p>Check back soon for new events or browse our past events</p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Cities Section Below Events */}
        <section id="browse-by-city" className="py-8 sm:py-12 px-4 sm:px-6 relative">
          <FadeInWhenVisible>
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight mb-6 sm:mb-8 text-center">
                Find Events in <span className="text-gradient">Your City</span>
              </h2>
              <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-4 sm:gap-6 overflow-x-auto pb-6 sm:pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-primary-500/70 scrollbar-track-primary-500/20 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                {topCities.map((city, index) => (
                  <FadeInWhenVisible key={city} delay={index * 100} className="w-full sm:w-[180px] md:w-[220px] snap-start">
                    <Link 
                      to={`/events?location=${encodeURIComponent(city)}`} 
                      className="group block relative rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 aspect-[4/5] sm:aspect-[3/4]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-10"></div>
                      <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${cityImages[city as keyof typeof cityImages]})`}}></div>
                      <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20">
                        <h3 className="text-white font-semibold text-lg sm:text-xl">{city}</h3>
                        <p className="text-white text-sm sm:text-base">{eventCountsByCity[city]} upcoming event{eventCountsByCity[city] > 1 ? 's' : ''}</p>
                      </div>
                    </Link>
                  </FadeInWhenVisible>
                ))}
              </div>
            </div>
          </FadeInWhenVisible>
        </section>

        {/* Clubs Section - Made responsive */}
        <section id="featured-clubs" className="py-8 sm:py-12 px-4 sm:px-6 relative bg-gradient-to-b from-gray-50/50 to-transparent dark:from-gray-900/50 dark:to-transparent">
          <FadeInWhenVisible>
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-10 gap-4">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-gray-900 dark:text-white tracking-tight text-center sm:text-left">
                  Featured <span className="text-gradient">Clubs</span>
                </h2>
                <Link
                  to="/clubs"
                  className="inline-flex items-center justify-center gap-2 text-primary-600 dark:text-primary-400 font-medium group bg-white/50 dark:bg-gray-800/50 rounded-lg px-4 py-2 sm:bg-transparent sm:p-0"
                >
                  <span>View All Clubs</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>

              {isLoadingClubs ? (
                 <div className="flex flex-col items-center justify-center py-12">
                 <div className="relative w-16 h-16 mb-4">
                   <div className="animate-ping absolute inset-0 rounded-full bg-primary-400 opacity-75"></div>
                   <div className="relative rounded-full w-16 h-16 bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
                     <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                       <path d="M17.618 5.968l1.453-1.453 1.414 1.414-1.453 1.453a9 9 0 11-1.414-1.414zM12 20a7 7 0 100-14 7 7 0 000 14zM11 8v6h6v-2h-4V8h-2z"></path>
                     </svg>
                   </div>
                 </div>
                 <p className="text-lg font-medium text-gradient">Finding clubs...</p>
               </div>
              ) : clubsError ? (
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 text-center text-red-500 dark:text-red-400 shadow-lg border border-white/30 dark:border-gray-700/30">
                  <p>Failed to load clubs. Please try again later.</p>
                </div>
              ) : featuredClubs.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredClubs.map((club, index) => (
                    <FadeInWhenVisible key={club.id} delay={index * 100}>
                      <ClubCard club={club} index={index} />
                    </FadeInWhenVisible>
                  ))}
                </div>
              ) : (
                <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 text-center text-gray-500 dark:text-gray-400 shadow-lg border border-white/30 dark:border-gray-700/30">
                  <div className="flex flex-col items-center">
                    <svg className="w-16 h-16 text-gray-400 dark:text-gray-600 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h2a2 2 0 002-2V7a2 2 0 00-2-2h-2.586a1 1 0 01-.707-.293l-1.414-1.414A1 1 0 0012.586 3h-5.172a1 1 0 00-.707.293L4.293 5.707A1 1 0 013.586 6H2a2 2 0 00-2 2v10a2 2 0 002 2h2"></path>
                    </svg>
                    <p className="mb-2 text-lg font-medium">No clubs to display right now</p>
                    <p>Check back soon for new clubs or register your own!</p>
                  </div>
                </div>
              )}
            </div>
          </FadeInWhenVisible>
        </section>

        {/* Categories Section - Made responsive */}
        <section id="explore-categories" className="py-8 sm:py-12 px-4 sm:px-6 relative">
          <FadeInWhenVisible>
            <div className="max-w-7xl mx-auto">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-display font-bold text-center mb-6 sm:mb-12 text-gray-900 dark:text-white tracking-tight">
                Explore by <span className="text-gradient">Category</span>
              </h2>
              <div className="grid grid-cols-2 sm:flex sm:flex-nowrap gap-4 sm:gap-6 overflow-x-auto pb-6 sm:pb-4 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-primary-500/70 scrollbar-track-primary-500/20 scrollbar-thumb-rounded-full scrollbar-track-rounded-full">
                {Object.entries(eventCountsByCategory).map(([category, count], index) => (
                  <FadeInWhenVisible key={category} delay={index * 100} className="w-full sm:w-[180px] md:w-[200px] snap-start">
                    <Link 
                      to={`/events?category=${encodeURIComponent(category)}`} 
                      className="group glassmorphism-card p-4 sm:p-5 rounded-2xl bg-white/70 dark:bg-gray-800/50 backdrop-blur-xl shadow-lg hover-card-animation hover-shine hover-border-pulse border border-white/30 dark:border-gray-700/30 flex flex-col items-center text-center transition-all duration-300 hover:scale-105 h-full justify-center aspect-square sm:aspect-auto"
                    >
                      <div className="p-3 rounded-full bg-primary-500/20 dark:bg-primary-400/20 mb-3 sm:mb-4 group-hover:bg-primary-500/30 transition-colors">
                        <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary-600 dark:text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M7 7h.01M7 3h5a4 4 0 014 4v5a4 4 0 01-4 4H7a4 4 0 01-4-4V7a4 4 0 014-4zm0 0v11h11V7A4 4 0 0012 3H7zM3 21v-2a4 4 0 014-4h5M17 14a1 1 0 11-2 0 1 1 0 012 0z"></path></svg> 
                      </div>
                      <h3 className="text-sm sm:text-base md:text-lg font-semibold text-gray-800 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {category}
                      </h3>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 mt-1 sm:mt-2">
                        {count} Events
                      </p>
                    </Link>
                  </FadeInWhenVisible>
                ))}
              </div>
            </div>
          </FadeInWhenVisible>
        </section>      
      </div>
    </PageContainer>
  );
}
