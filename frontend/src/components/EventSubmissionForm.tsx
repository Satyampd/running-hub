import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import ReCAPTCHA from 'react-google-recaptcha';
import { MAJOR_CITIES, PREDEFINED_EVENT_CATEGORIES } from '../config/constants';
import { formatDate } from '../utils/dateUtils';
import '../styles/custom.css';
import api from '../services/api';


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
  const [heroImageIndex, setHeroImageIndex] = useState<number | null>(null); // Initialized to null
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const googleRecaptchaKey = import.meta.env.VITE_GOOGLE_RECAPTCHA_SITE_KEY;

  const createEventMutation = useMutation({
    mutationFn: async (eventData: EventFormData) => {
      const response = await api.post('/events', {
        ...eventData,
        categories: eventData.categories.map(c => c.trim()).filter(c => c !== ''),
      });
      return response.data;
    },
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      setFormData({
        title: '', date: '', location: '', address: '', categories: [],
        price: '', url: '', description: '', registration_closes: '', photos: [],
      });
      setSelectedImages([]);
      setImageUploadProgress([]);
      setHeroImageIndex(null);
      setOtherCategoryValue('');
      setCityDropdownValue('');
      if (onSuccess) onSuccess();
      setTimeout(() => navigate('/events'), 2500);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || 'Failed to submit event.';
      setError(`Error: ${msg}`);
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const errors: string[] = [];
    if (!formData.title.trim()) errors.push('Title is required.');
    if (!formData.date) errors.push('Date is required.');
    if (!formData.location) errors.push('Location is required.');
    if (!formData.price.trim()) errors.push('Price is required.');
    if (!formData.url.trim()) errors.push('URL is required.');

    const urlRegex = /^(https?:\/\/)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?$/;
    if (!urlRegex.test(formData.url.trim())) {
      errors.push('Invalid URL');
    }

    if (formData.registration_closes && new Date(formData.registration_closes) > new Date(formData.date)) {
      errors.push('Registration closing date must be before event date.');
    }

    if (!recaptchaToken) errors.push('Please complete the reCAPTCHA.');

    if (errors.length > 0) {
      setError(errors.join('\n'));
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

          // Simulate progress for demonstration. In a real app, you'd use a progress event listener.
          // For actual upload, keep the `api.post` and `fetch` part.
          setImageUploadProgress(prev => {
            const copy = [...prev];
            copy[i] = 1; // Start progress at 1% to show it's active
            return copy;
          });

          const uploadForm = new FormData();
          uploadForm.append('type', 'event');
          uploadForm.append('event_date', formData.date);
          uploadForm.append('event_name', formData.title);
          uploadForm.append('file_ext', fileExt);
          uploadForm.append('index', (i + 1).toString());
          uploadForm.append('file', file);

          const { data } = await api.post('/media/generate-upload-url/', uploadForm, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          // Simulate upload progress with a delay (remove in production)
          // const interval = setInterval(() => {
          //   setImageUploadProgress(prev => {
          //     const copy = [...prev];
          //     if (copy[i] < 95) {
          //       copy[i] += 5; // Increment by 5%
          //     }
          //     return copy;
          //   });
          // }, 100);

          await fetch(data.upload_url, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
            // You would normally add an onUploadProgress callback here if using libraries like Axios
            // and update imageUploadProgress more dynamically.
          });

          // clearInterval(interval); // Clear simulation interval
          uploadedImageUrls.push(data.public_url);
          setImageUploadProgress(prev => {
            const copy = [...prev];
            copy[i] = 100; // Mark as 100% complete
            return copy;
          });
        }
      } catch (err) {
        setError('Image upload failed.');
        setUploadingImages(false);
        return;
      } finally {
        setUploadingImages(false);
      }

      // Reorder photos to make the hero image first if selected
      if (heroImageIndex !== null && uploadedImageUrls[heroImageIndex]) {
        const hero = uploadedImageUrls[heroImageIndex];
        uploadedImageUrls.splice(heroImageIndex, 1);
        uploadedImageUrls.unshift(hero);
      }
    }

    createEventMutation.mutate({
      ...formData,
      photos: uploadedImageUrls,
      date: formatDate(formData.date),
      registration_closes: formData.registration_closes ? formatDate(formData.registration_closes) : '',
      categories: formData.categories,
      ...(recaptchaToken ? { recaptcha_token: recaptchaToken } : {}),
    });
  };

  const handlePredefinedCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleAddOtherCategory = () => {
    const trimmed = otherCategoryValue.trim();
    if (!trimmed) return setError('Custom category cannot be empty.');
    if (formData.categories.includes(trimmed)) return setError('Category already added.');
    setFormData(prev => ({ ...prev, categories: [...prev.categories, trimmed] }));
    setOtherCategoryValue('');
  };

  const handleRemoveCategory = (cat: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.filter(c => c !== cat),
    }));
  };

  return (
    <div className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl border border-white/20 dark:border-gray-700/20">
      <form onSubmit={handleSubmit} className="space-y-6" noValidate>

        {/* Event Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Event Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Enter event title"
          />
        </div>

        {/* Event Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Event Date <span className="text-red-500">*</span></label>
          <input
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location (City) <span className="text-red-500">*</span></label>
          <select
            value={cityDropdownValue}
            onChange={(e) => {
              const val = e.target.value;
              setCityDropdownValue(val);
              setFormData({ ...formData, location: val === 'Other' ? '' : val });
            }}
            className="w-full px-4 py-3 rounded-lg border bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
          >
            <option value="">Select City</option>
            {MAJOR_CITIES.map(city => <option key={city}>{city}</option>)}
            <option value="Other">Other (Specify below)</option>
          </select>
          {cityDropdownValue === 'Other' && (
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter your city"
              className="mt-2 w-full px-4 py-3 rounded-lg border bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
            />
          )}
        </div>

        {/* Address */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Detailed Address</label>
          <textarea
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            rows={3}
            className="w-full px-4 py-3 rounded-lg border bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
            placeholder="E.g., Meeting point, landmarks"
          />
        </div>

        {/* Categories */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Event Categories</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {PREDEFINED_EVENT_CATEGORIES.map(cat => (
              <label key={cat} className="text-sm flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.categories.includes(cat)}
                  onChange={() => handlePredefinedCategoryToggle(cat)}
                  className="form-checkbox h-4 w-4 text-primary-600 transition duration-150 ease-in-out"
                />
                {cat}
              </label>
            ))}
          </div>

          <div className="flex items-center mt-3 gap-2">
            <input
              type="text"
              value={otherCategoryValue}
              onChange={(e) => setOtherCategoryValue(e.target.value)}
              className="flex-grow px-4 py-2 border rounded-lg bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
              placeholder="Add custom category"
            />
            <button
              type="button"
              onClick={handleAddOtherCategory}
              className="px-4 py-2 rounded bg-primary-500 text-white hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
            >
              Add
            </button>
          </div>

          {formData.categories.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2 text-xs">
              {formData.categories.map((cat, idx) => (
                <li key={idx} className="bg-primary-100 dark:bg-primary-800 text-primary-800 dark:text-primary-100 px-3 py-1 rounded-full flex items-center gap-1">
                  {cat}
                  <button type="button" onClick={() => handleRemoveCategory(cat)} className="text-primary-600 dark:text-primary-300 hover:text-primary-900 dark:hover:text-primary-50">×</button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Price */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price <span className="text-red-500">*</span></label>
          <input
            type="text"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
            placeholder="e.g., Free, ₹500"
          />
        </div>

        {/* URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration URL <span className="text-red-500">*</span></label>
          <input
            type="url"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
            placeholder="https://example.com"
          />
        </div>

        {/* --- Image Selection and Hero Image Logic (Integrated from previous example) --- */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Event Images (up to 3, recommended)
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
                      alt={`Event image preview ${idx + 1}`}
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
                        {/* Status indicators based on imageUploadProgress and uploadingImages */}
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
        {/* --- End Image Selection and Hero Image Logic --- */}

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-4 py-3 rounded-lg border bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Details, agenda, what to bring, etc."
          />
        </div>

        {/* Registration Closes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration Closes</label>
          <input
            type="date"
            value={formData.registration_closes}
            onChange={(e) => setFormData({ ...formData, registration_closes: e.target.value })}
            className="w-full px-4 py-3 rounded-lg border bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
          />
        </div>

        {/* reCAPTCHA */}
        <div className="mt-6">
          <ReCAPTCHA
            sitekey={googleRecaptchaKey}
            onChange={token => setRecaptchaToken(token)}
            onExpired={() => setRecaptchaToken(null)}
            className="flex justify-center"
          />
        </div>

        {/* Error/Success */}
        {error && <p className="text-red-600 text-sm whitespace-pre-line">{error}</p>}
        {success && <p className="text-green-600 text-sm">Event submitted successfully! Redirecting to Events page...</p>}

        {/* Submit */}
        <button
          type="submit"
          disabled={uploadingImages || createEventMutation.isPending}
          className={`w-full py-3 px-6 text-white font-semibold rounded-lg ${
            uploadingImages || createEventMutation.isPending
              ? 'bg-primary-300 cursor-not-allowed'
              : 'bg-primary-500 hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800'
          }`}
        >
          {uploadingImages || createEventMutation.isPending ? 'Uploading images...' : 'Submitting Event'}
        </button>
      </form>
    </div>
  );
}