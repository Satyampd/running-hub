import { ReactNode } from 'react';
import { useTheme } from '../contexts/ThemeContext';

interface PageContainerProps {
  children: ReactNode;
  className?: string;
  withBackground?: boolean;
}

export default function PageContainer({ 
  children, 
  className = '', 
  withBackground = true 
}: PageContainerProps) {
  const { isDarkMode } = useTheme();
  
  return (
    <div className={`min-h-full pb-16 relative ${isDarkMode ? 'dark' : ''}`}>
      {/* Background elements */}
      {withBackground && (
        <>
          <div className="fixed inset-0 bg-white/90 dark:bg-gray-900/90 backdrop-blur-3xl -z-10" />
          <div className="fixed inset-0 overflow-hidden -z-20">
            <div className="fluid-shape fluid-shape-1"></div>
            <div className="fluid-shape fluid-shape-2"></div>
            <div className="fluid-shape fluid-shape-3"></div>
            <div className="fluid-shape fluid-shape-4"></div>
            <div className="fluid-shape fluid-shape-5"></div>
          </div>
        </>
      )}
      
      {/* Content */}
      <div className={`relative w-full ${className}`}>
        {children}
      </div>
    </div>
  );
} 