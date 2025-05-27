import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

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
    meeting_times: [''],
    contact_email: '',
    contact_phone: '',
    website_url: '',
    social_media: {
      instagram: '',
      facebook: '',
      strava: '',
    },
    membership_fee: '',
    skill_level: '',  // beginner, intermediate, advanced, all levels
    typical_routes: '',
    group_size: '',
    logo_url: '',
    photos: [''],
    amenities: [''],  // things like "water stations", "parking", "changing rooms", etc.
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createClubMutation = useMutation({
    mutationFn: async (clubData: typeof formData) => {
      try {
        const response = await api.post('/clubs', {
          ...clubData,
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
      setError(null);
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        navigate('/clubs');
      }, 2000);
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      setError(error?.response?.data?.message || 'Failed to submit running club. Please try again.');
      setSuccess(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name.trim()) {
      setError('Club name is required');
      return;
    }
    if (!formData.location.trim()) {
      setError('Location is required');
      return;
    }
    if (!formData.description.trim()) {
      setError('Description is required');
      return;
    }
    if (!formData.contact_email.trim()) {
      setError('Contact email is required');
      return;
    }
    if (!formData.skill_level) {
      setError('Skill level is required');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.contact_email)) {
      setError('Please enter a valid email address');
      return;
    }

    // Validate URLs if provided
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (formData.website_url && !urlRegex.test(formData.website_url)) {
      setError('Please enter a valid website URL');
      return;
    }
    if (formData.logo_url && !urlRegex.test(formData.logo_url)) {
      setError('Please enter a valid logo URL');
      return;
    }
    for (const photo of formData.photos) {
      if (photo && !urlRegex.test(photo)) {
        setError('Please enter valid photo URLs');
        return;
      }
    }

    // Clear any previous errors
    setError(null);
    createClubMutation.mutate(formData);
  };

  const handleArrayFieldChange = (field: 'meeting_times' | 'photos' | 'amenities', index: number, value: string) => {
    const newArray = [...formData[field]];
    newArray[index] = value;
    setFormData({ ...formData, [field]: newArray });
  };

  const addArrayField = (field: 'meeting_times' | 'photos' | 'amenities') => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ''],
    });
  };

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
            {success && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Running club submitted successfully! Redirecting to clubs page...
              </div>
            )}
            
            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                  placeholder="Enter club name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location (City) *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                  placeholder="e.g., Mumbai, Delhi NCR, Bangalore"
                />
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

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Meeting Times</label>
                {formData.meeting_times.map((time, index) => (
                  <div key={index} className="flex gap-2 mt-2">
                    <input
                      type="text"
                      value={time}
                      onChange={(e) => handleArrayFieldChange('meeting_times', index, e.target.value)}
                      className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
                      placeholder="e.g., Every Sunday 6:00 AM"
                    />
                    <button
                      type="button"
                      onClick={() => removeArrayField('meeting_times', index)}
                      className="px-3 py-2 text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addArrayField('meeting_times')}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Meeting Time
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description *</label>
                <textarea
                  required
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
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Contact Email *</label>
                <input
                  type="email"
                  required
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
                  required
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
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClubSubmissionForm; 