import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';
import { Event } from '../services/api';

const EVENT_IMAGES = [
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-2.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-3.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-4.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image.jpeg'
];

// Add this helper function before the EventCard component
const getRandomImageUrl = () => {
  const randomIndex = Math.floor(Math.random() * EVENT_IMAGES.length);
  return EVENT_IMAGES[randomIndex];
};

// Icons
const CalendarIcon = () => (
  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

const ArrowIcon = () => (
  <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
  </svg>
);

// Extended event interface that includes optional description
interface ExtendedEvent extends Event {
  description?: string;
}

interface EventCardProps {
  event: ExtendedEvent;
  index?: number;
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  return (
    <div 
      className="glassmorphism-card group relative w-full h-[500px] overflow-hidden rounded-2xl bg-white/70 dark:bg-gray-800/50 backdrop-blur-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 hover-card-animation hover-shine hover-border-pulse border border-white/30 dark:border-gray-700/30"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Colorful top notch based on event type */}
      <div className="absolute -top-1 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500"></div>

      <div className="relative h-48 w-full overflow-hidden">
        {/* Background image */}
        <img 
          src={getRandomImageUrl()} 
          alt={event.title} 
          className="absolute inset-0 w-full h-full object-cover"
        />
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

        {/* Event date and location */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center space-x-2 text-white mb-2">
            <CalendarIcon />
            <time className="text-sm font-medium">{formatDate(event.date)}</time>
          </div>
          <div className="flex items-center space-x-2 text-white/80">
            <LocationIcon />
            <span className="text-sm">{event.location}</span>
          </div>
        </div>
      </div>


      {/* Content */}
      <div className="p-5 flex flex-col h-[calc(100%-12rem)]">
        {/* Categories */}
        <div className="flex flex-wrap gap-2 mb-3">
          {event.categories.map((category, idx) => (
            <span 
              key={idx} 
              className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300"
            >
              {category}
            </span>
          ))}
        </div>
        
        {/* Title */}
        <Link to={`/events/${event.id}`}>
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {event.title}
          </h3>
        </Link>
        
        {/* Description */}
        <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
          {event.description || 'Join us for this exciting running event! Participate and challenge yourself.'}
        </p>
        
        {/* Source and price */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
          <span>Source: {event.source}</span>
          <span className="font-medium text-gray-800 dark:text-gray-300">{event.price || 'Check website'}</span>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          <Link
            to={`/events/${event.id}`}
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium text-sm inline-flex items-center"
          >
            <span>View Details</span>
            <span className="ml-1 transform group-hover:translate-x-1 transition-transform duration-200">
              <ArrowIcon />
            </span>
          </Link>
          
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:opacity-90 transition-all shadow-sm hover:shadow-md"
          >
            Register
          </a>
        </div>
      </div>
      
      {/* Hover effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-500/20 dark:group-hover:border-primary-400/20 rounded-2xl transition-colors duration-300 pointer-events-none"></div>
    </div>
  );
} 