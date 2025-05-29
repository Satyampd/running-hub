// import React, { useState } from 'react';
// import { useMutation } from '@tanstack/react-query';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';

// interface EventSubmissionFormProps {
//   onSuccess?: () => void;
// }

// const majorCities = [
//   'Mumbai', 'Delhi NCR', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
//   'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
//   'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
// ];

// const EventSubmissionForm: React.FC<EventSubmissionFormProps> = ({ onSuccess }) => {
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     title: '',
//     date: '',
//     location: '',
//     address: '',
//     categories: [''],
//     price: '',
//     url: '',
//     description: '',
//     registration_closes: '',
//     image_url: '',
//   });

//   const [cityDropdownValue, setCityDropdownValue] = useState<string>(''); // To manage the dropdown selection ('Mumbai', 'Other', etc.)
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);

//   const createEventMutation = useMutation({
//     mutationFn: async (eventData: typeof formData) => {
//       try {
//         const response = await api.post('/events', {
//           ...eventData,
//           categories: eventData.categories.filter(cat => cat.trim() !== ''),
//         });
//         return response.data;
//       } catch (error: any) {
//         console.error('Full error:', error);
//         console.error('Response data:', error.response?.data);
//         throw error;
//       }
//     },
//     onSuccess: () => {
//       setSuccess(true);
//       setError(null);
//       if (onSuccess) {
//         onSuccess();
//       }
//       setTimeout(() => {
//         navigate('/events');
//       }, 2000);
//     },
//     onError: (error: any) => {
//       console.error('Mutation error:', error);
//       const errorMessage = 'Failed to submit event';
//       setError(`Error: ${errorMessage}`);
//       setSuccess(false);
//     },
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     createEventMutation.mutate(formData);
//   };

//   const handleCategoryChange = (index: number, value: string) => {
//     const newCategories = [...formData.categories];
//     newCategories[index] = value;
//     setFormData({ ...formData, categories: newCategories });
//   };

//   const addCategory = () => {
//     setFormData({
//       ...formData,
//       categories: [...formData.categories, ''],
//     });
//   };

//   const removeCategory = (index: number) => {
//     const newCategories = formData.categories.filter((_, i) => i !== index);
//     setFormData({ ...formData, categories: newCategories });
//   };

//   return (
//     <div className="relative py-16">
//       <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
//         <div className="text-center mb-12">
//           <h2 className="text-3xl font-bold text-gray-900 dark:text-white sm:text-4xl">Submit a Running Event</h2>
//           <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
//             Share your running event with our community. <br/> All submissions will be reviewed before being published.
//           </p>
//         </div>

//         <div className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden">
//           <div className="p-6 sm:p-8">
//             {success && (
//               <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
//                 Event submitted successfully! Redirecting to events page...
//               </div>
//             )}
            
//             {error && (
//               <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
//                 {error}
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Event Title *</label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.title}
//                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
//                   placeholder="Enter event title"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date *</label>
//                 <input
//                   type="date"
//                   required
//                   value={formData.date}
//                   onChange={(e) => setFormData({ ...formData, date: e.target.value })}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
//                 />
//               </div>

//               {/* <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location (City) *</label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.location}
//                   onChange={(e) => setFormData({ ...formData, location: e.target.value })}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
//                   placeholder="e.g., Mumbai, Delhi NCR, Bangalore"
//                 />
//               </div> */}

//              <div>
//                 <label htmlFor="location-city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location (City) *</label>
//                 <select
//                   id="location-city"
//                   value={cityDropdownValue}
//                   onChange={(e) => {
//                     const selectedValue = e.target.value;
//                     setCityDropdownValue(selectedValue);
//                     if (selectedValue === 'Other') {
//                       setFormData({ ...formData, location: '' }); // Clear location for custom input
//                     } else {
//                       setFormData({ ...formData, location: selectedValue }); // Set location from dropdown
//                     }
//                   }}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
//                 >
//                   <option value="">Select City *</option>
//                   {majorCities.map(city => (
//                     <option key={city} value={city}>{city}</option>
//                   ))}
//                   <option value="Other">Other (Please specify)</option>
//                 </select>

