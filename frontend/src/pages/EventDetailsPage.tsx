// // src/pages/EventDetailsPage.tsx
// import { useParams, Link } from 'react-router-dom';
// import { useQuery } from '@tanstack/react-query';
// import { getEventById } from '../services/api';
// import PageContainer from '../components/PageContainer';
// import { formatDate } from '../utils/dateUtils';
// import ImageGalleryModal from '../components/ImageGalleryModal'; 

// type Event = {
//   id: string;
//   title: string;
//   date: string;
//   location: string;
//   categories: string[];
//   price: string;
//   url: string;
//   source: string;
//   description?: string;
//   photos?: string[];
// };

// export default function EventDetailsPage() {
//   const { id } = useParams<{ id: string }>();
//   const { data: event, isLoading, error } = useQuery<Event>({
//     queryKey: ['event', id],
//     queryFn: () => getEventById(id!),
//   });

//   if (isLoading) {
//     return (
//       <PageContainer>
//         <div className="flex items-center justify-center min-h-[400px]">
//           <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
//         </div>
//       </PageContainer>
//     );
//   }

//   if (error || !event) {
//     return (
//       <PageContainer>
//         <div className="flex items-center justify-center min-h-[400px]">
//           <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 text-center">
//             <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">Error loading event details</h3>
//             <p className="mt-2 text-gray-600 dark:text-gray-300">Please try again later.</p>
//           </div>
//         </div>
//       </PageContainer>
//     );
//   }

//   return (
//     <PageContainer>
//       <div className="min-h-full w-full px-4 pt-24 pb-16">
//         <div className="max-w-4xl mx-auto">

//           {/* Back Button */}
//           <Link
//             to="/events"
//             className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8"
//           >
//             <svg
//               className="w-5 h-5 mr-2"
//               fill="none"
//               stroke="currentColor"
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 strokeWidth={2}
//                 d="M15 19l-7-7 7-7"
//               />
//             </svg>
//             Back to Events
//           </Link>

//           {/* Event Details Card */}
//           <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl overflow-hidden shadow-lg hover-card-animation">
//             <div className="px-6 py-8">
//               <div className="mb-6">
//                 <div className="flex items-center justify-between mb-4">
//                   <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
//                     {event.categories.join(', ')}
//                   </span>
//                   <time className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
//                     {formatDate(event.date)}
//                   </time>
//                 </div>
//                 <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
//                   {event.title}
//                 </h1>
//                 <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-8">
//                   <span className="mr-2">Location:</span>
//                   <span className="font-medium">{event.location}</span>
//                   <span className="mx-3">•</span>
//                   <span className="mr-2">Source:</span>
//                   <span className="font-medium">{event.source}</span>
//                 </div>
//               </div>

//               {/* Gallery of event images - Now using ImageGalleryModal */}
//               {event.photos && event.photos.length > 0 && (
//                 <div className="mb-8"> {/* You might have a title here, keeping the div */}
//                     <ImageGalleryModal images={event.photos} altPrefix={`${event.title} photo`} />
//                 </div>
//               )}

//               {/* The Image Modal JSX is now entirely gone from here */}

//               {event.description && (
//                 <div className="mb-8">
//                   <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
//                     Event Details
//                   </h2>
//                   <div className="text-gray-700 dark:text-gray-300 prose prose-sm max-w-none">
//                     {event.description}
//                   </div>
//                 </div>
//               )}

//               <div className="mb-8">
//                 <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
//                   Registration Information
//                 </h2>
//                 <div className="rounded-xl bg-white/70 dark:bg-gray-700/50 p-5">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     <div>
//                       <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Registration Fee</p>
//                       <p className="font-semibold text-lg text-gray-900 dark:text-white">
//                         {event.price || 'Check website'}
//                       </p>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               <div className="mt-8 flex justify-center">
//                 <a
//                   href={event.url}
//                   target="_blank"
//                   rel="noopener noreferrer"
//                   className="btn btn-primary text-lg px-8 py-4 rounded-full hover:scale-105 transition-transform"
//                 >
//                   Register Now
//                 </a>
//               </div>
//             </div>
//           </div>
//           <p className="text-sm mt-4 text-yellow-700 dark:text-yellow-300 font-semibold flex items-start gap-2">
//             <span>
//               Since this website crowdsources data from various sources, please verify the information before taking any action.
//               If you believe any information needs to be updated, feel free to message us on{" "}
//               <a
//                 href="https://instagram.com/runzaar"
//                 target="_blank"
//                 rel="noopener noreferrer"
//                 className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
//               >
//                 Instagram
//               </a>{" "}
//               or email us using the email given on the contact page.
//             </span>
//           </p>
//         </div>
//       </div>
//     </PageContainer>
//   );
// }


import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getEventById } from '../services/api';
import PageContainer from '../components/PageContainer';
import { formatDate } from '../utils/dateUtils';
import ImageGalleryModal from '../components/ImageGalleryModal';
import ReactMarkdown from 'react-markdown';

