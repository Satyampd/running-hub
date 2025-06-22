

import React from 'react';
import { Link } from 'react-router-dom';
import { animatedGlassCard } from '../styles/commonStyles';
import { UsersIcon, ClockIcon, PriceIcon } from './Icons';

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
  photos?: string[];
}

interface ClubCardProps {
  club: RunningClub;
  index: number; // For animation delay
}

const ClubCard: React.FC<ClubCardProps> = ({ club, index }) => {
  const imageUrl = club.photos && club.photos.length > 0
    ? club.photos[0]
    : (club.logo_url || null);

  const bgPatterns = [
    'bg-gradient-to-br from-purple-500 to-indigo-600',
    'bg-gradient-to-br from-pink-500 to-red-500',
    'bg-gradient-to-br from-green-400 to-blue-500',
    'bg-gradient-to-br from-yellow-400 to-orange-500',
  ];

  const placeholderBg = bgPatterns[index % bgPatterns.length];

  return (
    <div
      className="animate-slide-in-bottom h-full"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className={`${animatedGlassCard} group h-full flex flex-col`}>
        {/* Image or placeholder */}
        <div className="h-40 w-full rounded-t-2xl overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={`${club.name} image`}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className={`h-full w-full flex items-center justify-center text-white text-5xl font-bold ${placeholderBg}`}>
              {club.name.charAt(0)}
            </div>
          )}
        </div>

        {/* Card Content */}
        <div className="p-5 flex flex-col flex-grow">
          {/* Title and location */}
          <div className="mb-4">
            <Link to={`/clubs/${club.id}`}>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                {club.name}
              </h3>
            </Link>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {club.location}
            </p>
          </div>

          {/* Description */}
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 min-h-[3.75rem]">
            {club.description || 'No description available.'}
          </p>

          {/* Tags & Info */}
          <div className="space-y-2 mt-auto">
            {/* Skill Level */}
            <div className="flex items-center">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300">
                {club.skill_level.charAt(0).toUpperCase() + club.skill_level.slice(1)}
              </span>
            </div>

            {/* Meeting Times */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <ClockIcon className="mr-2 h-4 w-4" />
              <span className="font-medium">Meets:</span>{' '}
              {club.meeting_times.length > 0 ? club.meeting_times[0] : 'N/A'}
            </div>

            {/* Group Size */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <UsersIcon className="mr-2 h-4 w-4" />
              <span className="font-medium">Group Size:</span>{' '}
              {club.group_size || 'N/A'}
            </div>

            {/* Membership Fee */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <PriceIcon className="mr-2 h-4 w-4" />
              <span className="font-medium">Fee:</span>{' '}
              {club.membership_fee || 'N/A'}
            </div>
          </div>

          {/* Button */}
          <Link
            to={`/clubs/${club.id}`}
            className="mt-6 block text-center px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:opacity-90 transition-all shadow-sm hover:shadow-md"
          >
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ClubCard;