//                 {cityDropdownValue === 'Other' && (
//                   <input
//                     type="text"
//                     required // This HTML5 validation is a plus, main validation in handleSubmit
//                     value={formData.location} // This directly updates formData.location
//                     onChange={(e) => setFormData({ ...formData, location: e.target.value })}
//                     className="mt-2 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500"
//                     placeholder="Enter your city"
//                   />
//                 )}
//               </div>              

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Detailed Address</label>
//                 <textarea
//                   value={formData.address}
//                   onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                   rows={3}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
//                   placeholder="Enter detailed address with landmarks"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categories</label>
//                 {formData.categories.map((category, index) => (
//                   <div key={index} className="flex gap-2 mt-2">
//                     <input
//                       type="text"
//                       value={category}
//                       onChange={(e) => handleCategoryChange(index, e.target.value)}
//                       className="block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
//                       placeholder="e.g., Marathon, 10K, Trail Run"
//                     />
//                     <button
//                       type="button"
//                       onClick={() => removeCategory(index)}
//                       className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
//                     >
//                       Remove
//                     </button>
//                   </div>
//                 ))}
//                 <button
//                   type="button"
//                   onClick={addCategory}
//                   className="mt-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
//                 >
//                   + Add Category
//                 </button>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price *</label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.price}
//                   onChange={(e) => setFormData({ ...formData, price: e.target.value })}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
//                   placeholder="e.g., ₹1000, Free, TBD"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration URL *</label>
//                 <input
//                   type="url"
//                   required
//                   value={formData.url}
//                   onChange={(e) => setFormData({ ...formData, url: e.target.value })}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
//                   placeholder="https://..."
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
//                 <input
//                   type="url"
//                   value={formData.image_url}
//                   onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
//                   placeholder="https://..."
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
//                 <textarea
//                   value={formData.description}
//                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   rows={4}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
//                   placeholder="Enter event description"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration Closes</label>
//                 <input
//                   type="date"
//                   value={formData.registration_closes}
//                   onChange={(e) => setFormData({ ...formData, registration_closes: e.target.value })}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:ring-blue-500 dark:focus:ring-blue-400"
//                 />
//               </div>

//               <div>
//                 <button
//                   type="submit"
//                   disabled={createEventMutation.isPending}
//                   className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-3 px-6 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 transition-all duration-200"
//                 >
//                   {createEventMutation.isPending ? 'Submitting...' : 'Submit Event'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default EventSubmissionForm; 



// import React, { useState } from 'react';
// import { useMutation } from '@tanstack/react-query';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';
// import PageContainer from '../components/PageContainer'; // Import PageContainer
// import '../styles/custom.css'; // Ensure custom styles are imported

// interface EventSubmissionFormProps {
//   onSuccess?: () => void;
// }

// const majorCities = [
//   'Mumbai', 'Delhi NCR', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
//   'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
//   'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
// ];

// export default function EventSubmissionForm({ onSuccess }: EventSubmissionFormProps) { // Changed to default export
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     title: '',
//     date: '',
//     location: '',
//     address: '',
//     categories: [''],
//     price: '',
//     url: '',
//     description: '',
//     registration_closes: '',
//     image_url: '',
//   });

//   const [cityDropdownValue, setCityDropdownValue] = useState<string>('');
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);

//   const createEventMutation = useMutation({
//     mutationFn: async (eventData: typeof formData) => {
//       try {
//         const response = await api.post('/events', {
//           ...eventData,
//           categories: eventData.categories.filter(cat => cat.trim() !== ''),
//         });
//         return response.data;
//       } catch (error: any) {
//         console.error('Full error:', error);
//         console.error('Response data:', error.response?.data);
//         throw error;
//       }
//     },
//     onSuccess: () => {
//       setSuccess(true);
//       setError(null);
//       if (onSuccess) {
//         onSuccess();
//       }
//       setTimeout(() => {
//         navigate('/events');
//       }, 2000);
//     },
//     onError: (error: any) => {
//       console.error('Mutation error:', error);
//       const errorMessage = error.response?.data?.message || 'Failed to submit event. Please check your input.';
//       setError(`Error: ${errorMessage}`);
//       setSuccess(false);
//     },
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null); // Clear previous errors on new submission attempt

