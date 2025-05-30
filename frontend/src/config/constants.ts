/**
 * Application-wide constants.
 * This file centralizes lists, default values, and other static data
 * to improve maintainability and consistency.
 */

/**
 * A list of major cities in India, primarily used for location inputs and filters.
 */
export const MAJOR_CITIES: string[] = [
  'Mumbai', 'Delhi NCR', 'Bangalore', 'Chennai', 'Kolkata', 'Hyderabad', 'Pune', 'Ahmedabad',
  'Jaipur', 'Surat', 'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal',
  'Visakhapatnam', 'Patna', 'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik',
];

/**
 * Predefined categories for running events.
 * Used in event submission forms and filter options.
 */
export const PREDEFINED_EVENT_CATEGORIES: string[] = [
  'Marathon', 'Half Marathon', '10K', '5K', '10 Miles', 'Couple Run', 'Trail Run', 'Ultra Marathon',
  'Fun Run', 'Virtual Run', 'Charity Run', 'Relay Race', 'Kids Run'
];

/**
 * Predefined skill levels for running clubs/events.
 * Used in forms and filter options.
 * Each object contains a `value` for internal use and a `label` for display.
 */
export const SKILL_LEVELS: { value: string; label: string }[] = [
  { value: "", label: "All Levels" },
  { value: "beginner", label: "Beginner Friendly" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
  { value: "all", label: "All Levels Welcome" }, // 'all' might be redundant if "" is All Levels, but keeping for now if API uses it.
];

/**
 * A list of inspirational running quotes for the HomePage.
 */
export const RUNNING_QUOTES: { quote: string; author: string }[] = [
  {
    quote: "The miracle isn't that I finished. The miracle is that I had the courage to start.",
    author: "John Bingham"
  },
  {
    quote: "Running is the greatest metaphor for life, because you get out of it what you put into it.",
    author: "Oprah Winfrey"
  },
//   {
//     quote: "Pain is temporary. Quitting lasts forever.",
//     // Note: While widely attributed to Lance Armstrong, the origin is debated. 
//     // For the purpose of this app, we'll keep the common attribution.
//     author: "Lance Armstrong"
//   },
//   {
//     quote: "I don't run to add days to my life, I run to add life to my days.",
//     author: "Ronald Rook"
//   },
//   {
//     quote: "The body achieves what the mind believes.",
//     author: "Napoleon Hill"
//   },
  {
    quote: "Ask yourself: 'Can I give more?'. The answer is usually: 'Yes'.",
    author: "Paul Tergat"
  }
];

/**
 * Items for the scrolling text banner on the HomePage.
 */
export const SCROLLER_ITEMS: string[] = [
  "New Events Weekly!",
  "All India Coverage",
  "Trail Runs & Marathons",
  "Fun Runs Included",
  "Easy Registration",
  "Join Our Community",
  "Find Your Next Race",
  "Connect With Runners"
];


export const EVENT_IMAGES = [
  'https://bitsdroid.com/wp-content/uploads/2025/05/image.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-2.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-3.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-4.jpeg',
  // 'https://bitsdroid.com/wp-content/uploads/2025/05/image-5.jpeg', 
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-6.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-7.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-8.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-9.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-10.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-11.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-12.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-13.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-14.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-15.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-16.jpeg'
];
