import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';
import { Event } from '../services/api';
import { getRandomEventImage } from '../utils/imageUtils';
import { animatedGlassCard } from '../styles/commonStyles';
import { CalendarIcon, LocationIcon, ArrowIcon } from './Icons';
import { formatPrice } from '../utils/currencyUtils';

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
      className={`${animatedGlassCard} group relative w-full h-[430px]`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Colorful top notch based on event type */}
      <div className="absolute -top-1 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500"></div>

      <div className="relative h-48 w-full overflow-hidden">
        {/* Background image */}
        <img 
          src={getRandomEventImage()} 
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
        {/* <p className="text-gray-600 dark:text-gray-400 text-sm line-clamp-3 mb-4">
          {event.description || 'Join us for this exciting running event! Participate and challenge yourself.'}
        </p> */}
        
        {/* Source and price */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-4">
          <span>Source: {event.source}</span>
          {/* <span className="font-medium text-gray-800 dark:text-gray-300">{event.price || 'Check website'}</span> */}
          <span className="font-medium text-gray-800 dark:text-gray-300">  {formatPrice(event.price)} </span>
        </div>
        
        {/* Action buttons */}
        <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700 mt-auto">
          {/* <Link
            to={`/events/${event.id}`}
            className="text-primary-600 dark:text-primary-400 hover:underline font-medium text-sm inline-flex items-center"
          >
            <span>View Details</span>
            <span className="ml-1 transform group-hover:translate-x-1 transition-transform duration-200">
              <ArrowIcon />
            </span>
          </Link>
           */}
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