//     // Basic validation for location if 'Other' is selected
//     if (cityDropdownValue === 'Other' && !formData.location.trim()) {
//       setError("Please specify the city if 'Other' is selected.");
//       return;
//     }
    
//     // Ensure at least one category is not empty if category array is used
//     const hasValidCategory = formData.categories.some(cat => cat.trim() !== '');
//     if (formData.categories.length > 0 && !hasValidCategory) {
//         setError("Please enter at least one category or remove empty category fields.");
//         return;
//     }

//     createEventMutation.mutate(formData);
//   };

//   const handleCategoryChange = (index: number, value: string) => {
//     const newCategories = [...formData.categories];
//     newCategories[index] = value;
//     setFormData({ ...formData, categories: newCategories });
//   };

//   const addCategory = () => {
//     setFormData({
//       ...formData,
//       categories: [...formData.categories, ''],
//     });
//   };

//   const removeCategory = (index: number) => {
//     // Ensure there's always at least one empty category field if array is not empty
//     if (formData.categories.length === 1 && formData.categories[0].trim() === '') {
//         // Do nothing if it's the last empty category, or add custom logic
//         return;
//     }
//     const newCategories = formData.categories.filter((_, i) => i !== index);
//     setFormData({ ...formData, categories: newCategories.length === 0 ? [''] : newCategories }); // Keep at least one empty field if all removed
//   };

//   return (
//     <PageContainer>
//       <div className="min-h-screen w-full px-4 py-12 md:py-16 flex flex-col">
//         {/* Background Elements (copied from EventsPage/HomePage) */}
//         <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
//           <div className="absolute top-0 right-0 w-[70%] h-[50%] bg-gradient-to-br from-primary-500/5 to-secondary-500/10 rounded-[50%] blur-3xl"></div>
//           <div className="absolute bottom-0 left-0 w-[70%] h-[50%] bg-gradient-to-tr from-secondary-500/5 to-primary-500/10 rounded-[50%] blur-3xl"></div>
//         </div>

//         {/* Header Section (adapted from EventsPage/HomePage) */}
//         <header className="mb-10 md:mb-16 text-center max-w-3xl mx-auto">
//           <h1 className="text-5xl md:text-6xl font-display font-bold mb-5 tracking-tight">
//             <span className="text-gradient">Submit</span> Your <br className="md:hidden" />
//             <span className="relative">
//               Running Event
//               <span className="absolute bottom-1 left-0 right-0 h-3 bg-secondary-500/10"></span>
//             </span>
//           </h1>
//           <p className="text-xl text-gray-600 dark:text-gray-300">
//             Share your running event with our community. All submissions will be reviewed before being published.
//           </p>
//         </header>

//         {/* Form Container (Glassmorphism Card style) */}
//         <div className="relative z-10 max-w-2xl mx-auto w-full"> {/* Added w-full */}
//           <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl border border-white/20 dark:border-gray-700/20">
//             {/* Success Message */}
//             {success && (
//               <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 rounded-lg">
//                 Event submitted successfully! Redirecting to events page...
//               </div>
//             )}
            
//             {/* Error Message */}
//             {error && (
//               <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 rounded-lg">
//                 {error}
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Event Title */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Event Title <span className="text-red-500">*</span></label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.title}
//                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                   placeholder="Enter event title"
//                 />
//               </div>

//               {/* Date */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date <span className="text-red-500">*</span></label>
//                 <input
//                   type="date"
//                   required
//                   value={formData.date}
//                   onChange={(e) => setFormData({ ...formData, date: e.target.value })}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                 />
//               </div>