import { CalendarDaysIcon, MapPinIcon, GlobeAltIcon, ArrowLeftIcon, ArrowRightIcon, LinkIcon, CurrencyRupeeIcon } from '@heroicons/react/24/outline';


// --- ORIGINAL EVENT TYPE (No changes here) ---
type Event = {
  id: string;
  title: string;
  date: string;
  location: string;
  categories: string[];
  price: string;
  url: string;
  source: string;
  description?: string;
  photos?: string[];
};
// ---------------------------------------------


export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: ['event', id],
    queryFn: () => getEventById(id!),
  });

  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </PageContainer>
    );
  }

  if (error || !event) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 text-center">
            <h3 className="text-xl font-semibold text-red-600 dark:text-red-400">Error loading event details</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-300">Please try again later.</p>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="min-h-full w-full px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">

          {/* Back Button */}
          <Link
            to="/events"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mb-8 transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5 mr-2" />
            Back to Events
          </Link>

          {/* Event Details Card */}
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl overflow-hidden shadow-lg hover-card-animation border border-gray-100 dark:border-gray-700">
            <div className="px-6 py-8 md:p-10">

              {/* Header Section: Title, Category, Date */}
              <div className="mb-8 border-b border-gray-200 dark:border-gray-700 pb-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider bg-primary-100 dark:bg-primary-900/30 px-3 py-1 rounded-full shadow-sm">
                    {event.categories.join(', ')}
                  </span>
                  <time className="text-sm text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full flex items-center shadow-sm">
                    <CalendarDaysIcon className="w-4 h-4 mr-1 text-gray-500 dark:text-gray-400" />
                    {formatDate(event.date)}
                  </time>
                </div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-4 leading-tight">
                  {event.title}
                </h1>
                <div className="flex flex-wrap items-center text-sm text-gray-700 dark:text-gray-300 gap-x-6 gap-y-2">
                  <span className="flex items-center">
                    <MapPinIcon className="w-5 h-5 mr-1 text-gray-600 dark:text-gray-400" />
                    <span className="font-semibold">{event.location}</span>
                  </span>
                  <span className="flex items-center">
                    <GlobeAltIcon className="w-5 h-5 mr-1 text-gray-600 dark:text-gray-400" />
                    <span className="font-semibold">{event.source}</span>
                  </span>
                </div>
              </div>

              {/* Image Gallery */}
              {event.photos && event.photos.length > 0 && (
                <div className="mb-8 p-4 bg-gray-50 dark:bg-gray-900 rounded-2xl shadow-inner border border-gray-200 dark:border-gray-700">
                  <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Event Gallery</h2>
                  <ImageGalleryModal images={event.photos} altPrefix={`${event.title} photo`} />
                </div>
              )}

              {/* Event Description */}
              {event.description && (
              <div className="mb-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                  About This Event
                </h2>
                <div className="text-gray-700 dark:text-gray-300 prose prose-lg max-w-none leading-relaxed">
                  <ReactMarkdown>{event.description}</ReactMarkdown>
                </div>
              </div>
            )}


              {/* Registration and Pricing */}
              <div className="mb-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
                  Registration Information
                </h2>
                <div className="rounded-xl bg-white/70 dark:bg-gray-700/50 p-6 shadow-md border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Registration Fee</p>
                      <p className="font-bold text-3xl text-primary-600 dark:text-primary-400 flex items-center">
                        <CurrencyRupeeIcon className="w-7 h-7 mr-2" />
                        {event.price || 'Check website'}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center btn btn-primary text-lg px-8 py-4 rounded-full font-semibold hover:scale-105 transition-transform shadow-lg group"
                    >
                      <LinkIcon className="w-6 h-6 mr-3 group-hover:rotate-6 transition-transform" />
                      Visit Source & Register
                      <ArrowRightIcon className="w-5 h-5 ml-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                    </a>
                  </div>
                </div>
              </div>

            </div> {/* End px-6 py-8 / md:p-10 */}
          </div> {/* End Event Details Card */}

          {/* Disclaimer */}
          <p className="text-sm mt-8 p-4 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300 font-semibold border border-yellow-200 dark:border-yellow-700 flex items-start gap-3 shadow-sm">
            <svg className="w-5 h-5 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M8.257 3.344a1.5 1.5 0 012.986 0l3.054 6.096a1.5 1.5 0 01-1.341 2.052h-5.462a1.5 1.5 0 01-1.341-2.052L8.257 3.344zM10 17a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"></path></svg>
            <span>
              Since this website crowdsources data from various sources, please verify the information before taking any action.
              If you believe any information needs to be updated, feel free to message us on{" "}
              <a
                href="https://instagram.com/runzaar"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
              >
                Instagram
              </a>{" "}
              or email us using the email given on the contact page.
            </span>
          </p>
        </div>
      </div>
    </PageContainer>
  );
}