
// src/pages/HomePage.tsx
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEvents, Event } from '../services/api';
import {  compareDates } from '../utils/dateUtils';
import '../styles/custom.css';
import PageContainer from '../components/PageContainer';
import { useEffect, useRef, useState } from 'react';
import { RunIcon } from '../components/Icons'; // Keep if used elsewhere
import { RUNNING_QUOTES } from '../config/constants';
import EventCard from '../components/EventCard';
import ClubCard from '../components/ClubCard'; // Import the ClubCard component
import api from '../services/api'; // Import your API service to fetch clubs

// For animation effects
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

// Update Event interface to include description property
interface ExtendedEvent extends Event {
  description?: string;
}

// Add RunningClub interface (copy from ClubsPage.tsx or a shared types file)
interface RunningClub {
  id: string;
  name: string;
  location: string;
  description: string;
  skill_level: string; // 'beginner', 'intermediate', 'advanced', 'all'
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

  // Fetch club data
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
  
  // Get the next 3 upcoming events
  const upcomingEvents = events
    .sort((a, b) => compareDates(a.date, b.date))
    .slice(0, 3);

  // Get a few clubs to display (e.g., first 3, or randomly selected)
  // For simplicity, let's take the first 3 clubs if available
  const featuredClubs = clubs.slice(0, 3);


  return (
    <PageContainer>
      <div className="relative min-h-screen flex flex-col">
        {/* Background Elements */}
        <div className="fixed inset-0 -z-10 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-gradient-to-br from-primary-500/30 to-secondary-500/30 blur-3xl" />
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-secondary-500/20 rounded-full translate-x-1/2 -translate-y-1/2 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary-500/20 rounded-full -translate-x-1/2 translate-y-1/2 blur-3xl" />
        </div>
        
        {/* Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-16">
          {/* Content */}
          <div className="relative w-full max-w-7xl mx-auto px-6 py-20 text-center">
            <div className="inline-block animate-bounce-slow mb-6">
              <div className="p-3 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 dark:bg-gray-800/30 dark:border-gray-700/30">
                <RunIcon />
              </div>
            </div>
            
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-display font-bold mb-6 tracking-tighter">
              <span className="text-gradient">Run</span> <span className="dark:text-white">Wild</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-12 leading-relaxed">
              Discover India's most exciting marathons, half-marathons, trail runs and fun runs all in one place.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
              <Link 
                to="/events"
                className="btn-primary text-lg px-8 py-4 rounded-full hover:scale-105 transition-all duration-300 shadow-lg shadow-primary-500/20"
              >
                Discover Events
              </Link>
              <a 
                href="#upcoming-events"
                className="text-gray-800 dark:text-gray-200 bg-white/10 backdrop-blur text-lg px-8 py-4 rounded-full hover:bg-white/20 transition-all border border-white/10 dark:border-gray-800/30"
              >
                Upcoming Races
              </a>
            </div>

            {/* Arrow Down */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 5L12 19M12 19L18 13M12 19L6 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </section>

        {/* Quote Section - Redesigned */}
        <section className="py-24 px-6 relative overflow-hidden">
          <FadeInWhenVisible>
            <div className="max-w-7xl mx-auto">
              <h2 className="text-4xl md:text-5xl font-display font-bold text-center mb-16 text-gray-900 dark:text-white tracking-tight">
                Words to <span className="text-gradient">Inspire</span> Your Run
              </h2>
              <div className="grid md:grid-cols-3 gap-8">
                {RUNNING_QUOTES.map((item, index) => (
                  <FadeInWhenVisible key={index} delay={index * 150}>
                    <div className="glassmorphism-card h-full flex flex-col justify-between p-10 rounded-2xl bg-white/70 dark:bg-gray-800/50 backdrop-blur-xl shadow-xl hover-card-animation hover-shine hover-border-pulse border border-white/30 dark:border-gray-700/30">
                      <div className="text-5xl text-primary-500/30 dark:text-primary-400/30 mb-6">"</div>
                      <blockquote className="text-xl font-display text-gray-800 dark:text-gray-100 mb-8 relative z-10">
                        {item.quote}
                      </blockquote>
                      <div className="mt-auto">
                        <div className="w-12 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 mb-4 rounded-full"></div>
                        <p className="text-right text-gray-600 dark:text-gray-400 font-medium">— {item.author}</p>
                      </div>
                    </div>
                  </FadeInWhenVisible>
                ))}
              </div>
            </div>
          </FadeInWhenVisible>
        </section>

        {/* Events Section - Redesigned */}
        <section id="upcoming-events" className="py-24 px-6 relative">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary-500/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl -z-10"></div>
          
          <FadeInWhenVisible>
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
                <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
                  Upcoming <span className="text-gradient">Events</span>
                </h2>
                <Link 
                  to="/events" 
                  className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium group"
                >
                  <span>View All Events</span>
                  <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </Link>
              </div>
              
              {upcomingEvents.length > 0 ? (
                  <div className="grid md:grid-cols-3 gap-8">
                  {upcomingEvents.map((event, index) => (
                    <FadeInWhenVisible key={event.id} delay={index * 100}>
                      <EventCard event={event} index={index} />
                    </FadeInWhenVisible>
                  ))}
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
          </FadeInWhenVisible>
        </section>

        {/* New Clubs Section */}
        <section id="featured-clubs" className="py-24 px-6 relative">
          {/* Background Elements (optional, can reuse or add new ones) */}
          <div className="absolute top-0 left-0 w-72 h-72 bg-secondary-500/10 rounded-full blur-3xl -z-10"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl -z-10"></div>

          <FadeInWhenVisible>
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-center justify-between mb-16 gap-6">
                <h2 className="text-4xl md:text-5xl font-display font-bold text-gray-900 dark:text-white tracking-tight">
                  Featured <span className="text-gradient">Clubs</span>
                </h2>
                <Link
                  to="/clubs" // Link to your Clubs page
                  className="inline-flex items-center gap-2 text-primary-600 dark:text-primary-400 font-medium group"
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
                <div className="grid md:grid-cols-3 gap-8">
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


        {/* CTA Section - New */}
        <section className="py-24 px-6 relative mb-20">
          <FadeInWhenVisible>
            <div className="max-w-7xl mx-auto">
              <div className="relative overflow-hidden rounded-3xl">
                <div
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: "url('https://bitsdroid.com/wp-content/uploads/2025/05/image-5.jpeg')" }}
              >
              </div>
                <div className="relative p-8 md:p-16 flex flex-col md:flex-row items-center justify-between gap-8">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-display font-bold text-white mb-4">
                      Never Miss a Running Event
                    </h2>
                    <p className="text-white/90 max-w-xl mb-6">
                      Subscribe to our newsletter and stay updated with the latest running events, 
                      training tips, and exclusive promotions.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3 max-w-lg">
                      <input 
                        type="email"
                        placeholder="Enter your email"
                        className="flex-1 px-4 py-3 rounded-lg shadow-inner bg-white/20 backdrop-blur-sm border border-white/30 text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/50 focus:outline-none"
                      />
                      <button className="px-6 py-3 bg-white text-primary-600 rounded-lg font-medium hover:bg-white/90 transition-all shadow-lg hover:shadow-xl">
                        Subscribe
                      </button>
                    </div>
                  </div>
                  <div className="w-full max-w-xs md:max-w-sm">
                    <div className="aspect-square rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center p-8 border border-white/30 animate-float-subtle">
                      <RunIcon />
                      {/* <img src="/image.png" alt="Run Icon" className="w-full h-full object-cover rounded-full" /> */}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </FadeInWhenVisible>
        </section>
      </div>
    </PageContainer>
  )
}