//              {/* Location (City) - Dropdown & Conditional Input */}
//              <div>
//                 <label htmlFor="location-city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location (City) <span className="text-red-500">*</span></label>
//                 <select
//                   id="location-city"
//                   value={cityDropdownValue}
//                   onChange={(e) => {
//                     const selectedValue = e.target.value;
//                     setCityDropdownValue(selectedValue);
//                     if (selectedValue === 'Other') {
//                       setFormData({ ...formData, location: '' }); // Clear location for custom input
//                     } else {
//                       setFormData({ ...formData, location: selectedValue }); // Set location from dropdown
//                     }
//                   }}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                 >
//                   <option value="">Select City *</option>
//                   {majorCities.map(city => (
//                     <option key={city} value={city}>{city}</option>
//                   ))}
//                   <option value="Other">Other (Please specify)</option>
//                 </select>

//                 {cityDropdownValue === 'Other' && (
//                   <input
//                     type="text"
//                     required // This HTML5 validation is a plus, main validation in handleSubmit
//                     value={formData.location} // This directly updates formData.location
//                     onChange={(e) => setFormData({ ...formData, location: e.target.value })}
//                     className="mt-2 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                     placeholder="Enter your city"
//                   />
//                 )}
//               </div>              

//               {/* Detailed Address */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Detailed Address</label>
//                 <textarea
//                   value={formData.address}
//                   onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                   rows={3}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                   placeholder="Enter detailed address with landmarks"
//                 />
//               </div>

//               {/* Categories */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categories</label>
//                 {formData.categories.map((category, index) => (
//                   <div key={index} className="flex gap-2 mt-2">
//                     <input
//                       type="text"
//                       value={category}
//                       onChange={(e) => handleCategoryChange(index, e.target.value)}
//                       className="block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                       placeholder="e.g., Marathon, 10K, Trail Run"
//                     />
//                     {formData.categories.length > 1 && ( // Only show remove button if more than one category
//                         <button
//                         type="button"
//                         onClick={() => removeCategory(index)}
//                         className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
//                         >
//                         Remove
//                         </button>
//                     )}
//                   </div>
//                 ))}
//                 <button
//                   type="button"
//                   onClick={addCategory}
//                   className="mt-2 text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
//                 >
//                   + Add Category
//                 </button>
//               </div>

//               {/* Price */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price <span className="text-red-500">*</span></label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.price}
//                   onChange={(e) => setFormData({ ...formData, price: e.target.value })}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                   placeholder="e.g., ₹1000, Free, TBD"
//                 />
//               </div>

//               {/* Registration URL */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration URL <span className="text-red-500">*</span></label>
//                 <input
//                   type="url"
//                   required
//                   value={formData.url}
//                   onChange={(e) => setFormData({ ...formData, url: e.target.value })}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                   placeholder="https://..."
//                 />
//               </div>

//               {/* Image URL */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
//                 <input
//                   type="url"
//                   value={formData.image_url}
//                   onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                   placeholder="https://..."
//                 />
//               </div>

//               {/* Description */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
//                 <textarea
//                   value={formData.description}
//                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   rows={4}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                   placeholder="Enter event description"
//                 />
//               </div>

//               {/* Registration Closes */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration Closes</label>
//                 <input
//                   type="date"
//                   value={formData.registration_closes}
//                   onChange={(e) => setFormData({ ...formData, registration_closes: e.target.value })}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                 />
//               </div>

//               {/* Submit Button */}
//               <div>
//                 <button
//                   type="submit"
//                   disabled={createEventMutation.isPending}
//                   className="w-full bg-gradient-to-r from-primary-600 to-secondary-500 hover:opacity-90 text-white py-3 px-6 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200"
//                 >
//                   {createEventMutation.isPending ? 'Submitting...' : 'Submit Event'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </PageContainer>
//   );
// }


// import React, { useState } from 'react';
// import { useMutation } from '@tanstack/react-query';
// import { useNavigate } from 'react-router-dom';
// import api from '../services/api';
// import PageContainer from '../components/PageContainer'; // Import PageContainer
// import '../styles/custom.css'; // Ensure custom styles are imported

// interface EventSubmissionFormProps {
//   onSuccess?: () => void;
// }

