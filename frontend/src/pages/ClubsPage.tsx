// import React, { useState, useCallback } from 'react';
// import { useQuery } from '@tanstack/react-query';
// import { Link } from 'react-router-dom';
// import api from '../services/api';
// import { debounce } from 'lodash';

// interface RunningClub {
//   id: string;
//   name: string;
//   location: string;
//   description: string;
//   skill_level: string;
//   logo_url?: string;
//   meeting_times: string[];
//   membership_fee: string;
//   group_size: string;
// }

// const ClubsPage: React.FC = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [selectedLocation, setSelectedLocation] = useState('');
//   const [selectedSkillLevel, setSelectedSkillLevel] = useState('');
//   const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

//   const { data: clubs = [], isLoading, error } = useQuery<RunningClub[]>({
//     queryKey: ['clubs'],
//     queryFn: async () => {
//       try {
//         const response = await api.get('/clubs');
//         return response.data;
//       } catch (error: any) {
//         throw new Error(error?.response?.data?.message || 'Failed to load running clubs');
//       }
//     },
//   });

//   // Debounce the search term update
//   const debouncedSetSearchTerm = useCallback(
//     debounce((value: string) => {
//       setDebouncedSearchTerm(value);
//     }, 300),
//     []
//   );

//   const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setSearchTerm(e.target.value);
//     debouncedSetSearchTerm(e.target.value);
//   };

//   const filteredClubs = clubs.filter((club: RunningClub) => {
//     const matchesSearch = 
//       club.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
//       club.description.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
//       club.location.toLowerCase().includes(debouncedSearchTerm.toLowerCase());
//     const matchesLocation = !selectedLocation || club.location === selectedLocation;
//     const matchesSkillLevel = !selectedSkillLevel || club.skill_level === selectedSkillLevel;
//     return matchesSearch && matchesLocation && matchesSkillLevel;
//   });

//   const uniqueLocations = Array.from(new Set(clubs.map((club: RunningClub) => club.location))).sort();

//   return (
//     <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
//       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center">
//           <h1 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">
//             Running Clubs
//           </h1>
//           <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 dark:text-gray-300 sm:mt-4">
//             Find your perfect running group and connect with fellow runners in your area
//           </p>
//           <Link
//             to="/submit-club"
//             className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//           >
//             Register Your Club
//           </Link>
//         </div>

//         <div className="mt-12 max-w-5xl mx-auto">
//           <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden">
//             <div className="p-6">
//               <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-8">
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Search Clubs
//                   </label>
//                   <input
//                     type="text"
//                     value={searchTerm}
//                     onChange={handleSearchChange}
//                     placeholder="Search by name, location, or description"
//                     className="block w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
//                   />
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Filter by Location
//                   </label>
//                   <select
//                     value={selectedLocation}
//                     onChange={(e) => setSelectedLocation(e.target.value)}
//                     className="block w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
//                   >
//                     <option value="">All Locations</option>
//                     {uniqueLocations.map((location: string) => (
//                       <option key={location} value={location}>
//                         {location}
//                       </option>
//                     ))}
//                   </select>
//                 </div>
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
//                     Filter by Level
//                   </label>
//                   <select
//                     value={selectedSkillLevel}
//                     onChange={(e) => setSelectedSkillLevel(e.target.value)}
//                     className="block w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
//                   >
//                     <option value="">All Levels</option>
//                     <option value="beginner">Beginner Friendly</option>
//                     <option value="intermediate">Intermediate</option>
//                     <option value="advanced">Advanced</option>
//                     <option value="all">All Levels Welcome</option>
//                   </select>
//                 </div>
//               </div>

//               {isLoading ? (
//                 <div className="text-center py-12">
//                   <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
//                   <p className="mt-2 text-gray-500 dark:text-gray-400">Loading clubs...</p>
//                 </div>
//               ) : error ? (
//                 <div className="text-center py-12 text-red-600 dark:text-red-400">
//                   Error loading clubs. Please try again later.
//                 </div>
//               ) : filteredClubs.length === 0 ? (
//                 <div className="text-center py-12 text-gray-500 dark:text-gray-400">
//                   No running clubs found matching your criteria.
//                 </div>
//               ) : (
//                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
//                   {filteredClubs.map((club: RunningClub) => (
//                     <div
//                       key={club.id}
//                       className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow duration-300"
//                     >
//                       <div className="p-6">
//                         <div className="flex items-center mb-4">
//                           {club.logo_url ? (
//                             <img
//                               src={club.logo_url}
//                               alt={`${club.name} logo`}
//                               className="h-12 w-12 rounded-full object-cover"
//                             />
//                           ) : (
//                             <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
//                               <span className="text-blue-600 dark:text-blue-300 text-lg font-bold">
//                                 {club.name.charAt(0)}
//                               </span>
//                             </div>
//                           )}
//                           <div className="ml-4">
//                             <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
//                               {club.name}
//                             </h3>
//                             <p className="text-sm text-gray-500 dark:text-gray-400">
//                               {club.location}
//                             </p>
//                           </div>
//                         </div>
//                         <div className="space-y-2">
//                           <p className="text-gray-600 dark:text-gray-300 line-clamp-2">
//                             {club.description}
//                           </p>
//                           <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
//                             <span className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-1 rounded-full text-xs">
//                               {club.skill_level}
//                             </span>
//                             <span className="mx-2">•</span>
//                             <span>{club.group_size}</span>
//                           </div>
//                           {club.meeting_times.length > 0 && (
//                             <div className="text-sm text-gray-500 dark:text-gray-400">
//                               <span className="font-medium">Meets:</span>{' '}
//                               {club.meeting_times[0]}
//                             </div>
//                           )}
//                           <div className="text-sm text-gray-500 dark:text-gray-400">
//                             <span className="font-medium">Fee:</span> {club.membership_fee}
//                           </div>
//                         </div>
//                         <Link
//                           to={`/clubs/${club.id}`}
//                           className="mt-4 block text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
//                         >
//                           View Details
//                         </Link>
//                       </div>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ClubsPage; 

