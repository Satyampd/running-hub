import PageContainer from '../components/PageContainer';

export default function AboutPage() {
  return (
    <PageContainer>
      <div className="min-h-full w-full px-4 py-16">
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-gray-900 dark:text-white">
              About Runzaar
            </h1>
            <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
              India's premier platform for discovering running events across the country
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <h2 className="text-3xl font-semibold mb-6 text-gray-800 dark:text-white">Our Mission</h2>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                At Runzaar, we're passionate about building India's most comprehensive platform for running enthusiasts. Our mission is to connect runners with events that match their preferences and goals.
              </p>
              <p className="text-lg text-gray-700 dark:text-gray-300">
                We believe that running is not just a sport but a transformative experience that builds physical strength, mental resilience, and community connections. By making events more discoverable, we aim to help more people embrace the joy of running.
              </p>
            </div>
            <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 shadow-lg hover-card-animation hover-shine hover-border-pulse">
              <blockquote className="text-xl italic text-gray-800 dark:text-gray-200">
                "Running has given me a sense of achievement, community, and well-being. My vision for Runzaar is to share this gift with as many people as possible across India."
              </blockquote>
              <p className="mt-4 font-semibold text-gray-900 dark:text-gray-100">— Founder, Runzaar</p>
            </div>
          </div>
          
          <div className="mb-24">
            <h2 className="text-3xl font-semibold mb-12 text-center text-gray-800 dark:text-white">What We Offer</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 shadow-lg hover-card-animation hover-shine hover-border-pulse">
                <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary-600 dark:text-primary-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Comprehensive Event Listings</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We compile and categorize running events from all across India, making it easy for you to discover races that match your preferences.
                </p>
              </div>
              
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 shadow-lg hover-card-animation hover-shine hover-border-pulse">
                <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary-600 dark:text-primary-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Location-Based Discovery</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  Find events in your city or plan your next runcation with our location-based filtering tools.
                </p>
              </div>
              
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 shadow-lg hover-card-animation hover-shine hover-border-pulse">
                <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900 rounded-2xl flex items-center justify-center mb-6">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-primary-600 dark:text-primary-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Curated Event Details</h3>
                <p className="text-gray-700 dark:text-gray-300">
                  We provide detailed information about each event, including distance options, terrain, elevation, and registration fees.
                </p>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-semibold mb-12 text-center text-gray-800 dark:text-white">Our Team</h2>
            <p className="text-xl text-center text-gray-700 dark:text-gray-300 max-w-3xl mx-auto mb-16">
              Runzaar is built by a small team of passionate runners and developers who believe in the power of running to transform lives.
            </p>
            
            <div className="flex justify-center">
              <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-lg rounded-3xl p-8 shadow-lg hover-card-animation hover-shine hover-border-pulse max-w-lg">
                <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
                  We're always looking for ways to improve Runzaar. If you have suggestions, feedback, or would like to partner with us, we'd love to hear from you!
                </p>
                <div className="flex justify-center">
                  <a href="/contact" className="btn btn-primary text-lg px-8 py-4 rounded-full hover:scale-105 transition-transform">
                    Contact Us
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </PageContainer>
  );
} 