// const majorCities = [
//   'Mumbai', 'Delhi NCR', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
//   'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
//   'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
// ];

// export default function EventSubmissionForm({ onSuccess }: EventSubmissionFormProps) { // Changed to default export
//   const navigate = useNavigate();
//   const [formData, setFormData] = useState({
//     title: '',
//     date: '',
//     location: '',
//     address: '',
//     categories: [''],
//     price: '',
//     url: '',
//     description: '',
//     registration_closes: '',
//     image_url: '',
//   });

//   const [cityDropdownValue, setCityDropdownValue] = useState<string>('');
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState(false);

//   const createEventMutation = useMutation({
//     mutationFn: async (eventData: typeof formData) => {
//       try {
//         const response = await api.post('/events', {
//           ...eventData,
//           categories: eventData.categories.filter(cat => cat.trim() !== ''),
//         });
//         return response.data;
//       } catch (error: any) {
//         console.error('Full error:', error);
//         console.error('Response data:', error.response?.data);
//         throw error;
//       }
//     },
//     onSuccess: () => {
//       setSuccess(true);
//       setError(null);
//       if (onSuccess) {
//         onSuccess();
//       }
//       setTimeout(() => {
//         navigate('/events');
//       }, 2000);
//     },
//     onError: (error: any) => {
//       console.error('Mutation error:', error);
//       const errorMessage = error.response?.data?.message || 'Failed to submit event. Please check your input.';
//       setError(`Error: ${errorMessage}`);
//       setSuccess(false);
//     },
//   });

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     setError(null); // Clear previous errors on new submission attempt

//     // Basic validation for location if 'Other' is selected
//     if (cityDropdownValue === 'Other' && !formData.location.trim()) {
//       setError("Please specify the city if 'Other' is selected.");
//       return;
//     }
    
//     // Ensure at least one category is not empty if category array is used
//     const hasValidCategory = formData.categories.some(cat => cat.trim() !== '');
//     if (formData.categories.length > 0 && !hasValidCategory) {
//         setError("Please enter at least one category or remove empty category fields.");
//         return;
//     }

//     createEventMutation.mutate(formData);
//   };

//   const handleCategoryChange = (index: number, value: string) => {
//     const newCategories = [...formData.categories];
//     newCategories[index] = value;
//     setFormData({ ...formData, categories: newCategories });
//   };

//   const addCategory = () => {
//     setFormData({
//       ...formData,
//       categories: [...formData.categories, ''],
//     });
//   };

//   const removeCategory = (index: number) => {
//     // Ensure there's always at least one empty category field if array is not empty
//     if (formData.categories.length === 1 && formData.categories[0].trim() === '') {
//         // Do nothing if it's the last empty category, or add custom logic
//         return;
//     }
//     const newCategories = formData.categories.filter((_, i) => i !== index);
//     setFormData({ ...formData, categories: newCategories.length === 0 ? [''] : newCategories }); // Keep at least one empty field if all removed
//   };

//   return (
//     <PageContainer>
//       <div className="min-h-screen w-full px-4 py-12 md:py-16 flex flex-col">
//         {/* Background Elements (copied from EventsPage/HomePage) */}
//         <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
//           <div className="absolute top-0 right-0 w-[70%] h-[50%] bg-gradient-to-br from-primary-500/5 to-secondary-500/10 rounded-[50%] blur-3xl"></div>
//           <div className="absolute bottom-0 left-0 w-[70%] h-[50%] bg-gradient-to-tr from-secondary-500/5 to-primary-500/10 rounded-[50%] blur-3xl"></div>
//         </div>

//         {/* Header Section (adapted from EventsPage/HomePage) */}
//         <header className="mb-10 md:mb-16 text-center max-w-3xl mx-auto">
//           <h1 className="text-5xl md:text-6xl font-display font-bold mb-5 tracking-tight">
//             <span className="text-gradient">Submit</span> Your <br className="md:hidden" />
//             <span className="relative">
//               Running Event
//               <span className="absolute bottom-1 left-0 right-0 h-3 bg-secondary-500/10"></span>
//             </span>
//           </h1>
//           <p className="text-xl text-gray-600 dark:text-gray-300">
//             Share your running event with our community. All submissions will be reviewed before being published.
//           </p>
//         </header>

