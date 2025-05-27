import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '../services/api';

interface RunningClub {
  id: string;
  name: string;
  location: string;
  address: string;
  description: string;
  established_year: string;
  meeting_times: string[];
  contact_email: string;
  contact_phone: string;
  website_url: string;
  social_media: {
    instagram: string;
    facebook: string;
    strava: string;
  };
  membership_fee: string;
  skill_level: string;
  typical_routes: string;
  group_size: string;
  logo_url?: string;
  photos: string[];
  amenities: string[];
}

const ClubDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const { data: club, isLoading, error } = useQuery<RunningClub>({
    queryKey: ['club', id],
    queryFn: async () => {
      const response = await api.get(`/clubs/${id}`);
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-gray-500 dark:text-gray-400">Loading club details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !club) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-red-600 dark:text-red-400">
            Error loading club details. Please try again later.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            to="/clubs"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Clubs
          </Link>
        </div>

        {/* Club Header */}
        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden mb-8">
          <div className="p-6 sm:p-8">
            <div className="flex items-center">
              {club.logo_url ? (
                <img
                  src={club.logo_url}
                  alt={`${club.name} logo`}
                  className="h-24 w-24 rounded-full object-cover"
                />
              ) : (
                <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <span className="text-blue-600 dark:text-blue-300 text-3xl font-bold">
                    {club.name.charAt(0)}
                  </span>
                </div>
              )}
              <div className="ml-6">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{club.name}</h1>
                <p className="text-xl text-gray-500 dark:text-gray-400">{club.location}</p>
                {club.established_year && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                    Established in {club.established_year}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About the Club</h2>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{club.description}</p>
            </div>

            {/* Meeting Times & Location */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Meeting Details</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Meeting Times:</h3>
                  <ul className="mt-2 space-y-2">
                    {club.meeting_times.map((time, index) => (
                      <li key={index} className="text-gray-600 dark:text-gray-400">{time}</li>
                    ))}
                  </ul>
                </div>
                {club.address && (
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Meeting Location:</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{club.address}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Routes & Group Info */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Running Information</h2>
              <div className="space-y-4">
                {club.typical_routes && (
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Typical Routes:</h3>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">{club.typical_routes}</p>
                  </div>
                )}
                <div className="flex items-center space-x-4">
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Skill Level:</h3>
                    <span className="mt-2 inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm">
                      {club.skill_level}
                    </span>
                  </div>
                  {club.group_size && (
                    <div>
                      <h3 className="font-medium text-gray-700 dark:text-gray-300">Group Size:</h3>
                      <p className="mt-2 text-gray-600 dark:text-gray-400">{club.group_size}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Photos Gallery */}
            {club.photos.length > 0 && (
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Club Photos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {club.photos.map((photo, index) => (
                    <img
                      key={index}
                      src={photo}
                      alt={`${club.name} photo ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact Information */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Email:</h3>
                  <a
                    href={`mailto:${club.contact_email}`}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {club.contact_email}
                  </a>
                </div>
                {club.contact_phone && (
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Phone:</h3>
                    <a
                      href={`tel:${club.contact_phone}`}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {club.contact_phone}
                    </a>
                  </div>
                )}
                {club.website_url && (
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Website:</h3>
                    <a
                      href={club.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      Visit Website
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Social Media */}
            {(club.social_media.instagram || club.social_media.facebook || club.social_media.strava) && (
              <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Social Media</h2>
                <div className="space-y-4">
                  {club.social_media.instagram && (
                    <a
                      href={club.social_media.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <span className="mr-2">Instagram</span>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>
                      </svg>
                    </a>
                  )}
                  {club.social_media.facebook && (
                    <a
                      href={club.social_media.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <span className="mr-2">Facebook</span>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                      </svg>
                    </a>
                  )}
                  {club.social_media.strava && (
                    <a
                      href={club.social_media.strava}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      <span className="mr-2">Strava Club</span>
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7.008 13.828h4.172"/>
                      </svg>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Membership & Amenities */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Membership</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-700 dark:text-gray-300">Fee:</h3>
                  <p className="text-gray-600 dark:text-gray-400">{club.membership_fee}</p>
                </div>
                {club.amenities.length > 0 && (
                  <div>
                    <h3 className="font-medium text-gray-700 dark:text-gray-300">Amenities:</h3>
                    <ul className="mt-2 space-y-1">
                      {club.amenities.map((amenity, index) => (
                        <li key={index} className="text-gray-600 dark:text-gray-400">
                          • {amenity}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubDetailPage; 