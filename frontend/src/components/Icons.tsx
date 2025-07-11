/**
 * Centralized repository for SVG icons used throughout the application.
 * This helps in reducing code duplication and managing icons efficiently.
 */

interface IconProps {
  className?: string;
  // Add other common props like onClick if needed in the future
}

export const MoonIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
  </svg>
);

export const SunIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
  </svg>
);

export const MenuIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
  </svg>
);

export const CloseIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-6 h-6"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export const CalendarIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
  </svg>
);

export const LocationIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
  </svg>
);

export const ArrowIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={className || "w-5 h-5"}>
    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L10.23 5.29a.75.75 0 111.04-1.08l5.5 5.25a.75.75 0 010 1.08l-5.5 5.25a.75.75 0 11-1.04-1.08l4.158-3.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
  </svg>
);

export const TwitterIcon = ({ className }: IconProps) => (
  <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" className={className || "w-5 h-5"}>
    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
  </svg>
);

export const InstagramIcon = ({ className }: IconProps) => (
  <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" className={className || "w-5 h-5"}>
    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353-.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
  </svg>
);

export const FacebookIcon = ({ className }: IconProps) => (
  <svg fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" className={className || "w-5 h-5"}>
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

export const RunIcon = ({ className }: IconProps) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className || "w-6 h-6"}>
    <path d="M15 7.5C16.3807 7.5 17.5 6.38071 17.5 5C17.5 3.61929 16.3807 2.5 15 2.5C13.6193 2.5 12.5 3.61929 12.5 5C12.5 6.38071 13.6193 7.5 15 7.5Z" fill="currentColor"></path>
    <path d="M13.2632 21H11.4C10.8477 21 10.4 20.5523 10.4 20C10.4 19.4477 10.8477 19 11.4 19H13.2632C13.4891 19 13.6993 18.8825 13.8268 18.6938L16.3 15.0884L14.0368 13.6389C13.9743 13.5954 13.9184 13.5416 13.8711 13.4797L11.563 10.3764C11.1815 9.85362 10.5999 9.5 9.9649 9.5H7.29692C6.32836 9.5 5.40213 9.90067 4.73223 10.6001L3 12.3922L4.40001 13.8321C4.7528 14.192 5.31251 14.2037 5.67871 13.8593L6.55341 13.0393C6.69895 12.9036 6.90111 12.8699 7.08508 12.9493C7.26904 13.0287 7.4 13.208 7.4 13.4086V20C7.4 20.5523 7.84772 21 8.4 21C8.95228 21 9.4 20.5523 9.4 20V15.6701C9.4 15.4237 9.58671 15.2179 9.8312 15.1847C10.0757 15.1516 10.3089 15.3097 10.3676 15.5458L11.0947 18.5458C11.2669 19.2547 11.9078 19.7514 12.6404 19.7514H12.6631C13.4224 19.7514 14.0788 19.2142 14.2197 18.4725L14.6059 16.5014C14.652 16.2868 14.8452 16.1356 15.0669 16.1356C15.2339 16.1356 15.389 16.2224 15.476 16.3616L17.8182 20.2178C17.9652 20.4548 18.2248 20.5983 18.5027 20.5983H20.6C21.1523 20.5983 21.6 20.1506 21.6 19.5983C21.6 19.046 21.1523 18.5983 20.6 18.5983H19.0046C18.8354 18.5983 18.6784 18.5093 18.591 18.3658L16.5526 15.0396C16.1499 14.3986 16.1188 13.5983 16.4697 12.9276L16.7368 12.394C17.1323 11.6037 17.8692 11.0519 18.7318 10.898L21 10.5V8.5L18.6993 8.90147C17.2808 9.13496 16.085 9.99612 15.4187 11.2307L15.1515 11.7642C15.0669 11.9335 14.8985 12.0382 14.7143 12.026L12.7396 11.8941C12.3916 11.8705 12.1396 11.5711 12.1897 11.2265L12.4619 9.59853C12.5831 8.7564 13.1477 8.03519 13.9387 7.72731L16.8214 6.39946C17.1555 6.2428 17.3451 5.87458 17.2539 5.51727C17.1628 5.15996 16.8262 4.9211 16.4601 4.97039L13.4062 5.41125C12.4873 5.52803 11.6615 6.01771 11.1032 6.76513L8.34528 10.5698C8.17978 10.789 7.907 10.8939 7.6477 10.8341C7.3884 10.7743 7.19642 10.5593 7.16541 10.2962L6.83652 7.98242C6.79072 7.59179 6.46859 7.29449 6.07609 7.27681L3.4 7.15V9.15L5.24964 9.24286C5.44364 9.25255 5.60889 9.39328 5.64872 9.58288L5.90439 10.8744L6.97368 9.75842C7.94047 8.75634 9.26551 8.2 10.65 8.2H12.2286C12.4034 8.2 12.5661 8.28158 12.6643 8.42051L14.3286 10.8154C14.4555 10.9975 14.4608 11.2392 14.3417 11.4266L13.2632 13H16L17.5625 11L15 7.5" fill="currentColor"></path>
  </svg>
);

export const SearchIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5 text-gray-400 dark:text-gray-500"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
  </svg>
);

export const FilterIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-5 h-5 mr-2 dark:text-gray-400"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c2.755 0 5.455.232 7.998.654a.75.75 0 01.752.752V6.69a.75.75 0 01-.34.632l-4.072 3.29a.75.75 0 00-.34.633v4.037c0 .19-.08.37-.214.504l-2.21 2.056a.75.75 0 01-1.062-.006l-2.198-2.05a.75.75 0 01-.217-.506V11.343a.75.75 0 00-.34-.632L3.6 7.422a.75.75 0 01-.34-.632V4.406a.75.75 0 01.752-.752C6.545 3.232 9.245 3 12 3z" />
  </svg>
);

export const UsersIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4 mr-1"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
  </svg>
);

export const ClockIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4 mr-1"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export const PriceIcon = ({ className }: IconProps) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4 mr-1"}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659L9 10.341M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
); 

// MapPinIcon
export const MapPinIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z"
    />
  </svg>
);

// SparklesIcon
export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    {...props}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9.813 15.904L9.043 17.5 12 21.485 14.957 17.5l-.77-1.596M10.985 19.027l.004-.004L12 21.485l-1.015-2.458zm6.577-6.08a.9.9 0 01.077-.735c.135-.386.375-.72.684-1.002m.475-4.502a.9.9 0 01.077-.735c.135-.386.375-.72.684-1.002M9.813 9.096L9.043 7.5 12 3.515 14.957 7.5l-.77 1.596M10.985 4.973l.004-.004L12 3.515l-1.015 2.458z"
    />
  </svg>
);
