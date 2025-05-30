
import React, { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { debounce } from 'lodash';
import PageContainer from '../components/PageContainer';
import '../styles/custom.css';
import { SearchIcon, FilterIcon } from '../components/Icons';
import { SKILL_LEVELS } from '../config/constants';
import ClubCard from '../components/ClubCard'; // Import the new ClubCard component


interface RunningClub {
  id: string;
  name: string;
  location: string;
  description: string;
  skill_level: string; // 'beginner', 'intermediate', 'advanced', 'all'
  logo_url?: string;
  meeting_times: string[];
  membership_fee: string;
  group_size: string;
}

export default function ClubsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [selectedSkillLevel, setSelectedSkillLevel] = useState('');
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => { /* no-op for now, as searchTerm is direct */ }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

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

  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(clubs.map((club: RunningClub) => club.location))).sort();
  }, [clubs]);

  const filteredClubs = useMemo(() => {
    return clubs.filter((club: RunningClub) => {
      const matchesSearch =
        club.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        club.location.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = !selectedLocation || club.location === selectedLocation;
      const matchesSkillLevel = !selectedSkillLevel || club.skill_level === selectedSkillLevel;
      return matchesSearch && matchesLocation && matchesSkillLevel;
    });
  }, [clubs, searchTerm, selectedLocation, selectedSkillLevel]);


  if (isLoading) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-screen">
          <div className="relative w-20 h-20 mb-6">
            <div className="animate-ping absolute inset-0 rounded-full bg-primary-400 opacity-75"></div>
            <div className="relative rounded-full w-20 h-20 bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
              <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.618 5.968l1.453-1.453 1.414 1.414-1.453 1.453a9 9 0 11-1.414-1.414zM12 20a7 7 0 100-14 7 7 0 000 14zM11 8v6h6v-2h-4V8h-2z"></path>
              </svg>
            </div>
          </div>
          <p className="text-xl font-medium animate-pulse text-gradient">Lacing up to find your club...</p>
        </div>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <div className="flex flex-col items-center justify-center min-h-screen text-center px-4">
          <div className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-semibold text-red-600 dark:text-red-400 mb-2">Oops! Something went wrong.</h2>
          <p className="text-gray-600 dark:text-gray-300">We couldn't load the running clubs. Please check your connection or try again later.</p>
          <button
            className="mt-6 bg-gradient-to-r from-primary-600 to-secondary-500 hover:opacity-90 transition-opacity text-white px-6 py-2 rounded-lg shadow-lg"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="min-h-screen w-full px-4 py-12 md:py-16 flex flex-col">
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[70%] h-[50%] bg-gradient-to-br from-primary-500/5 to-secondary-500/10 rounded-[50%] blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[70%] h-[50%] bg-gradient-to-tr from-secondary-500/5 to-primary-500/10 rounded-[50%] blur-3xl"></div>
        </div>

        <header className="mb-10 md:mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-5 tracking-tight">
            <span className="text-gradient">Discover</span> Your <br className="md:hidden" />
            <span className="relative">
              Crew
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-secondary-500/10"></span>
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Find your perfect running group and connect with fellow runners in your area.
          </p>
          <Link
            to="/submit-club"
            className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary-500/20"
          >
            Register Your Club
          </Link>
        </header>

        <section className="mb-12 md:mb-16 max-w-5xl mx-auto relative w-full">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl border border-white/20 dark:border-gray-700/20">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIcon />
              </div>
              <input
                type="text"
                className="bg-white/50 dark:bg-gray-900/50 w-full pl-10 pr-4 py-4 rounded-xl text-lg border border-gray-200/50 dark:border-gray-700/50 focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
                placeholder="Search clubs by name, location, or description..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
              <button
                className="md:hidden absolute inset-y-0 right-0 px-4 flex items-center"
                onClick={() => setIsFilterVisible(!isFilterVisible)}
              >
                <FilterIcon />
              </button>
            </div>

            <div className="hidden md:flex mt-6 gap-6">
              <div className="flex-1">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <select
                  id="location"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-white/50 dark:bg-gray-900/50 w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all"
                >
                  <option value="">All Locations</option>
                  {uniqueLocations.map((location: string) => (
                    <option key={location} value={location}>
                      {location}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex-1">
                <label htmlFor="skill-level" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Skill Level
                </label>
                <select
                  id="skill-level"
                  value={selectedSkillLevel}
                  onChange={(e) => setSelectedSkillLevel(e.target.value)}
                  className="bg-white/50 dark:bg-gray-900/50 w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all"
                >
                  {SKILL_LEVELS.map((level: { value: string; label: string }) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={`md:hidden mt-6 space-y-4 overflow-hidden transition-all duration-300 ${isFilterVisible ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
              <div>
                <label htmlFor="location-mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <select
                  id="location-mobile"
                  value={selectedLocation}
                  onChange={(e) => setSelectedLocation(e.target.value)}
                  className="bg-white/50 dark:bg-gray-900/50 w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all"
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
                <label htmlFor="skill-level-mobile" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Skill Level
                </label>
                <select
                  id="skill-level-mobile"
                  value={selectedSkillLevel}
                  onChange={(e) => setSelectedSkillLevel(e.target.value)}
                  className="bg-white/50 dark:bg-gray-900/50 w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all"
                >
                  {SKILL_LEVELS.map((level: { value: string; label: string }) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto w-full flex-grow mb-20">
          <div className="flex justify-between items-center mb-8 px-2">
            <div>
              <p className="text-gray-500 dark:text-gray-400">
                <span className="font-medium text-gray-900 dark:text-white">{filteredClubs.length}</span> clubs found
              </p>
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {selectedSkillLevel && `Level: ${selectedSkillLevel}`}
              {selectedSkillLevel && selectedLocation && ' • '}
              {selectedLocation && `Location: ${selectedLocation}`}
            </div>
          </div>

          {filteredClubs.length > 0 ? (
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3 animate-staggered-fade-in">
              {filteredClubs.map((club: RunningClub, index: number) => (
                <ClubCard key={club.id} club={club} index={index} />
              ))}
            </div>
          ) : (
            <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-12 text-center border border-white/20 dark:border-gray-700/20 shadow-xl">
              <div className="w-16 h-16 mx-auto bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <FilterIcon />
              </div>
              <h3 className="text-2xl font-semibold text-gray-800 dark:text-white mb-3">No Clubs Found</h3>
              <p className="text-gray-600 dark:text-gray-300 max-w-md mx-auto mb-6">
                Try adjusting your filters or check back later for new clubs.
              </p>
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedLocation('');
                  setSelectedSkillLevel('');
                }}
                className="inline-flex items-center px-6 py-2 rounded-lg text-primary-600 dark:text-primary-400 border border-primary-600/20 dark:border-primary-400/20 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
        </section>
      </div>
    </PageContainer>
  );
}