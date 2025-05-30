import  {EVENT_IMAGES} from '../config/constants';

// Function to get a random image URL from the predefined list
export function getRandomEventImage() {
    const getRandomImageUrl = () => {
    const randomIndex = Math.floor(Math.random() * EVENT_IMAGES.length);
    return EVENT_IMAGES[randomIndex];
    }
    return getRandomImageUrl();
}