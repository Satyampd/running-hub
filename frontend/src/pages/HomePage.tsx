import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { getEvents, Event } from '../services/api'
import { formatDate, compareDates } from '../utils/dateUtils'
import '../styles/custom.css'
import PageContainer from '../components/PageContainer'
import { useEffect, useRef, useState } from 'react'
import {getRandomEventImage} from '../utils/imageUtils'


// Icons
const RunIcon = () => (
  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 7.5C16.3807 7.5 17.5 6.38071 17.5 5C17.5 3.61929 16.3807 2.5 15 2.5C13.6193 2.5 12.5 3.61929 12.5 5C12.5 6.38071 13.6193 7.5 15 7.5Z" fill="currentColor"></path>
    <path d="M13.2632 21H11.4C10.8477 21 10.4 20.5523 10.4 20C10.4 19.4477 10.8477 19 11.4 19H13.2632C13.4891 19 13.6993 18.8825 13.8268 18.6938L16.3 15.0884L14.0368 13.6389C13.9743 13.5954 13.9184 13.5416 13.8711 13.4797L11.563 10.3764C11.1815 9.85362 10.5999 9.5 9.9649 9.5H7.29692C6.32836 9.5 5.40213 9.90067 4.73223 10.6001L3 12.3922L4.40001 13.8321C4.7528 14.192 5.31251 14.2037 5.67871 13.8593L6.55341 13.0393C6.69895 12.9036 6.90111 12.8699 7.08508 12.9493C7.26904 13.0287 7.4 13.208 7.4 13.4086V20C7.4 20.5523 7.84772 21 8.4 21C8.95228 21 9.4 20.5523 9.4 20V15.6701C9.4 15.4237 9.58671 15.2179 9.8312 15.1847C10.0757 15.1516 10.3089 15.3097 10.3676 15.5458L11.0947 18.5458C11.2669 19.2547 11.9078 19.7514 12.6404 19.7514H12.6631C13.4224 19.7514 14.0788 19.2142 14.2197 18.4725L14.6059 16.5014C14.652 16.2868 14.8452 16.1356 15.0669 16.1356C15.2339 16.1356 15.389 16.2224 15.476 16.3616L17.8182 20.2178C17.9652 20.4548 18.2248 20.5983 18.5027 20.5983H20.6C21.1523 20.5983 21.6 20.1506 21.6 19.5983C21.6 19.046 21.1523 18.5983 20.6 18.5983H19.0046C18.8354 18.5983 18.6784 18.5093 18.591 18.3658L16.5526 15.0396C16.1499 14.3986 16.1188 13.5983 16.4697 12.9276L16.7368 12.394C17.1323 11.6037 17.8692 11.0519 18.7318 10.898L21 10.5V8.5L18.6993 8.90147C17.2808 9.13496 16.085 9.99612 15.4187 11.2307L15.1515 11.7642C15.0669 11.9335 14.8985 12.0382 14.7143 12.026L12.7396 11.8941C12.3916 11.8705 12.1396 11.5711 12.1897 11.2265L12.4619 9.59853C12.5831 8.7564 13.1477 8.03519 13.9387 7.72731L16.8214 6.39946C17.1555 6.2428 17.3451 5.87458 17.2539 5.51727C17.1628 5.15996 16.8262 4.9211 16.4601 4.97039L13.4062 5.41125C12.4873 5.52803 11.6615 6.01771 11.1032 6.76513L8.34528 10.5698C8.17978 10.789 7.907 10.8939 7.6477 10.8341C7.3884 10.7743 7.19642 10.5593 7.16541 10.2962L6.83652 7.98242C6.79072 7.59179 6.46859 7.29449 6.07609 7.27681L3.4 7.15V9.15L5.24964 9.24286C5.44364 9.25255 5.60889 9.39328 5.64872 9.58288L5.90439 10.8744L6.97368 9.75842C7.94047 8.75634 9.26551 8.2 10.65 8.2H12.2286C12.4034 8.2 12.5661 8.28158 12.6643 8.42051L14.3286 10.8154C14.4555 10.9975 14.4608 11.2392 14.3417 11.4266L13.2632 13H16L17.5625 11L15 7.5" fill="currentColor"></path>
  </svg>
)

const CircleImage = () => (
  <img src="/image.png" alt="Run Icon" className="w-6 h-6 object-contain" />
)

const CalendarIcon = () => (
  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
)

const LocationIcon = () => (
  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
)

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

export default function HomePage() {
  const { data: events = [] } = useQuery<ExtendedEvent[]>({
    queryKey: ['events'],
    queryFn: getEvents,
  });
  
  const scrollerItems = [
    "New Events Weekly!",
    "All India Coverage",
    "Trail Runs & Marathons",
    "Fun Runs Included",
    "Easy Registration",
    "Join Our Community"
  ];

  // Get the next 3 upcoming events
  const upcomingEvents = events
    .sort((a, b) => compareDates(a.date, b.date))
    .slice(0, 3);

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
                      <div className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px] group">
                        <div className="relative h-48 bg-gradient-to-r from-primary-600 to-secondary-500 overflow-hidden">
                          <div className="absolute inset-0 bg-[url('frontend/public/image.png')] opacity-20"></div>
                          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${getRandomEventImage()})` }}></div>
                          <div className="p-6 relative z-10 h-full flex flex-col justify-end">
                            <div className="flex items-center space-x-2 text-white/90">
                              <CalendarIcon />
                              <time className="text-sm font-medium">{formatDate(event.date)}</time>
                            </div>
                            <div className="flex items-center space-x-2 text-white/80 mt-2">
                              <LocationIcon />
                              <span className="text-sm">{event.location}</span>
                            </div>
                          </div>
                          {/* Overlay gradient for text readability */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                        </div>
                        <div className="p-6">
                          <div className="mb-4">
                            <div className="flex flex-wrap gap-2 mb-3">
                              {event.categories.map((category, idx) => (
                                <span key={idx} className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300">
                                  {category}
                                </span>
                              ))}
                            </div>
                            <Link to={`/events/${event.id}`}>
                              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                                {event.title}
                              </h3>
                            </Link>
                            <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-2">
                              {event.description || 'Join us for this exciting running event! Participate and challenge yourself.'}
                            </p>
                          </div>
                          <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                            <span className="font-medium text-gray-800 dark:text-gray-300">
                              {event.price || 'Check Site'}
                            </span>
                            <a
                              href={event.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:opacity-90 transition-all shadow-sm hover:shadow-md"
                            >
                              Register Now
                            </a>
                          </div>
                        </div>
                      </div>
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
        {/* CTA Section - New */}
        <section className="py-24 px-6 relative mb-20">
          <FadeInWhenVisible>
            <div className="max-w-7xl mx-auto">
              <div className="relative overflow-hidden rounded-3xl">
                {/* Background gradient */}
                {/* <div className="absolute inset-0 bg-gradient-to-r from-primary-600 to-secondary-500"></div> */}
                {/* Pattern overlay */}
                {/* <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2220%22%20height%3D%2220%22%20viewBox%3D%220%200%2020%2020%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%3E%3Cg%20fill%3D%22white%22%20fill-opacity%3D%220.05%22%20fill-rule%3D%22evenodd%22%3E%3Ccircle%20cx%3D%223%22%20cy%3D%223%22%20r%3D%223%22%2F%3E%3Ccircle%20cx%3D%2213%22%20cy%3D%2213%22%20r%3D%223%22%2F%3E%3C%2Fg%3E%3C%2Fsvg%3E')] bg-repeat"></div> */}
                {/* since the image and text have similar color, we will have transparent background */}
                <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('/image5.png')" }}>
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

