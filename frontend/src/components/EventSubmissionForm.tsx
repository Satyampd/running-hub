import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { formatDate } from '../utils/dateUtils'; 
import '../styles/custom.css'; // Ensure custom styles are imported
import { MAJOR_CITIES, PREDEFINED_EVENT_CATEGORIES } from '../config/constants'; // Corrected import path

interface EventSubmissionFormProps {
  onSuccess?: () => void;
}

interface EventFormData {
  title: string;
  date: string;
  location: string;
  address: string;
  categories: string[];
  price: string;
  url: string;
  description: string;
  registration_closes: string;
  photos: string[];
}

export default function EventSubmissionForm({ onSuccess }: EventSubmissionFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<EventFormData>({
    title: '',
    date: '',
    location: '',
    address: '',
    categories: [],
    price: '',
    url: '',
    description: '',
    registration_closes: '',
    photos: [],
  });

  const [cityDropdownValue, setCityDropdownValue] = useState<string>('');
  const [otherCategoryValue, setOtherCategoryValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageUploadProgress, setImageUploadProgress] = useState<number[]>([]);
  const [uploadingImages, setUploadingImages] = useState(false);

  const createEventMutation = useMutation({
    mutationFn: async (eventData: EventFormData) => {
      try {
        const response = await api.post('/events', {
          ...eventData,
          categories: eventData.categories.map(cat => cat.trim()).filter(cat => cat !== ''),
        });
        return response.data;
      } catch (error: any) {
        console.error('Full error:', error);
        console.error('Response data:', error.response?.data);
        throw error;
      }
    },
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      setFormData({
        title: '', date: '', location: '', address: '', categories: [],
        price: '', url: '', description: '', registration_closes: '', photos: [],
      });
      setCityDropdownValue('');
      setOtherCategoryValue('');
      setSelectedImages([]);
      setImageUploadProgress([]);
      if (onSuccess) {
        onSuccess();
      }
      setTimeout(() => {
        navigate('/events');
      }, 2500); // Slightly longer for user to read success message
    },
    onError: (error: any) => {
      console.error('Mutation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to submit event. Please check your input and try again.';
      setError(`Error: ${errorMessage}`);
      setSuccess(false);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const validationErrors: string[] = [];

    // --- Required Field Validations ---
    if (!formData.title.trim()) validationErrors.push('Event title is required.');
    if (!formData.date) validationErrors.push('Event date is required.');
    if (!formData.location.trim()) validationErrors.push('Location (City) is required.');
    if (cityDropdownValue === 'Other' && !formData.location.trim()) {
      validationErrors.push("Please specify the city if 'Other' is selected.");
    }
    if (!formData.price.trim()) validationErrors.push('Price is required.');
    if (!formData.url.trim()) validationErrors.push('Registration URL is required.(with https://');

    // --- Format Validations ---
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (formData.url.trim() && !urlRegex.test(formData.url)) {
      validationErrors.push('Please enter a valid registration URL.');
    }

    // --- Date Validations ---
    if (formData.date && formData.registration_closes && new Date(formData.registration_closes) > new Date(formData.date)) {
      validationErrors.push('Registration closing date cannot be after the event date.');
    }

    // --- Category Validation (optional, but if provided, should be meaningful) ---
    // This is mostly handled by the input method now, but good to keep filtering logic in mutation
    const validCategories = formData.categories.map(c => c.trim()).filter(c => c !== '');
    if (formData.categories.length > 0 && validCategories.length === 0) {
        validationErrors.push("If categories are added, at least one must be valid (not empty).");
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
          formDataToSend.append('type', 'event');
          formDataToSend.append('event_date', formData.date);
          formDataToSend.append('event_name', formData.title);
          formDataToSend.append('file_ext', fileExt);
          formDataToSend.append('index', (i + 1).toString());
          formDataToSend.append('file', file);

          const { data } = await api.post('/media/generate-upload-url/', formDataToSend, {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
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
      } catch (uploadError) {
        setError('Image upload failed. Please try again.');
        setUploadingImages(false);
        return;
      } finally {
        setUploadingImages(false);
      }
    }
    createEventMutation.mutate({
      ...formData,
      photos: uploadedImageUrls,
      date: formatDate(formData.date),
      registration_closes: formData.registration_closes
        ? formatDate(formData.registration_closes)
        : '',
      categories: validCategories,
    });
  };

  const handlePredefinedCategoryToggle = (category: string) => {
    setError(null);
    setFormData(prevFormData => {
      const newCategories = prevFormData.categories.includes(category)
        ? prevFormData.categories.filter(c => c !== category)
        : [...prevFormData.categories, category];
      return { ...prevFormData, categories: newCategories };
    });
  };

  const handleAddOtherCategory = () => {
    setError(null);
    const trimmedOtherCategory = otherCategoryValue.trim();
    if (trimmedOtherCategory && !formData.categories.includes(trimmedOtherCategory)) {
      setFormData(prevFormData => ({
        ...prevFormData,
        categories: [...prevFormData.categories, trimmedOtherCategory],
      }));
      setOtherCategoryValue(''); // Clear input after adding
    } else if (formData.categories.includes(trimmedOtherCategory)) {
        setError(`Category "${trimmedOtherCategory}" is already added.`);
    } else if (!trimmedOtherCategory) {
        setError("Custom category cannot be empty.");
    }
  };

  const handleRemoveCategory = (categoryToRemove: string) => {
    setError(null);
    setFormData(prevFormData => ({
      ...prevFormData,
      categories: prevFormData.categories.filter(cat => cat !== categoryToRemove),
    }));
  };

  return (
    // This div is the "card" for the form, NOT the whole page layout
    <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl border border-white/20 dark:border-gray-700/20">
      {/* {(uploadingImages || createEventMutation.isPending) && (
        // Overlay for loading state, relative to its parent (the form card)
        <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-50 rounded-2xl">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
            <span className="text-gray-600 dark:text-gray-300">
              {uploadingImages ? 'Uploading images...' : 'Submitting event...'}
            </span>
          </div>
        </div>
      )} */}

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Event Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
            placeholder="Enter event title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Event Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
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
            <option value="">Select City</option>
            {MAJOR_CITIES.map((city: string) => (
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Detailed Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
            placeholder="E.g., Starting point, nearby landmarks"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Categories</label>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mb-3">
            {PREDEFINED_EVENT_CATEGORIES.map((cat: string) => (
              <label key={cat} className="flex items-center space-x-2 cursor-pointer text-sm text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                <input
                  type="checkbox"
                  checked={formData.categories.includes(cat)}
                  onChange={() => handlePredefinedCategoryToggle(cat)}
                  className="form-checkbox h-4 w-4 text-primary-600 dark:text-primary-500 border-gray-300 dark:border-gray-600 rounded focus:ring-primary-500 dark:focus:ring-primary-400 dark:bg-gray-700 dark:checked:bg-primary-500"
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>

          <div className="flex items-stretch gap-2 mt-3 mb-3">
            <input
              type="text"
              value={otherCategoryValue}
              onChange={(e) => setOtherCategoryValue(e.target.value)}
              className="flex-grow block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner text-sm"
              placeholder="Add a custom category"
            />
            <button
              type="button"
              onClick={handleAddOtherCategory}
              className="px-4 py-2 text-sm bg-primary-500 hover:bg-primary-600 text-white rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Add
            </button>
          </div>

          {formData.categories.length > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2 uppercase tracking-wider">Selected Categories:</p>
              <ul className="flex flex-wrap gap-2">
                {formData.categories.map((cat, index) => (
                  <li
                    key={`${cat}-${index}`}
                    className="flex items-center justify-center text-xs px-3 py-1.5 bg-primary-500/10 dark:bg-primary-500/20 text-primary-700 dark:text-primary-300 rounded-full font-medium"
                  >
                    {cat}
                    <button
                      type="button"
                      onClick={() => handleRemoveCategory(cat)}
                      className="ml-2 text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200 focus:outline-none"
                      aria-label={`Remove ${cat}`}
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
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
            placeholder="e.g., ₹1000, Free, TBD"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration URL <span className="text-red-500">*</span></label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
            placeholder="https://example.com/register"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Event Images (up to 3)
          </label>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={e => {
              const files = Array.from(e.target.files || []).slice(0, 3);
              setSelectedImages(files);
            }}
            className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"/>
          </div>
          <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
      <textarea
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        rows={4}
        className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
        placeholder="Tell us about the event. Agenda, itinerary, inclusions, what to bring, etc."
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration Closes</label>
      <input
        type="date"
        value={formData.registration_closes}
        onChange={(e) => setFormData({ ...formData, registration_closes: e.target.value })}
        className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
      />
    </div>

    {error && <p className="text-red-600 font-medium text-sm whitespace-pre-line">{error}</p>}
    {success && <p className="text-green-600 font-medium text-sm">Event submitted successfully!</p>}

    <button
      type="submit"
      disabled={uploadingImages || createEventMutation.isPending}
      className={`w-full py-3 px-6 text-white font-semibold rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        uploadingImages || createEventMutation.isPending
          ? 'bg-primary-300 cursor-not-allowed'
          : 'bg-primary-500 hover:bg-primary-600 focus:ring-primary-500 dark:focus:ring-primary-400'
      }`}
    >
      {uploadingImages || createEventMutation.isPending ? 'Submitting...' : 'Submit Event'}
    </button>
    {(uploadingImages || createEventMutation.isPending) && (
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
        d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 100 16v-4l-3 3 3 3v-4a8 8 0 01-8-8z"
      />
    </svg>
    <span>{uploadingImages ? 'Uploading images...' : 'Submitting event...'}</span>
  </div>
)}
  </form>
</div>
);
}
