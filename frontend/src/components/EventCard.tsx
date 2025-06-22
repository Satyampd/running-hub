// import { Link } from 'react-router-dom';
// import { formatDate } from '../utils/dateUtils';
// import { Event } from '../services/api';
// import { getRandomEventImage } from '../utils/imageUtils';
// import { animatedGlassCard } from '../styles/commonStyles';
// import { CalendarIcon, LocationIcon } from './Icons';
// import { formatPrice } from '../utils/currencyUtils';

// // Extended event interface that includes optional description
// interface ExtendedEvent extends Event {
//   description?: string;
// }

// interface EventCardProps {
//   event: ExtendedEvent;
//   index?: number;
// }

// export default function EventCard({ event, index = 0 }: EventCardProps) {
//   return (
// <div 
//   className={`${animatedGlassCard} group relative w-full h-auto min-h-[480px] md:h-[460px] flex flex-col`}
//   style={{ animationDelay: `${index * 100}ms` }}
// >
//   {/* Top notch */}
//   <div className="absolute -top-1 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500"></div>

//   {/* Image */}
//   <div className="relative h-48 w-full overflow-hidden">
//     <img 
//       src={getRandomEventImage()} 
//       alt={event.title} 
//       className="absolute inset-0 w-full h-full object-cover"
//     />
//     <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>

//     {/* Date and Location */}
//     <div className="absolute bottom-0 left-0 right-0 p-4">
//       <div className="flex items-center space-x-2 text-white mb-2">
//         <CalendarIcon />
//         <time className="text-sm font-medium">{formatDate(event.date)}</time>
//       </div>
//       <div className="flex items-center space-x-2 text-white/80">
//         <LocationIcon />
//         <span className="text-sm">{event.location}</span>
//       </div>
//     </div>
//   </div>

//   {/* Content */}
//   <div className="p-5 flex flex-col flex-1">
//     {/* Categories */}
//     <div className="flex flex-wrap gap-2 mb-3">
//       {event.categories.map((category, idx) => (
//         <span 
//           key={idx} 
//           className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300"
//         >
//           {category}
//         </span>
//       ))}
//     </div>

//     {/* Title */}
//     <Link to={`/events/${event.id}`}>
//       <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 leading-snug min-h-[3.5rem]">
//         {event.title}
//       </h3>
//     </Link>

//     {/* Source and price */}
//     <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
//       <span>Source: {event.source}</span>
//       <span className="font-medium text-gray-800 dark:text-gray-300">
//         {formatPrice(event.price)}
//       </span>
//     </div>

//     {/* Registration closes */}
//     <div className="text-sm text-gray-700 dark:text-gray-300 mb-4">
//       <span className="font-medium">Registration closes:</span>{' '}
//       {event.registration_closes ? formatDate(event.registration_closes) : <span>Check website</span>}
//     </div>

//     {/* Button at bottom */}
//     <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
//       <a
//         href={event.url}
//         target="_blank"
//         rel="noopener noreferrer"
//         className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:opacity-90 transition-all shadow-sm hover:shadow-md w-full justify-center"
//       >
//         Register
//       </a>
//     </div>
//   </div>

//   {/* Hover border */}
//   <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-500/20 dark:group-hover:border-primary-400/20 rounded-2xl transition-colors duration-300 pointer-events-none"></div>
// </div>
//   );
// } 

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { formatDate } from '../utils/dateUtils';
import { Event } from '../services/api';
import { getRandomEventImage } from '../utils/imageUtils';
import { animatedGlassCard } from '../styles/commonStyles';
import { CalendarIcon, LocationIcon } from './Icons';
import { formatPrice } from '../utils/currencyUtils';

interface ExtendedEvent extends Event {
  description?: string;
  photos?: string[];
}

interface EventCardProps {
  event: ExtendedEvent;
  index?: number;
}

export default function EventCard({ event, index = 0 }: EventCardProps) {
  // Use the first photo if available, otherwise fallback
  const imageUrl = event.photos && event.photos.length > 0 ? event.photos[0] : getRandomEventImage();
  return (
    <article
      className={`${animatedGlassCard} group relative w-full h-auto min-h-[480px] md:h-[460px] flex flex-col rounded-2xl overflow-hidden`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Top notch */}
      <div className="absolute -top-1 left-0 right-0 h-1 bg-gradient-to-r from-primary-500 to-secondary-500" />

      {/* Event Image */}
      <div className="relative h-48 w-full overflow-hidden">
        <img
          src={imageUrl}
          alt={event.title || 'Event image'}
          loading="lazy"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent dark:from-black/80" />
        {/* Gallery indicator if multiple images */}
        {event.photos && event.photos.length > 1 && (
          <div className="absolute top-2 right-2 bg-white/80 dark:bg-gray-900/80 rounded-full px-3 py-1 text-xs text-gray-800 dark:text-gray-200 shadow">
            +{event.photos.length}
          </div>
        )}
        {/* Date & Location */}
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <div className="flex items-center space-x-2 text-white mb-2">
            <CalendarIcon aria-hidden="true" />
            <time className="text-sm font-medium">{formatDate(event.date)}</time>
          </div>
          <div className="flex items-center space-x-2 text-white/80">
            <LocationIcon aria-hidden="true" />
            <span className="text-sm">{event.location}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex flex-col flex-1">
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
        <Link to={`/events/${event.id}`} aria-label={`View details for ${event.title}`}>
          <h3 className="text-[clamp(1.1rem,2vw,1.25rem)] font-bold text-gray-900 dark:text-white mb-3 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors line-clamp-2 leading-snug min-h-[3.5rem]">
            {event.title}
          </h3>
        </Link>

        {/* Source and Price */}
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mb-3">
          <span>Source: {event.source}</span>
          <span className="font-medium text-gray-800 dark:text-gray-300">
            {formatPrice(event.price)}
          </span>
        </div>

        {/* Registration Closes */}
        <div className="text-sm text-gray-700 dark:text-gray-300 mb-4">
          <span className="font-medium">Registration closes:</span>{' '}
          {event.registration_closes ? formatDate(event.registration_closes) : <span>Check website</span>}
        </div>

        {/* Register Button */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <a
            href={event.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Register for ${event.title}`}
            className="inline-flex items-center justify-center w-full px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500 transition-all shadow-sm hover:shadow-md"
          >
            Register
          </a>
        </div>
      </div>

      {/* Hover Border Effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-primary-500/20 dark:group-hover:border-primary-400/20 transition-colors duration-300 pointer-events-none rounded-2xl" />
    </article>
  );
}
