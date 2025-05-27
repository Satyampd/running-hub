import React, { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { debounce } from 'lodash';

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

const ClubsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const { data: clubs = [], isLoading, error } = useQuery<RunningClub[]>({
    queryKey: ['clubs'],
    queryFn: async () => {
      try {
        const response = await api.get('/clubs');
        return response.data;
      } catch (error: any) {
        throw new Error(error?.response?.data?.message || 'Failed to load running clubs');
      }
    },
  });

  // Debounce the search term update
  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => {
      setDebouncedSearchTerm(value);
    }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    debouncedSetSearchTerm(e.target.value);
  };

  const filteredClubs = clubs.filter((club: RunningClub) => {
    const matchesSearch = 
      club.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      club.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
      club.location.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
    const matchesLocation = !selectedLocation || club.location === selectedLocation;
    const matchesSkillLevel = !selectedSkillLevel || club.skill_level === selectedSkillLevel;
    return matchesSearch && matchesLocation && matchesSkillLevel;
  });

  const uniqueLocations = Array.from(new Set(clubs.map((club: RunningClub) => club.location))).sort();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
            Running Clubs
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300 sm:mt-4">
            Find your perfect running group and connect with fellow runners in your area
          </p>
          <Link
            to="/submit-club"
            className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Register Your Club
          </Link>
        </div>

        <div className="mt-12 max-w-5xl mx-auto">
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search Clubs
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={handleSearchChange}
                    placeholder="Search by name, location, or description"
                    className="block w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Location
                  </label>
                  <select
                    value={selectedLocation}
                    onChange={(e) => setSelectedLocation(e.target.value)}
                    className="block w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                  >
                    <option value="">All Locations</option>
                    {uniqueLocations.map((location: string) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Filter by Level
                  </label>
                  <select
                    value={selectedSkillLevel}
                    onChange={(e) => setSelectedSkillLevel(e.target.value)}
                    className="block w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                  >
                    <option value="">All Levels</option>
                    <option value="beginner">Beginner Friendly</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                    <option value="all">All Levels Welcome</option>
                  </select>
                </div>
              </div>

              {isLoading ? (
                <div className="text-center py-12">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                  <p className="mt-2 text-gray-500 dark:text-gray-400">Loading clubs...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12 text-red-600 dark:text-red-400">
                  Error loading clubs. Please try again later.
                </div>
              ) : filteredClubs.length === 0 ? (
                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  No running clubs found matching your criteria.
                </div>
              ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {filteredClubs.map((club: RunningClub) => (
                    <div
                      key={club.id}
                      className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
                    >
                      <div className="p-6">
                        <div className="flex items-center mb-4">
                          {club.logo_url ? (
                            <img
                              src={club.logo_url}
                              alt={`${club.name} logo`}
                              className="h-12 w-12 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                              <span className="text-blue-600 dark:text-blue-300 text-lg font-bold">
                                {club.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div className="ml-4">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {club.name}
                            </h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              {club.location}
                            </p>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
                            {club.description}
                          </p>
                          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                            <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
                              {club.skill_level}
                            </span>
                            <span className="mx-2">•</span>
                            <span>{club.group_size}</span>
                          </div>
                          {club.meeting_times.length > 0 && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              <span className="font-medium">Meets:</span>{' '}
                              {club.meeting_times[0]}
                            </div>
                          )}
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <span className="font-medium">Fee:</span> {club.membership_fee}
                          </div>
                        </div>
                        <Link
                          to={`/clubs/${club.id}`}
                          className="mt-4 block text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubsPage; 