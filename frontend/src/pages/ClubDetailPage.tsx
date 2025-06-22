import React, { useState } from 'react';
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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const { data: club, isLoading, error } = useQuery<RunningClub>({
    queryKey: ['club', id],
    queryFn: async () => {
      const response = await api.get(`/clubs/${id}`);
      return response.data;
    },
  });

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX !== null) {
      const touchEndX = e.changedTouches[0].clientX;
      const distance = touchStartX - touchEndX;
      const threshold = 50;

      if (distance > threshold) {
        showNextImage();
      } else if (distance < -threshold) {
        showPrevImage();
      }
    }
  };

  const showNextImage = () => {
    if (selectedIndex !== null && club && selectedIndex < club.photos.length - 1) {
      const nextIndex = selectedIndex + 1;
      setSelectedImage(club.photos[nextIndex]);
      setSelectedIndex(nextIndex);
    }
  };

  const showPrevImage = () => {
    if (selectedIndex !== null && club && selectedIndex > 0) {
      const prevIndex = selectedIndex - 1;
      setSelectedImage(club.photos[prevIndex]);
      setSelectedIndex(prevIndex);
    }
  };

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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <div className="mb-8">
          <Link to="/clubs" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6">
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
                <img src={club.logo_url} alt={`${club.name} logo`} className="h-24 w-24 rounded-full object-cover" />
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
            {/* About the Club */}
            <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">About the Club</h2>
              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-line">{club.description}</p>
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
                      className="w-full h-48 object-cover rounded-lg cursor-pointer"
                      onClick={() => {
                        setSelectedImage(photo);
                        setSelectedIndex(index);
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Meeting Details */}
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

            {/* Running Info */}
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
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Contact */}
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
                <div className="space-y-2">
                  {club.social_media.instagram && (
                    <a href={club.social_media.instagram} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Instagram</a>
                  )}
                  {club.social_media.facebook && (
                    <a href={club.social_media.facebook} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Facebook</a>
                  )}
                  {club.social_media.strava && (
                    <a href={club.social_media.strava} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">Strava</a>
                  )}
                </div>
              </div>
            )}

            {/* Membership */}
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
      </div>

      {/* Image Modal with Swipe and Close Button */}
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
              className="max-h-[90vh] max-w-[90vw] rounded-lg"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
            />
            <button
              className="absolute top-4 right-4 text-white text-3xl font-bold hover:text-gray-300"
              onClick={() => {
                setSelectedImage(null);
                setSelectedIndex(null);
              }}
            >
              &times;
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClubDetailPage;