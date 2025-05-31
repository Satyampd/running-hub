// components/ScrollToTop.tsx
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom'; // or usePathname in Next.js 13+

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // console.log('Scrolling to top for path:', pathname);
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
