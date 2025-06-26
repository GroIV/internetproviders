import { useEffect, useRef, useState } from "react";
import ZipCodeSearch from "./ZipCodeSearch";

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    setIsVisible(true);
    
    // Simple particle system
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
    }> = [];
    
    // Create particles
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1
      });
    }
    
    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and draw particles
      particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.fill();
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section className="pt-28 pb-20 relative overflow-hidden min-h-[90vh]">
      {/* Particle canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 opacity-30"
        style={{ pointerEvents: 'none' }}
      />
      
      {/* Gradient orbs */}
      <div className="absolute top-20 right-0 w-96 h-96 opacity-30">
        <div className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-transparent blur-3xl animate-pulse-slow" />
      </div>
      <div className="absolute bottom-0 left-0 w-96 h-96 opacity-30">
        <div className="w-full h-full rounded-full bg-gradient-to-tr from-secondary-400 to-transparent blur-3xl animate-pulse-slow-delayed" />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className={`space-y-8 transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Find Your{' '}
              <span className="gradient-text">Perfect Connection</span>{' '}
              with AI
            </h1>
            <p className="text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl">
              Compare internet providers with our AI-powered platform that analyzes coverage, speed, and pricing in your area for personalized recommendations.
            </p>
            
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
          
          <div className={`relative transition-all duration-1000 ${
            isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'
          }`} style={{ transitionDelay: '200ms' }}>
            <div className="relative w-full h-[400px] sm:h-[500px] flex items-center justify-center">
              {/* Simple animated globe */}
              <div className="relative w-80 h-80 animate-spin-slow">
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary-500 via-secondary-500 to-accent-500 opacity-80" />
                <div className="absolute inset-4 rounded-full border-2 border-white/20" />
                <div className="absolute inset-8 rounded-full bg-white/20 blur-xl" />
              </div>
              
              {/* Floating cards */}
              <div className="absolute top-10 right-10 card-float">
                <div className="glass-card p-4 rounded-xl shadow-xl backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                      <i className="ri-speed-up-line text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">Average Speed</div>
                      <div className="text-lg font-bold dark:text-white">940 Mbps</div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="absolute bottom-20 left-5 card-float" style={{ animationDelay: '1s' }}>
                <div className="glass-card p-4 rounded-xl shadow-xl backdrop-blur-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center">
                      <i className="ri-price-tag-3-line text-white" />
                    </div>
                    <div>
                      <div className="text-xs text-neutral-500 dark:text-neutral-400">Best Value</div>
                      <div className="text-lg font-bold dark:text-white">$49.99/mo</div>
                    </div>
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