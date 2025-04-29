import ZipCodeSearch from "./ZipCodeSearch";

const HeroSection = () => {
  return (
    <section className="pt-28 pb-20 relative overflow-hidden">
      <div className="absolute inset-0 grid-pattern opacity-50"></div>
      <div className="absolute top-20 right-0 w-1/3 h-1/3 bg-gradient-radial from-secondary-200 to-transparent opacity-40 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/3 bg-gradient-radial from-primary-200 to-transparent opacity-40 blur-3xl"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="lg:w-1/2 space-y-8 animate-slide-up">
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Find Your <span className="gradient-text">Perfect Connection</span> with AI
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl">
              Compare internet providers with our AI-powered platform that analyzes coverage, speed, and pricing in your area for personalized recommendations.
            </p>
            
            {/* ZIP Code Search Form */}
            <ZipCodeSearch className="max-w-xl" />
            
            <div className="flex flex-wrap gap-6 text-sm text-neutral-500 dark:text-neutral-400">
              <div className="flex items-center">
                <i className="ri-check-line text-primary-500 mr-2"></i>
                <span>3,500+ Providers</span>
              </div>
              <div className="flex items-center">
                <i className="ri-check-line text-primary-500 mr-2"></i>
                <span>AI-Powered Recommendations</span>
              </div>
              <div className="flex items-center">
                <i className="ri-check-line text-primary-500 mr-2"></i>
                <span>Real-time Availability</span>
              </div>
            </div>
          </div>
          
          <div className="lg:w-1/2 relative animate-fade-in">
            <div className="relative w-full h-[400px] sm:h-[500px]">
              {/* Main illustration - 3D globe with connections */}
              <div className="absolute inset-0 flex items-center justify-center animate-float">
                <div className="w-64 h-64 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 opacity-90 shadow-lg"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-72 h-72 border-2 border-dashed border-white border-opacity-30 rounded-full"></div>
                </div>
                
                {/* Orbiting elements */}
                <div className="absolute w-12 h-12 orbit" style={{ animationDelay: '-5s' }}>
                  <div className="w-full h-full hexagon bg-accent-400 shadow-lg flex items-center justify-center">
                    <i className="ri-wifi-line text-white text-xl"></i>
                  </div>
                </div>
                
                <div className="absolute w-10 h-10 orbit" style={{ animationDelay: '-10s' }}>
                  <div className="w-full h-full rounded-lg bg-primary-500 shadow-lg flex items-center justify-center">
                    <i className="ri-smartphone-line text-white text-lg"></i>
                  </div>
                </div>
                
                <div className="absolute w-14 h-14 orbit" style={{ animationDelay: '-15s' }}>
                  <div className="w-full h-full rounded-full bg-secondary-500 shadow-lg flex items-center justify-center">
                    <i className="ri-home-wifi-line text-white text-xl"></i>
                  </div>
                </div>
              </div>
              
              {/* Floating UI elements */}
              <div className="absolute top-10 right-10 w-48 card-gradient p-3 rounded-xl shadow-lg animate-bounce-slow" style={{ animationDelay: '-1s' }}>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                    <i className="ri-speed-up-line text-white"></i>
                  </div>
                  <div className="ml-3">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Average Speed</div>
                    <div className="text-sm font-semibold dark:text-white">940 Mbps</div>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-20 left-5 w-56 card-gradient p-3 rounded-xl shadow-lg animate-bounce-slow" style={{ animationDelay: '-2s' }}>
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                    <i className="ri-price-tag-3-line text-white"></i>
                  </div>
                  <div className="ml-3">
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">Best Value Plan</div>
                    <div className="text-sm font-semibold dark:text-white">$49.99/mo</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
