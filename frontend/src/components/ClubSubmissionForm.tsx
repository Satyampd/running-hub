import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

// --- CONSTANTS FOR CITIES, DAYS, AND TIMES ---
const majorCities = [
  'Mumbai', 'Delhi NCR', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
  'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
  'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
];

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const commonTimes = [
  '05:00 AM', '05:30 AM', '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM',
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM',
  '08:30 PM', '09:00 PM'
];

interface ClubSubmissionFormProps {
  onSuccess?: () => void;
}

const ClubSubmissionForm: React.FC<ClubSubmissionFormProps> = ({ onSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    address: '',
    description: '',
    established_year: '',
    meeting_times: [] as string[], // Initializing as an empty array
    contact_email: '',
    contact_phone: '',
    website_url: '',
    social_media: {
      instagram: '',
      facebook: '',
      strava: '',
    },
    membership_fee: '',
    skill_level: '',
    typical_routes: '',
    group_size: '',
    logo_url: '',
    photos: [''],
    amenities: [''],
  });

  // --- STATE FOR MEETING TIMES SELECTION UI ---
  const [currentSelectedDays, setCurrentSelectedDays] = useState<string[]>([]);
  const [currentSelectedTime, setCurrentSelectedTime] = useState<string>('');
  // --- END STATE FOR MEETING TIMES SELECTION UI ---

  const [cityDropdownValue, setCityDropdownValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createClubMutation = useMutation({
    mutationFn: async (clubData: typeof formData) => {
      try {
        const response = await api.post('/clubs', {
          ...clubData,
          // Filter out empty strings from arrays before sending to backend
          meeting_times: clubData.meeting_times.filter(time => time.trim() !== ''),
          photos: clubData.photos.filter(photo => photo.trim() !== ''),
          amenities: clubData.amenities.filter(amenity => amenity.trim() !== ''),
        });
        return response.data;
      } catch (error: any) {
        console.error('Full error:', error);
        throw error;
      }
    },
    onSuccess: () => {
      setSuccess(true);
      setError(null); // Clear any mutation-related errors on success
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        navigate('/clubs');
      }, 2000);
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      // Set a user-friendly error message, falling back to a generic one
      setError(error?.response?.data?.message || 'Failed to submit running club. Please try again.');
      setSuccess(false); // Ensure success message is not shown on error
    },
  });

  // --- UPDATED handleSubmit FUNCTION FOR COMPREHENSIVE VALIDATION ---
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear any previous general errors before running new validations
    setError(null); 

    const validationErrors: string[] = [];

    // --- Required Field Validations ---
    if (!formData.name.trim()) {
      validationErrors.push('Club name is required.');
    }
    if (!formData.location.trim()) {
      validationErrors.push('Location (City) is required.');
    }
    if (!formData.description.trim()) {
      validationErrors.push('Description is required.');
    }
    if (!formData.contact_email.trim()) {
      validationErrors.push('Contact email is required.');
    }
    if (!formData.skill_level) {
      validationErrors.push('Skill level is required.');
    }
    // You can uncomment this if you want to make meeting times a required field
    // if (formData.meeting_times.length === 0) {
    //   validationErrors.push('At least one meeting time is required.');
    // }


    // --- Format Validations ---
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.contact_email.trim() && !emailRegex.test(formData.contact_email)) {
      validationErrors.push('Please enter a valid contact email address.');
    }

    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (formData.website_url.trim() && !urlRegex.test(formData.website_url)) {
      validationErrors.push('Please enter a valid website URL.');
    }
    if (formData.logo_url.trim() && !urlRegex.test(formData.logo_url)) {
      validationErrors.push('Please enter a valid logo URL.');
    }
    // Check all photo URLs
    formData.photos.forEach((photo, index) => {
      if (photo.trim() && !urlRegex.test(photo)) {
        validationErrors.push(`Photo URL #${index + 1} is invalid.`);
      }
    });
    // Check social media URLs only if they are provided
    if (formData.social_media.instagram.trim() && !urlRegex.test(formData.social_media.instagram)) {
      validationErrors.push('Please enter a valid Instagram URL.');
    }
    if (formData.social_media.facebook.trim() && !urlRegex.test(formData.social_media.facebook)) {
      validationErrors.push('Please enter a valid Facebook URL.');
    }
    if (formData.social_media.strava.trim() && !urlRegex.test(formData.social_media.strava)) {
      validationErrors.push('Please enter a valid Strava Club URL.');
    }

    // --- Established Year validation ---
    const currentYear = new Date().getFullYear();
    if (formData.established_year) {
        const year = parseInt(formData.established_year);
        // Check if it's a valid number and within a reasonable range
        if (isNaN(year) || year < 1900 || year > currentYear) {
            validationErrors.push(`Established year must be a valid year between 1900 and ${currentYear}.`);
        }
    }


    // --- Handle collected errors ---
    if (validationErrors.length > 0) {
      // Join all collected error messages into a single string, separated by new lines
      setError(validationErrors.join('\n')); // Use '\n' for line breaks, consider displaying with pre-wrap CSS
      setSuccess(false); // Make sure success message is hidden if there are form errors
      return; // Stop submission if there are validation errors
    }

    // If no validation errors, proceed with mutation
    createClubMutation.mutate(formData);
  };
  // --- END UPDATED handleSubmit FUNCTION ---

  // --- NEW HANDLER FOR DAY SELECTION ---
  const handleDayToggle = (day: string) => {
    setCurrentSelectedDays(prevDays => 
      prevDays.includes(day)
        ? prevDays.filter(d => d !== day) // Remove if already selected
        : [...prevDays, day]             // Add if not selected
    );
  };

  // --- NEW HANDLER TO ADD FORMATTED MEETING TIME ---
  const handleAddFormattedMeetingTime = () => {
    if (currentSelectedDays.length > 0 && currentSelectedTime) {
      // Clear any previous error specific to adding meeting time
      setError(null);

      // Sort days for consistent formatting (e.g., "Monday & Wednesday" vs "Wednesday & Monday")
      const sortedDays = [...currentSelectedDays].sort((a, b) => 
        daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b)
      );
      // Format days nicely (e.g., "Monday", "Monday & Wednesday", "Monday, Wednesday & Friday")
      const formattedDays = sortedDays.length === 1 
        ? sortedDays[0] 
        : sortedDays.slice(0, -1).join(', ') + ' & ' + sortedDays[sortedDays.length - 1];
      
      const newMeetingTime = `${formattedDays} at ${currentSelectedTime}`;
      
      // Prevent duplicate entries
      if (!formData.meeting_times.includes(newMeetingTime)) {
        setFormData(prevFormData => ({
          ...prevFormData,
          meeting_times: [...prevFormData.meeting_times, newMeetingTime],
        }));
        // Reset the selection for the next entry
        setCurrentSelectedDays([]);
        setCurrentSelectedTime('');
      } else {
        setError('This meeting time already exists.');
      }
    } else {
      setError('Please select at least one day and a time for the meeting.');
    }
  };
  // --- END NEW HANDLERS ---

  // Generic handler for array fields (photos, amenities).
  // Meeting_times is now handled by handleAddFormattedMeetingTime.
  const handleArrayFieldChange = (field: 'photos' | 'amenities', index: number, value: string) => {
    // This type guard ensures 'field' is only 'photos' or 'amenities'
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  // Add field for photo/amenity arrays
  const addArrayField = (field: 'photos' | 'amenities') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ''],
    });
  };

  // Remove field for any array type (photos, amenities, meeting_times)
  const removeArrayField = (field: 'meeting_times' | 'photos' | 'amenities', index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    setFormData({ ...formData, [field]: newArray });
  };


  return (
    <div className="relative py-16">
      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Register Your Running Club</h2>
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Share your running club with our community. Help runners find their perfect running group!
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
          <div className="p-6 sm:p-8">
            {/* Added noValidate to disable browser's default HTML5 validation */}
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {createClubMutation.isPending && (
                <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-50">
                  <div className="flex items-center space-x-2">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
                    <span className="text-gray-600 dark:text-gray-300">Submitting club...</span>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Club Name *</label>
                <input
                  type="text"
                  // 'required' attribute is removed here because custom validation handles it
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                  placeholder="Enter club name"
                />
              </div>

              <div>
                <label htmlFor="location-city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location (City) *</label>
                <select
                  id="location-city"
                  // 'required' attribute is removed here because custom validation handles it
                  value={cityDropdownValue}
                  onChange={(e) => {
                    const selectedValue = e.target.value;
                    setCityDropdownValue(selectedValue);
                    if (selectedValue === 'Other') {
                      setFormData({ ...formData, location: '' }); // Clear location for custom input
                    } else {
                      setFormData({ ...formData, location: selectedValue }); // Set location from dropdown
                    }
                  }}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                >
                  <option value="">Select City *</option>
                  {majorCities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                  <option value="Other">Other (Please specify)</option>
                </select>

                {cityDropdownValue === 'Other' && (
                  <input
                    type="text"
                    // 'required' attribute is removed here because custom validation handles it
                    value={formData.location} // This directly updates formData.location
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="mt-2 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                    placeholder="Enter your city"
                  />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meeting Address</label>
                <textarea
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                  placeholder="Enter detailed meeting point address with landmarks"
                />
              </div>

              {/* --- NEW MEETING TIMES UI --- */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Meeting Times (Select days/time and click '+ Add Meeting Time')
                </label>
                
                {/* Day Selection */}
                <div className="mb-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Select Days:</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {daysOfWeek.map(day => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleDayToggle(day)}
                        className={`
                          py-2 px-3 rounded-lg text-sm font-medium transition-colors duration-200
                          ${currentSelectedDays.includes(day)
                            ? 'bg-blue-600 text-white hover:bg-blue-700'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }
                        `}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Selection */}
                <div className="mb-4">
                  <label htmlFor="select-time" className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Select Time:</label>
                  <select
                    id="select-time"
                    value={currentSelectedTime}
                    onChange={(e) => setCurrentSelectedTime(e.target.value)}
                    className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                  >
                    <option value="">Select a time</option>
                    {commonTimes.map(time => (
                      <option key={time} value={time}>{time}</option>
                    ))}
                  </select>
                </div>

                {/* Add Meeting Time Button */}
                <button
                  type="button"
                  onClick={handleAddFormattedMeetingTime}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
                  Add Meeting Time
                </button>

                {/* Display existing meeting times */}
                {formData.meeting_times.length > 0 && (
                  <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Added Meeting Times:</p>
                    <ul className="space-y-2">
                      {formData.meeting_times.map((time, index) => (
                        <li key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm">
                          <span className="text-gray-900 dark:text-white">{time}</span>
                          <button
                            type="button"
                            onClick={() => removeArrayField('meeting_times', index)}
                            className="text-red-600 hover:text-red-800 text-sm"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {/* --- END NEW MEETING TIMES UI --- */}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
                <textarea
                  // 'required' attribute is removed here because custom validation handles it
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                  placeholder="Tell us about your club, running philosophy, and what makes it special"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Established Year</label>
                <input
                  type="number"
                  value={formData.established_year}
                  onChange={(e) => setFormData({ ...formData, established_year: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                  placeholder="YYYY"
                  min="1900" // HTML5 min/max can stay as they are not blocking onSubmit
                  max={new Date().getFullYear()} // if noValidate is used
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Email *</label>
                <input
                  type="email"
                  // 'required' attribute is removed here because custom validation handles it
                  value={formData.contact_email}
                  onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                  placeholder="contact@runningclub.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Phone</label>
                <input
                  type="tel"
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                  placeholder="+91 XXXXXXXXXX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Website URL</label>
                <input
                  type="url"
                  value={formData.website_url}
                  onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Social Media Links</label>
                <div>
                  <input
                    type="url"
                    value={formData.social_media.instagram}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_media: { ...formData.social_media, instagram: e.target.value }
                    })}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                    placeholder="Instagram URL"
                  />
                </div>
                <div>
                  <input
                    type="url"
                    value={formData.social_media.facebook}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_media: { ...formData.social_media, facebook: e.target.value }
                    })}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                    placeholder="Facebook URL"
                  />
                </div>
                <div>
                  <input
                    type="url"
                    value={formData.social_media.strava}
                    onChange={(e) => setFormData({
                      ...formData,
                      social_media: { ...formData.social_media, strava: e.target.value }
                    })}
                    className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                    placeholder="Strava Club URL"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Membership Fee</label>
                <input
                  type="text"
                  value={formData.membership_fee}
                  onChange={(e) => setFormData({ ...formData, membership_fee: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                  placeholder="e.g., Free, ₹1000/year, etc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Skill Level *</label>
                <select
                  // 'required' attribute is removed here because custom validation handles it
                  value={formData.skill_level}
                  onChange={(e) => setFormData({ ...formData, skill_level: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                >
                  <option value="">Select skill level</option>
                  <option value="beginner">Beginner Friendly</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="all">All Levels Welcome</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Typical Routes</label>
                <textarea
                  value={formData.typical_routes}
                  onChange={(e) => setFormData({ ...formData, typical_routes: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                  placeholder="Describe your usual running routes and distances"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Typical Group Size</label>
                <input
                  type="text"
                  value={formData.group_size}
                  onChange={(e) => setFormData({ ...formData, group_size: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                  placeholder="e.g., 10-15 runners"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Club Logo URL</label>
                <input
                  type="url"
                  value={formData.logo_url}
                  onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Club Photos</label>
                {formData.photos.map((photo, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <input
                      type="url"
                      value={photo}
                      onChange={(e) => handleArrayFieldChange('photos', index, e.target.value)}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                      placeholder="Photo URL"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField('photos', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('photos')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Photo
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amenities</label>
                {formData.amenities.map((amenity, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={amenity}
                      onChange={(e) => handleArrayFieldChange('amenities', index, e.target.value)}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                      placeholder="e.g., Water stations, Parking, Changing rooms"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField('amenities', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('amenities')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Amenity
                </button>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={createClubMutation.isPending}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
                >
                  {createClubMutation.isPending ? 'Submitting...' : 'Submit Running Club'}
                </button>         
              </div>

              {/* --- SUCCESS AND ERROR MESSAGES MOVED HERE --- */}
              {success && (
                <div className="mt-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Running club submitted successfully! Redirecting to clubs page...
                </div>
              )}
              
              {error && (
                <div className="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center whitespace-pre-wrap">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  {error}
                </div>
             )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubSubmissionForm;