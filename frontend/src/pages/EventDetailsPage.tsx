
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { getEventById } from '../services/api';
import PageContainer from '../components/PageContainer';
import { formatDate } from '../utils/dateUtils';

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

export default function EventDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { data: event, isLoading, error } = useQuery<Event>({
    queryKey: ['event', id],
    queryFn: () => getEventById(id!),
  });

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX !== null && selectedIndex !== null && event?.photos) {
      const touchEndX = e.changedTouches[0].clientX;
      const distance = touchStartX - touchEndX;
      const threshold = 50;

      if (distance > threshold && selectedIndex < event.photos.length - 1) {
        const nextIndex = selectedIndex + 1;
        setSelectedIndex(nextIndex);
        setSelectedImage(event.photos[nextIndex]);
      } else if (distance < -threshold && selectedIndex > 0) {
        const prevIndex = selectedIndex - 1;
        setSelectedIndex(prevIndex);
        setSelectedImage(event.photos[prevIndex]);
      }
    }
  };

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
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-8"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Back to Events
          </Link>

          {/* Event Details Card */}
          <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl overflow-hidden shadow-lg hover-card-animation">
            <div className="px-6 py-8">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-semibold text-primary-600 dark:text-primary-400 uppercase tracking-wider">
                    {event.categories.join(', ')}
                  </span>
                  <time className="text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-3 py-1 rounded-full">
                    {formatDate(event.date)}
                  </time>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  {event.title}
                </h1>
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-300 mb-8">
                  <span className="mr-2">Location:</span>
                  <span className="font-medium">{event.location}</span>
                  <span className="mx-3">•</span>
                  <span className="mr-2">Source:</span>
                  <span className="font-medium">{event.source}</span>
                </div>
              </div>
              {/* Gallery of event images */}
              {event.photos && event.photos.length > 0 && (
                <div className="mb-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {event.photos.map((photo, idx) => (
                    <img
                      key={idx}
                      src={photo}
                      alt={`${event.title} photo ${idx + 1}`}
                      className="w-full h-64 object-cover rounded-xl shadow cursor-pointer"
                      onClick={() => {
                        setSelectedImage(photo);
                        setSelectedIndex(idx);
                      }}
                    />
                  ))}
                </div>
              )}

              {/* Image Modal */}
              {selectedImage && (
                <div
                  className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
                  onClick={() => {
                    setSelectedImage(null);
                    setSelectedIndex(null);
                  }}
                >
                  <div className="relative" onClick={(e) => e.stopPropagation()}>
                    <img
                      src={selectedImage}
                      alt="Enlarged"
                      className="max-w-[90vw] max-h-[90vh] rounded-lg"
                      onTouchStart={handleTouchStart}
                      onTouchEnd={handleTouchEnd}
                    />
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setSelectedIndex(null);
                      }}
                      className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-300"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              )}

              {event.description && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                    Event Details
                  </h2>
                  <div className="text-gray-700 dark:text-gray-300 prose prose-sm max-w-none">
                    {event.description}
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
                  Registration Information
                </h2>
                <div className="rounded-xl bg-white/70 dark:bg-gray-700/50 p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Registration Fee</p>
                      <p className="font-semibold text-lg text-gray-900 dark:text-white">
                        {event.price || 'Check website'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex justify-center">
                <a
                  href={event.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary text-lg px-8 py-4 rounded-full hover:scale-105 transition-transform"
                >
                  Register Now
                </a>
              </div>
            </div>
          </div>
          <p className="text-sm mt-4 text-yellow-700 dark:text-yellow-300 font-semibold flex items-start gap-2">
            <span>
              Since this website crowdsources data from various sources, please verify the information before taking any action.
              If you believe any information needs to be updated, feel free to message us on{" "}
              <a
                href="https://instagram.com/runzaar"
                target="_blank"
                rel="noopener noreferrer"
                className="underline text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
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
