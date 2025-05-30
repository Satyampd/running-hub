// src/components/FormPageLayout.tsx
import React from 'react';
import PageContainer from './PageContainer'; 
interface FormPageLayoutProps {
  title: React.ReactNode; // Allows for rich HTML like spans for styling parts of the title
  description: React.ReactNode; // Allows for rich HTML for description
  children: React.ReactNode; // The actual form component
}

const FormPageLayout: React.FC<FormPageLayoutProps> = ({ title, description, children }) => {
  return (
    // Outer container for full-screen background and top padding
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20">
      {/* Absolute background patterns (from original SubmitEvent) */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5 dark:opacity-10"></div>
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-[70%] h-[50%] bg-gradient-to-br from-primary-500/5 to-secondary-500/10 rounded-[50%] blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[70%] h-[50%] bg-gradient-to-tr from-secondary-500/5 to-primary-500/10 rounded-[50%] blur-3xl"></div>
      </div>

      {/* Main content area, structured similarly to original forms */}
      {/* PageContainer should wrap the main content for consistent max-width/padding */}
      <PageContainer>
        <div className="w-full px-4 pb-12 flex flex-col items-center"> {/* Added items-center to center the header and form card */}
          {/* Header Section */}
          <header className="mb-10 md:mb-16 text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-display font-bold mb-5 tracking-tight">
              {title}
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              {description}
            </p>
          </header>

          {/* Form Container (the card itself) - children will be rendered here */}
          <div className="relative z-10 max-w-2xl mx-auto w-full">
            {children}
          </div>
        </div>
      </PageContainer>
    </div>
  );
};

export default FormPageLayout;