//         {/* Form Container (Glassmorphism Card style) */}
//         <div className="relative z-10 max-w-2xl mx-auto w-full"> {/* Added w-full */}
//           <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl border border-white/20 dark:border-gray-700/20">
//             {/* Success Message */}
//             {success && (
//               <div className="mb-6 p-4 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 rounded-lg">
//                 Event submitted successfully! Redirecting to events page...
//               </div>
//             )}
            
//             {/* Error Message */}
//             {error && (
//               <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 rounded-lg">
//                 {error}
//               </div>
//             )}

//             <form onSubmit={handleSubmit} className="space-y-6">
//               {/* Event Title */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Event Title <span className="text-red-500">*</span></label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.title}
//                   onChange={(e) => setFormData({ ...formData, title: e.target.value })}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                   placeholder="Enter event title"
//                 />
//               </div>

//               {/* Date */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date <span className="text-red-500">*</span></label>
//                 <input
//                   type="date"
//                   required
//                   value={formData.date}
//                   onChange={(e) => setFormData({ ...formData, date: e.target.value })}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                 />
//               </div>

//              {/* Location (City) - Dropdown & Conditional Input */}
//              <div>
//                 <label htmlFor="location-city" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location (City) <span className="text-red-500">*</span></label>
//                 <select
//                   id="location-city"
//                   value={cityDropdownValue}
//                   onChange={(e) => {
//                     const selectedValue = e.target.value;
//                     setCityDropdownValue(selectedValue);
//                     if (selectedValue === 'Other') {
//                       setFormData({ ...formData, location: '' }); // Clear location for custom input
//                     } else {
//                       setFormData({ ...formData, location: selectedValue }); // Set location from dropdown
//                     }
//                   }}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                 >
//                   <option value="">Select City *</option>
//                   {majorCities.map(city => (
//                     <option key={city} value={city}>{city}</option>
//                   ))}
//                   <option value="Other">Other (Please specify)</option>
//                 </select>

//                 {cityDropdownValue === 'Other' && (
//                   <input
//                     type="text"
//                     required // This HTML5 validation is a plus, main validation in handleSubmit
//                     value={formData.location} // This directly updates formData.location
//                     onChange={(e) => setFormData({ ...formData, location: e.target.value })}
//                     className="mt-2 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                     placeholder="Enter your city"
//                   />
//                 )}
//               </div>              

//               {/* Detailed Address */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Detailed Address</label>
//                 <textarea
//                   value={formData.address}
//                   onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                   rows={3}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                   placeholder="Enter detailed address with landmarks"
//                 />
//               </div>

//               {/* Categories */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Categories</label>
//                 {formData.categories.map((category, index) => (
//                   <div key={index} className="flex gap-2 mt-2">
//                     <input
//                       type="text"
//                       value={category}
//                       onChange={(e) => handleCategoryChange(index, e.target.value)}
//                       className="block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                       placeholder="e.g., Marathon, 10K, Trail Run"
//                     />
//                     {formData.categories.length > 1 && ( // Only show remove button if more than one category
//                         <button
//                         type="button"
//                         onClick={() => removeCategory(index)}
//                         className="px-3 py-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
//                         >
//                         Remove
//                         </button>
//                     )}
//                   </div>
//                 ))}
//                 <button
//                   type="button"
//                   onClick={addCategory}
//                   className="mt-2 text-sm text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
//                 >
//                   + Add Category
//                 </button>
//               </div>

//               {/* Price */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Price <span className="text-red-500">*</span></label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.price}
//                   onChange={(e) => setFormData({ ...formData, price: e.target.value })}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                   placeholder="e.g., ₹1000, Free, TBD"
//                 />
//               </div>

//               {/* Registration URL */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration URL <span className="text-red-500">*</span></label>
//                 <input
//                   type="url"
//                   required
//                   value={formData.url}
//                   onChange={(e) => setFormData({ ...formData, url: e.target.value })}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                   placeholder="https://..."
//                 />
//               </div>

