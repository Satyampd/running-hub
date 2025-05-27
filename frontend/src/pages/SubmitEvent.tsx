import React from 'react';
import EventSubmissionForm from '../components/EventSubmissionForm';

const SubmitEvent: React.FC = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 pt-20">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <EventSubmissionForm />
    </div>
  );
};

export default SubmitEvent; 