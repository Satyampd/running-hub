// src/pages/SubmitClub.tsx
import React from 'react';
import ClubSubmissionForm from '../components/ClubSubmissionForm';
import FormPageLayout from '../components/FormPageLayout'; // Import the new layout component

const SubmitClub: React.FC = () => {
  // Define the title and description content to pass to the layout
  const titleContent = (
    <>
      <span className="text-gradient">Register</span> Your <br className="md:hidden" />
      <span className="relative">
        Running Club
        <span className="absolute bottom-1 left-0 right-0 h-3 bg-secondary-500/10"></span>
      </span>
    </>
  );

  const descriptionContent = (
    <>
      Share your running club with our community, help runners find their perfect running group! <br/> All submissions will be reviewed before being published.
    </>
  );

  return (
    <FormPageLayout title={titleContent} description={descriptionContent}>
      <ClubSubmissionForm />
    </FormPageLayout>
  );
};

export default SubmitClub;