//               {/* Image URL */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Image URL</label>
//                 <input
//                   type="url"
//                   value={formData.image_url}
//                   onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                   placeholder="https://..."
//                 />
//               </div>

//               {/* Description */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
//                 <textarea
//                   value={formData.description}
//                   onChange={(e) => setFormData({ ...formData, description: e.target.value })}
//                   rows={4}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                   placeholder="Enter event description"
//                 />
//               </div>

//               {/* Registration Closes */}
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration Closes</label>
//                 <input
//                   type="date"
//                   value={formData.registration_closes}
//                   onChange={(e) => setFormData({ ...formData, registration_closes: e.target.value })}
//                   className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
//                 />
//               </div>

//               {/* Submit Button */}
//               <div>
//                 <button
//                   type="submit"
//                   disabled={createEventMutation.isPending}
//                   className="w-full bg-gradient-to-r from-primary-600 to-secondary-500 hover:opacity-90 text-white py-3 px-6 rounded-lg font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 transition-all duration-200"
//                 >
//                   {createEventMutation.isPending ? 'Submitting...' : 'Submit Event'}
//                 </button>
//               </div>
//             </form>
//           </div>
//         </div>
//       </div>
//     </PageContainer>
//   );
// }

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Assuming api service is correctly set up
import PageContainer from '../components/PageContainer'; // Import PageContainer
import '../styles/custom.css'; // Ensure custom styles are imported

// --- CONSTANTS ---
const majorCities = [
  'Mumbai', 'Delhi NCR', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
  'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
  'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
];

const predefinedEventCategories = [
  'Marathon', 'Half Marathon', '10K', '5K', 'Trail Run', 'Ultra Marathon', 
  'Fun Run', 'Virtual Run', 'Charity Run', 'Relay Race', 'Kids Run'
];

interface EventSubmissionFormProps {
  onSuccess?: () => void;
}

