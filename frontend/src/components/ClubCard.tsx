
// src/components/ClubCard.tsx
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
}

interface ClubCardProps {
  club: RunningClub;
  index: number; // For animation delay
}

const ClubCard: React.FC<ClubCardProps> = ({ club, index }) => {
  return (
    <div className="animate-slide-in-bottom" style={{ animationDelay: `${index * 50}ms` }}>
      <div className={`${animatedGlassCard} group h-full flex flex-col`}> {/* h-full and flex flex-col are key here */}
        <div className="p-6 flex flex-col flex-grow"> {/* flex-grow ensures this part fills available space */}
          {/* Logo and Name/Location Header */}
          <div className="flex items-center mb-4">
            {club.logo_url ? (
              <img
                src={club.logo_url}
                alt={`${club.name} logo`}
                className="h-12 w-12 rounded-full object-cover shadow-sm mr-4"
              />
            ) : (
              <div className="h-12 w-12 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center mr-4">
                <span className="text-primary-600 dark:text-primary-300 text-xl font-bold">
                  {club.name.charAt(0)}
                </span>
              </div>
            )}
            <div>
              <Link to={`/clubs/${club.id}`}>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors duration-300">
                  {club.name}
                </h3>
              </Link>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {club.location}
              </p>
            </div>
          </div>

          {/* Description and Details */}
          {/* Added a min-h-[3rem] (adjust as needed) to give some consistent space, 
              even if the description is short. line-clamp-3 is also very helpful. */}
          <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 flex-grow min-h-[3.75rem]"> {/* min-h for 3 lines of text */}
            {club.description || 'No description available.'} {/* Fallback text */}
          </p>

          <div className="space-y-2 mt-auto"> {/* mt-auto pushes this block to the bottom */}
            {/* Skill Level Tag */}
            <div className="flex items-center">
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300">
                {club.skill_level.charAt(0).toUpperCase() + club.skill_level.slice(1)}
              </span>
            </div>

            {/* Meeting Times */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <ClockIcon />
              <span className="font-medium">Meets:</span>{' '}
              {club.meeting_times.length > 0 ? club.meeting_times[0] : 'N/A'}
            </div>

            {/* Group Size */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <UsersIcon />
              <span className="font-medium">Group Size:</span>{' '}
              {club.group_size || 'N/A'}
            </div>

            {/* Membership Fee */}
            <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
              <PriceIcon />
              <span className="font-medium">Fee:</span> {club.membership_fee || 'N/A'}
            </div>
          </div>

          {/* View Details Button */}
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