import React, { useState, useCallback, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { debounce } from 'lodash';
import PageContainer from '../components/PageContainer'; // Import PageContainer
import '../styles/custom.css'; // Ensure custom styles are imported

// --- Reusable Icons (from EventsPage, can be moved to a shared component file) ---
const SearchIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-gray-400 dark:text-gray-500">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

const FilterIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 mr-2 dark:text-gray-400">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 7.998.654a.75.75 0 01.752.752V6.69a.75.75 0 01-.34.632l-4.072 3.29a.75.75 0 00-.34.633v4.037c0 .19-.08.37-.214.504l-2.21 2.056a.75.75 0 01-1.062-.006l-2.198-2.05a.75.75 0 01-.217-.506V11.343a.75.75 0 00-.34-.632L3.6 7.422a.75.75 0 01-.34-.632V4.406a.75.75 0 01.752-.752C6.545 3.232 9.245 3 12 3z" />
  </svg>
);

// Added new icons for Club details for better visual representation
const UsersIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

const ClockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
</svg>
);

const PriceIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 mr-1">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659L9 10.341M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);
// --- End Reusable Icons ---


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
  const [isFilterVisible, setIsFilterVisible] = useState(false); // For mobile filter toggle

  // No need for debouncedSearchTerm state if we filter immediately on searchTerm
  // The debounce function on handleSearchChange just delays the API call if you had one,
  // but for local filtering on `searchTerm`, it's not strictly necessary.
  const debouncedSetSearchTerm = useCallback(
    debounce((value: string) => { /* no-op for now, as searchTerm is direct */ }, 300),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // debouncedSetSearchTerm(e.target.value); // Keep if you want to use debounced version for external API calls later
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

  // Memoize unique locations to optimize performance
  const uniqueLocations = useMemo(() => {
    return Array.from(new Set(clubs.map((club: RunningClub) => club.location))).sort();
  }, [clubs]);

  // Memoize filtered clubs based on search and select states
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


  // --- Loading State (Matches EventsPage) ---
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

  // --- Error State (Matches EventsPage) ---
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
        {/* --- Background Elements (Matches EventsPage) --- */}
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[70%] h-[50%] bg-gradient-to-br from-primary-500/5 to-secondary-500/10 rounded-[50%] blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[70%] h-[50%] bg-gradient-to-tr from-secondary-500/5 to-primary-500/10 rounded-[50%] blur-3xl"></div>
        </div>

        {/* --- Header Section (Matches EventsPage) --- */}
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
            // Button style matches Home/Events primary button
            className="mt-8 inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-full shadow-sm text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:opacity-90 transition-all duration-300 shadow-lg shadow-primary-500/20"
          >
            Register Your Club
          </Link>
        </header>

        {/* --- Search & Filter Section (Matches EventsPage) --- */}
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

            {/* Filters - Desktop */}
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
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner Friendly</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="all">All Levels Welcome</option>
                </select>
              </div>
            </div>

            {/* Filters - Mobile */}
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
                  <option value="">All Levels</option>
                  <option value="beginner">Beginner Friendly</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="all">All Levels Welcome</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto w-full flex-grow mb-20">
          {/* Results count and stats (Matches EventsPage) */}
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
                <div key={club.id} className="animate-slide-in-bottom" style={{ animationDelay: `${index * 50}ms` }}>
                  {/* --- Club Card Structure (OLD structure with NEW glassmorphism styling) --- */}
                  <div
                    className="bg-white/70 dark:bg-gray-800/50 backdrop-blur-xl rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 hover:translate-y-[-8px] group h-full flex flex-col"
                  >
                    <div className="p-6 flex flex-col flex-grow">
                      {/* Logo and Name/Location Header */}
                      <div className="flex items-center mb-4">
                        {club.logo_url ? (
                          <img
                            src={club.logo_url}
                            alt={`${club.name} logo`}
                            className="h-12 w-12 rounded-full object-cover shadow-sm mr-4" // Added shadow and margin
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
                      <p className="text-gray-600 dark:text-gray-300 text-sm line-clamp-3 mb-4 flex-grow">
                        {club.description}
                      </p>

                      <div className="space-y-2 mt-auto"> {/* Pushes details to bottom */}
                        {/* Skill Level Tag (Styled like event categories) */}
                        <div className="flex items-center">
                          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300">
                            {club.skill_level.charAt(0).toUpperCase() + club.skill_level.slice(1)}
                          </span>
                        </div>

                        {/* Meeting Times */}
                        {club.meeting_times.length > 0 && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <ClockIcon />
                            <span className="font-medium">Meets:</span>{' '}
                            {club.meeting_times[0]}
                          </div>
                        )}

                        {/* Group Size */}
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <UsersIcon />
                          <span className="font-medium">Group Size:</span>{' '}
                          {club.group_size}
                        </div>

                        {/* Membership Fee */}
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <PriceIcon />
                          <span className="font-medium">Fee:</span> {club.membership_fee}
                        </div>
                      </div>

                      {/* View Details Button (Matches EventsPage/Home button style) */}
                      <Link
                        to={`/clubs/${club.id}`}
                        className="mt-6 block text-center px-4 py-2 rounded-full text-sm font-medium text-white bg-gradient-to-r from-primary-600 to-secondary-500 hover:opacity-90 transition-all shadow-sm hover:shadow-md"
                      >
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // --- No Clubs Found State (Matches EventsPage) ---
            // Comment moved inside the div to ensure it's a single JSX root element
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