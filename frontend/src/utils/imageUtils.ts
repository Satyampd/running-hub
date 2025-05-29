const EVENT_IMAGES = [
  'https://bitsdroid.com/wp-content/uploads/2025/05/image.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-2.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-3.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-4.jpeg',
  'https://bitsdroid.com/wp-content/uploads/2025/05/image-5.jpeg',
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

// Function to get a random image URL from the predefined list
export function getRandomEventImage() {
    const getRandomImageUrl = () => {
    const randomIndex = Math.floor(Math.random() * EVENT_IMAGES.length);
    return EVENT_IMAGES[randomIndex];
    }
    return getRandomImageUrl();
}