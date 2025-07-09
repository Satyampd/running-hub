import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import '../styles/custom.css'; // Ensure custom styles are imported
import { MAJOR_CITIES } from '../config/constants'; // Corrected import path
import ReCAPTCHA from 'react-google-recaptcha';

const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const commonTimes = [
  '05:00 AM', '05:30 AM', '06:00 AM', '06:30 AM', '07:00 AM', '07:30 AM', '08:00 AM',
  '05:00 PM', '05:30 PM', '06:00 PM', '06:30 PM', '07:00 PM', '07:30 PM', '08:00 PM',
  '08:30 PM', '09:00 PM'
];

interface ClubSubmissionFormProps {
  onSuccess?: () => void;
}

interface ClubFormData {
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
  logo_url: string;
  photos: string[]; // Will store URLs of uploaded photos
  amenities: string[];
}

export default function ClubSubmissionForm({ onSuccess }: ClubSubmissionFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<ClubFormData>({
    name: '',
    location: '',
    address: '',
    description: '',
    established_year: '',
    meeting_times: [],
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
    photos: [], // Initialize as empty array for uploaded photo URLs
    amenities: [''], // Ensure at least one empty field for initial display for amenities
  });

  // --- STATE FOR MEETING TIMES SELECTION UI ---
  const [currentSelectedDays, setCurrentSelectedDays] = useState<string[]>([]);
  const [currentSelectedTime, setCurrentSelectedTime] = useState<string>('');
  // --- END STATE FOR MEETING TIMES SELECTION UI ---

  const [cityDropdownValue, setCityDropdownValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // --- IMAGE UPLOAD STATE ---
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageUploadProgress, setImageUploadProgress] = useState<number[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);
  // NEW: State to store the index of the selected hero image
  const [heroImageIndex, setHeroImageIndex] = useState<number | null>(null);
  // --- END IMAGE UPLOAD STATE ---

  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const googleRecaptchaKey = import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY;

  const createClubMutation = useMutation({
    mutationFn: async (clubData: ClubFormData) => {
      try {
        const response = await api.post('/clubs', {
          ...clubData,
          meeting_times: clubData.meeting_times.filter(time => time.trim() !== ''),
          // photos are already URLs from upload
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
      setError(null);
      setFormData({
        name: '', location: '', address: '', description: '', established_year: '',
        meeting_times: [], contact_email: '', contact_phone: '', website_url: '',
        social_media: { instagram: '', facebook: '', strava: '' },
        membership_fee: '', skill_level: '', typical_routes: '', group_size: '',
        logo_url: '', photos: [], amenities: [''],
      });
      setCurrentSelectedDays([]);
      setCurrentSelectedTime('');
      setCityDropdownValue('');
      setSelectedImages([]); // Reset selected files
      setImageUploadProgress([]); // Reset progress
      setHeroImageIndex(null); // Reset hero image index

      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        navigate('/clubs');
      }, 2500); // Slightly longer for user to read success message
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      const errorMessage = error?.response?.data?.message || 'Failed to submit running club. Please try again.';
      setError(`Error: ${errorMessage}`);
      setSuccess(false);
      setUploadingImages(false); // Ensure this is reset on mutation error too
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const validationErrors: string[] = [];

    // --- Required Field Validations ---
    if (!formData.name.trim()) validationErrors.push('Club name is required.');
    if (!formData.location.trim()) validationErrors.push('Location (City) is required.');
    if (!formData.description.trim()) validationErrors.push('Description is required.');
    if (!formData.contact_email.trim()) validationErrors.push('Contact email is required.');
    if (!formData.skill_level) validationErrors.push('Skill level is required.');

    if (cityDropdownValue === 'Other' && !formData.location.trim()) {
      validationErrors.push("Please specify the city if 'Other' is selected.");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.contact_email.trim() && !emailRegex.test(formData.contact_email)) {
      validationErrors.push('Please enter a valid contact email address.');
    }

    const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;
    if (formData.website_url.trim() && !urlRegex.test(formData.website_url)) {
      validationErrors.push('Please enter a valid website URL.');
    }

    if (formData.logo_url.trim() && !urlRegex.test(formData.logo_url)) {
      validationErrors.push('Please enter a valid logo URL.');
    }

    if (formData.social_media.instagram.trim() && !urlRegex.test(formData.social_media.instagram)) {
      validationErrors.push('Please enter a valid Instagram URL.');
    }
    if (formData.social_media.facebook.trim() && !urlRegex.test(formData.social_media.facebook)) {
      validationErrors.push('Please enter a valid Facebook URL.');
    }
    if (formData.social_media.strava.trim() && !urlRegex.test(formData.social_media.strava)) {
      validationErrors.push('Please enter a valid Strava Club URL.');
    }

    const currentYear = new Date().getFullYear();
    if (formData.established_year) {
        const year = parseInt(formData.established_year);
        if (isNaN(year) || year < 1900 || year > currentYear) {
            validationErrors.push(`Established year must be a valid year between 1900 and ${currentYear}.`);
        }
    }

    // Crucial: Ensure club name is available for image metadata *before* image upload attempt
    if (!formData.name.trim() && selectedImages.length > 0) {
        validationErrors.push('Club name is required to upload images.');
    }

    // NEW: Validation for hero image selection
    if (selectedImages.length > 0 && heroImageIndex === null) {
      validationErrors.push('Please select a hero image for your club.');
    }

    if (!recaptchaToken) {
      setError('Please complete the reCAPTCHA.');
      return;
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }

    let uploadedImageUrls: string[] = [];

    if (selectedImages.length > 0) {
      setUploadingImages(true);
      setImageUploadProgress(Array(selectedImages.length).fill(0));
      
      try {
        for (let i = 0; i < selectedImages.length; i++) {
          const file = selectedImages[i];
          const fileExt = file.name.split('.').pop() || 'jpeg';

          const formDataToSend = new FormData();
          formDataToSend.append('type', 'club');  
          // Use current date for 'event_date' as clubs don't have a specific event date
          formDataToSend.append('event_date', new Date().toISOString().slice(0, 10)); 
          formDataToSend.append('event_name', formData.name.trim()); // Use club name
          formDataToSend.append('file_ext', fileExt);
          formDataToSend.append('index', (i + 1).toString());
          formDataToSend.append('file', file);

          const { data } = await api.post('/media/generate-upload-url/', formDataToSend, {
            headers: { 'Content-Type': 'multipart/form-data' }
          });

          await fetch(data.upload_url, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
          });

          uploadedImageUrls.push(data.public_url);

          setImageUploadProgress(prev => {
            const copy = [...prev];
            copy[i] = 100;
            return copy;
          });
        }
      } catch (uploadError: any) {
        console.error("Image upload error:", uploadError);
        setError('Image upload failed. Please try again. ' + (uploadError.response?.data?.detail || uploadError.message || ''));
        setUploadingImages(false);
        return;
      } finally {
        // Set uploading to false only if no mutation is pending.
        // If mutation starts, it will handle its own loading state.
        if (!createClubMutation.isPending) {
            setUploadingImages(false);
        }
      }

      // NEW: Reorder uploadedImageUrls based on heroImageIndex
      if (heroImageIndex !== null && uploadedImageUrls[heroImageIndex]) {
        const hero = uploadedImageUrls[heroImageIndex];
        uploadedImageUrls.splice(heroImageIndex, 1); // Remove hero image from its original position
        uploadedImageUrls.unshift(hero); // Add hero image to the beginning
      }
    }

    createClubMutation.mutate({
      ...formData,
      photos: uploadedImageUrls,
      ...(recaptchaToken ? { recaptcha_token: recaptchaToken } : {}),
    });
  };

  const handleDayToggle = (day: string) => {
    setCurrentSelectedDays(prevDays =>
      prevDays.includes(day)
        ? prevDays.filter(d => d !== day)
        : [...prevDays, day]
    );
  };

  const handleAddFormattedMeetingTime = () => {
    if (currentSelectedDays.length > 0 && currentSelectedTime) {
      setError(null);
      const sortedDays = [...currentSelectedDays].sort((a, b) =>
        daysOfWeek.indexOf(a) - daysOfWeek.indexOf(b)
      );
      const formattedDays = sortedDays.length === 1
        ? sortedDays[0]
        : sortedDays.slice(0, -1).join(', ') + ' & ' + sortedDays[sortedDays.length - 1];
      const newMeetingTime = `${formattedDays} at ${currentSelectedTime}`;

      if (!formData.meeting_times.includes(newMeetingTime)) {
        setFormData(prevFormData => ({
          ...prevFormData,
          meeting_times: [...prevFormData.meeting_times, newMeetingTime],
        }));
        setCurrentSelectedDays([]);
        setCurrentSelectedTime('');
      } else {
        setError('This meeting time already exists.');
      }
    } else {
      setError('Please select at least one day and a time for the meeting.');
    }
  };

  const handleArrayFieldChange = (field: 'amenities', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field: 'amenities') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ''],
    });
  };

  const removeArrayField = (field: 'meeting_times' | 'amenities', index: number) => {
    const newArray = formData[field].filter((_, i) => i !== index);
    if (field === 'amenities' && newArray.length === 0) {
        setFormData({ ...formData, [field]: [''] });
    } else {
        setFormData({ ...formData, [field]: newArray as string[] }); // Type assertion
    }
  };


  return (
    <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl border border-white/20 dark:border-gray-700/20">
      {/* Loading state is now handled below the submit button, not as an overlay */}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Club Name <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
            placeholder="Enter club name"
          />
        </div>

        <div>
          <label htmlFor="location-city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location (City) <span className="text-red-500">*</span></label>
          <select
            id="location-city"
            value={cityDropdownValue}
            onChange={(e) => {
              const selectedValue = e.target.value;
              setCityDropdownValue(selectedValue);
              if (selectedValue === 'Other') {
                setFormData({ ...formData, location: '' });
              } else {
                setFormData({ ...formData, location: selectedValue });
              }
            }}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
          >
            <option value="">Select City *</option>
            {MAJOR_CITIES.map(city => (
              <option key={city} value={city}>{city}</option>
            ))}
            <option value="Other">Other (Please specify)</option>
          </select>

          {cityDropdownValue === 'Other' && (
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="mt-2 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
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
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
            placeholder="Enter detailed meeting point address with landmarks"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Meeting Times (Select days/time and click '+ Add Meeting Time')
          </label>
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
                      ? 'bg-primary-600 text-white hover:bg-primary-700'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-600'
                    }
                  `}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
          <div className="mb-4">
            <label htmlFor="select-time" className="block text-sm text-gray-600 dark:text-gray-400 mb-2">Select Time:</label>
            <select
              id="select-time"
              value={currentSelectedTime}
              onChange={(e) => setCurrentSelectedTime(e.target.value)}
              className="block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
            >
              <option value="">Select a time</option>
              {commonTimes.map(time => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={handleAddFormattedMeetingTime}
            className="px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Add Meeting Time
          </button>
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
                      className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm ml-2"
                      aria-label={`Remove ${time}`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description <span className="text-red-500">*</span></label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
            placeholder="Tell us about your club, running philosophy, and what makes it special"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Established Year</label>
          <input
            type="number"
            value={formData.established_year}
            onChange={(e) => setFormData({ ...formData, established_year: e.target.value })}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
            placeholder="YYYY"
            min="1900"
            max={new Date().getFullYear()}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Email <span className="text-red-500">*</span></label>
          <input
            type="email"
            value={formData.contact_email}
            onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
            placeholder="contact@runningclub.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Phone</label>
          <input
            type="tel"
            value={formData.contact_phone}
            onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
            placeholder="+91 XXXXXXXXXX"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Website URL</label>
          <input
            type="url"
            value={formData.website_url}
            onChange={(e) => setFormData({ ...formData, website_url: e.target.value })}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
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
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
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
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
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
              className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
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
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
            placeholder="e.g., Free, ₹1000/year, etc."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Skill Level <span className="text-red-500">*</span></label>
          <select
            value={formData.skill_level}
            onChange={(e) => setFormData({ ...formData, skill_level: e.target.value })}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
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
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
            placeholder="Describe your usual running routes and distances"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Typical Group Size</label>
          <input
            type="text"
            value={formData.group_size}
            onChange={(e) => setFormData({ ...formData, group_size: e.target.value })}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
            placeholder="e.g., 10-15 runners"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Club Logo URL</label>
          <input
            type="url"
            value={formData.logo_url}
            onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Club Images (up to 3, recommended)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={e => {
              const files = Array.from(e.target.files || []).slice(0, 3); // Limit to 3 files
              setSelectedImages(files);
              setImageUploadProgress(Array(files.length).fill(0)); // Reset progress for new files
              // If only one image is selected, automatically make it the hero
              if (files.length === 1) {
                setHeroImageIndex(0);
              } else {
                setHeroImageIndex(null); // Reset hero selection if multiple files are chosen or none
              }
            }}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 dark:file:bg-gray-700 file:text-primary-700 dark:file:text-primary-300 hover:file:bg-primary-100 dark:hover:file:bg-gray-600 cursor-pointer"
          />
          {selectedImages.length > 0 && (
            <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select a Cover Image:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedImages.map((file, idx) => (
                  <div key={idx} className="relative border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-sm">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Club image preview ${idx + 1}`}
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-2 bg-gray-50 dark:bg-gray-700">
                      <label className="flex items-center text-sm text-gray-700 dark:text-gray-300">
                        <input
                          type="radio"
                          name="heroImage"
                          checked={heroImageIndex === idx}
                          onChange={() => setHeroImageIndex(idx)}
                          className="form-radio h-4 w-4 text-primary-600 transition duration-150 ease-in-out"
                        />
                        <span className="ml-2">Make Cover</span>
                      </label>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        <span>{file.name}</span>
                        {imageUploadProgress[idx] === 100 && <span className="ml-2 text-green-500">✓ Uploaded</span>}
                        {uploadingImages && imageUploadProgress[idx] < 100 && imageUploadProgress[idx] > 0 && <span className="ml-2 text-blue-500">Uploading ({imageUploadProgress[idx]}%)...</span>}
                        {uploadingImages && imageUploadProgress[idx] === 0 && <span className="ml-2 text-gray-500">Pending...</span>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Amenities (e.g., Changing Rooms, Parking, Water)</label>
          {formData.amenities.map((amenity, index) => (
            <div key={index} className="flex gap-2 mt-2 items-center">
              <input
                type="text"
                value={amenity}
                onChange={(e) => handleArrayFieldChange('amenities', index, e.target.value)}
                className="flex-grow block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
                placeholder="Amenity"
              />
              {(formData.amenities.length > 1 || amenity.trim() !== '') && (
                  <button
                      type="button"
                      onClick={() => removeArrayField('amenities', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                      aria-label={`Remove amenity ${index + 1}`}
                  >
                      ×
                  </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() => addArrayField('amenities')}
            className="mt-2 px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 flex items-center gap-1"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path></svg>
            Add Another Amenity
          </button>
        </div>
        
        <div className="mt-6">
          <ReCAPTCHA
            sitekey={googleRecaptchaKey}
            onChange={token => setRecaptchaToken(token)}
            onExpired={() => setRecaptchaToken(null)}
            className="flex justify-center" // Centering the reCAPTCHA for better aesthetics
          />
        </div>

        {success && (
          <div className="mt-6 p-4 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 rounded-lg flex items-center">
            <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Running club submitted successfully! Redirecting to clubs page...
          </div>
        )}

        {error && (
          <div className="mt-6 p-4 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 rounded-lg flex items-start whitespace-pre-wrap">
             <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <div>{error}</div>
          </div>
        )}

        <button
          type="submit"
          disabled={uploadingImages || createClubMutation.isPending}
          className={`w-full py-3 px-6 text-white font-semibold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
            uploadingImages || createClubMutation.isPending
              ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' // Neutral disabled state
              : 'bg-gradient-to-r from-primary-600 to-secondary-500 hover:opacity-90 focus:ring-primary-500'
          }`}
        >
          {uploadingImages || createClubMutation.isPending ? 'Submitting...' : 'Submit Club'}
        </button>

        {(uploadingImages || createClubMutation.isPending) && (
          <div className="mt-2 flex items-center justify-center text-sm text-gray-600 dark:text-gray-300 space-x-2">
            <svg
              className="animate-spin h-4 w-4 text-primary-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{uploadingImages ? 'Uploading images...' : 'Submitting club...'}</span>
          </div>
        )}
      </form>
    </div>
  );
}