import React from 'react';
import EventSubmissionForm from '../components/EventSubmissionForm';
import FormPageLayout from '../components/FormPageLayout'; // Import the new layout component

const SubmitEvent: React.FC = () => {
  // Define the title and description content to pass to the layout
  const titleContent = (
    <>
      <span className="text-gradient">Submit</span> Your <br className="md:hidden" />
      <span className="relative">
        Running Event
        <span className="absolute bottom-1 left-0 right-0 h-3 bg-secondary-500/10"></span>
      </span>
    </>
  );

  const descriptionContent = (
    <>
      Share your running event with our community.<br/> All submissions will be reviewed before being published.
    </>
  );

  return (
    <FormPageLayout title={titleContent} description={descriptionContent}>
      <EventSubmissionForm />
    </FormPageLayout>
  );
};

export default SubmitEvent;