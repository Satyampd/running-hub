import PageContainer from '../components/PageContainer';

export default function TermsPage() {
  return (
    <PageContainer>
      <div className="min-h-full w-full px-4 py-16">
        <div className="max-w-4xl mx-auto bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 shadow-lg">
          <h1 className="text-4xl md:text-5xl font-bold mb-8 text-gray-900 dark:text-white">
            Terms of Use
          </h1>
          
          <div className="prose prose-lg dark:prose-invert">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">1. Acceptance of Terms</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              By accessing or using Running Hub, you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the service.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">2. Description of Service</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Running Hub provides a platform for users to discover running events across India. We aggregate information about marathons, half-marathons, trail runs, and other running events from various sources.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">3. User Conduct</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              You agree not to use Running Hub for any unlawful purpose or in any way that could damage, disable, overburden, or impair the service.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">4. Accuracy of Information</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              While we strive to provide accurate and up-to-date information about running events, we do not guarantee the accuracy, completeness, or reliability of any information on Running Hub. Users should always verify event details with the official event organizers.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">5. External Links</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              Running Hub may contain links to external websites that are not operated by us. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">6. Intellectual Property</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              All content on Running Hub, including text, graphics, logos, and software, is the property of Running Hub or its content suppliers and is protected by intellectual property laws.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">7. Changes to Terms</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              We reserve the right to modify these Terms of Use at any time. Your continued use of Running Hub after any such changes constitutes your acceptance of the new Terms of Use.
            </p>
            
            <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-100">8. Contact Us</h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              If you have any questions about these Terms of Use, please contact us at support@runninghub.in.
            </p>
          </div>
        </div>
      </div>
    </PageContainer>
  );
} 