export default function EventSubmissionForm({ onSuccess }: EventSubmissionFormProps) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    date: '', // Stored as YYYY-MM-DD from date input
    location: '',
    address: '',
    categories: [] as string[], // Will store selected categories
    price: '',
    url: '',
    description: '',
    registration_closes: '', // Stored as YYYY-MM-DD from date input
    image_url: '',
  });

  const [cityDropdownValue, setCityDropdownValue] = useState<string>('');
  const [otherCategoryValue, setOtherCategoryValue] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const createEventMutation = useMutation({
    mutationFn: async (eventData: typeof formData) => {
      try {
        const response = await api.post('/events', {
          ...eventData,
          // Ensure categories sent to backend are trimmed and non-empty
          categories: eventData.categories.map(cat => cat.trim()).filter(cat => cat !== ''),
        });
        return response.data;
      } catch (error: any) {
        console.error('Full error:', error);
        console.error('Response data:', error.response?.data);
        throw error; // Rethrow to be caught by onError
      }
    },
    onSuccess: () => {
      setSuccess(true);
      setError(null);
      setFormData({ // Optionally reset form
        title: '', date: '', location: '', address: '', categories: [],
        price: '', url: '', description: '', registration_closes: '', image_url: '',
      });
      setCityDropdownValue('');
      setOtherCategoryValue('');
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

  const handleSubmit = (e: React.FormEvent) => {
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
    if (!formData.url.trim()) validationErrors.push('Registration URL is required.');
    
    // --- Format Validations ---
    const urlRegex = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
    if (formData.url.trim() && !urlRegex.test(formData.url)) {
      validationErrors.push('Please enter a valid registration URL.');
    }
    if (formData.image_url.trim() && !urlRegex.test(formData.image_url)) {
      validationErrors.push('Please enter a valid image URL.');
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

    // Prepare data for submission (categories are already in formData.categories)
    createEventMutation.mutate({
        ...formData,
        categories: validCategories // Send only valid, trimmed categories
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
  
  // Helper to format date for display if needed, though type="date" handles its own display.
  // For values from backend or direct display:
  const formatDateForDisplay = (dateString: string) => {
    if (!dateString) return '';
    const dateObj = new Date(dateString);
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
    const year = dateObj.getFullYear();
    return `${day}/${month}/${year}`;
  };


  return (
    <PageContainer>
      <div className="min-h-screen w-full px-4 pt-20 pb-12 flex flex-col"> {/* Adjusted padding like Club form */}
        {/* Background Elements */}
        <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
          <div className="absolute top-0 right-0 w-[70%] h-[50%] bg-gradient-to-br from-primary-500/5 to-secondary-500/10 rounded-[50%] blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-[70%] h-[50%] bg-gradient-to-tr from-secondary-500/5 to-primary-500/10 rounded-[50%] blur-3xl"></div>
        </div>

        {/* Header Section */}
        <header className="mb-10 md:mb-16 text-center max-w-3xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-display font-bold mb-5 tracking-tight">
            <span className="text-gradient">Submit</span> Your <br className="md:hidden" />
            <span className="relative">
              Running Event
              <span className="absolute bottom-1 left-0 right-0 h-3 bg-secondary-500/10"></span>
            </span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Share your running event with our community. All submissions will be reviewed before being published.
          </p>
        </header>

        {/* Form Container */}
        <div className="relative z-10 max-w-2xl mx-auto w-full">
          <div className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-xl border border-white/20 dark:border-gray-700/20">
            {createEventMutation.isPending && (
              <div className="absolute inset-0 bg-white/50 dark:bg-gray-800/50 flex items-center justify-center z-50 rounded-2xl">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500"></div>
                  <span className="text-gray-600 dark:text-gray-300">Submitting event...</span>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6" noValidate>
              {/* Event Title */}
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

              {/* Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Event Date <span className="text-red-500">*</span></label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
                  placeholder="DD/MM/YYYY" // Visual hint, browser controls actual format
                />
              </div>

             {/* Location (City) */}
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
                  {majorCities.map(city => (
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

              {/* Detailed Address */}
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

              {/* Categories - New Multi-select UI */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Event Categories</label>
                
                {/* Predefined Category Checkboxes */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 mb-3">
                  {predefinedEventCategories.map(cat => (
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

                {/* "Other" Category Input */}
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

                {/* Display Selected Categories */}
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
                            &times;
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Price */}
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

              {/* Registration URL */}
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

              {/* Image URL */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Event Poster/Image URL</label>
                <input
                  type="url"
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
                  placeholder="Tell us more about the event: course details, highlights, etc."
                />
              </div>

              {/* Registration Closes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Registration Closes On</label>
                <input
                  type="date"
                  value={formData.registration_closes}
                  onChange={(e) => setFormData({ ...formData, registration_closes: e.target.value })}
                  className="mt-1 block w-full px-4 py-3 rounded-lg border border-gray-200/50 dark:border-gray-700/50 bg-white/50 dark:bg-gray-900/50 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500 focus:outline-none transition-all shadow-inner"
                  placeholder="DD/MM/YYYY" // Visual hint
                />
              </div>

              {/* Submit Button and Messages Area */}
              <div className="mt-8"> {/* Increased top margin for separation */}
                 {/* Error Message - MOVED HERE */}
                {error && (
                    <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 text-red-700 dark:text-red-300 rounded-lg flex items-center whitespace-pre-wrap">
                        <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        {error}
                    </div>
                )}
                {/* Success Message - MOVED HERE */}
                {success && (
                    <div className="mb-4 p-4 bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-300 rounded-lg flex items-center">
                         <svg className="w-5 h-5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        Event submitted successfully! Redirecting to events page...
                    </div>
                )}

                <button
                  type="submit"
                  disabled={createEventMutation.isPending}
                  className="w-full bg-gradient-to-r from-primary-600 to-secondary-500 hover:opacity-90 text-white py-3.5 px-6 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 disabled:opacity-60 transition-all duration-200 text-base" // Adjusted padding and font-size
                >
                  {createEventMutation.isPending ? 'Submitting...' : 'Submit Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}



