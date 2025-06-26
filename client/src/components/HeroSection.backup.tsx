import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import * as THREE from "three";
import ZipCodeSearch from "./ZipCodeSearch";

// Optimized particle system with spatial indexing
class OptimizedParticleSystem {
  particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    gridX: number;
    gridY: number;
  }> = [];
  
  grid: Map<string, number[]> = new Map();
  gridSize = 150; // Size of each grid cell
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  mouseX = 0;
  mouseY = 0;
  
  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, particleCount: number) {
    this.canvas = canvas;
    this.ctx = ctx;
    
    // Initialize particles with better distribution
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = Math.random() * Math.min(canvas.width, canvas.height) * 0.5;
      
      this.particles.push({
        x: canvas.width / 2 + Math.cos(angle) * radius,
        y: canvas.height / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.4 + 0.1,
        gridX: 0,
        gridY: 0
      });
    }
    
    this.updateGrid();
  }
  
  updateGrid() {
    this.grid.clear();
    
    this.particles.forEach((particle, index) => {
      particle.gridX = Math.floor(particle.x / this.gridSize);
      particle.gridY = Math.floor(particle.y / this.gridSize);
      const key = `${particle.gridX},${particle.gridY}`;
      
      if (!this.grid.has(key)) {
        this.grid.set(key, []);
      }
      this.grid.get(key)!.push(index);
    });
  }
  
  getNeighbors(particle: typeof this.particles[0]): number[] {
    const neighbors: number[] = [];
    
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const key = `${particle.gridX + dx},${particle.gridY + dy}`;
        const cellParticles = this.grid.get(key);
        if (cellParticles) {
          neighbors.push(...cellParticles);
        }
      }
    }
    
    return neighbors;
  }
  
  update(deltaTime: number) {
    const dt = Math.min(deltaTime / 16, 2); // Normalize to 60fps
    
    this.particles.forEach(particle => {
      // Mouse interaction
      const dx = this.mouseX - particle.x;
      const dy = this.mouseY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 100) {
        const force = (1 - distance / 100) * 0.1;
        particle.vx -= (dx / distance) * force;
        particle.vy -= (dy / distance) * force;
      }
      
      // Update position with damping
      particle.vx *= 0.99;
      particle.vy *= 0.99;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      
      // Wrap around edges smoothly
      if (particle.x < -10) particle.x = this.canvas.width + 10;
      if (particle.x > this.canvas.width + 10) particle.x = -10;
      if (particle.y < -10) particle.y = this.canvas.height + 10;
      if (particle.y > this.canvas.height + 10) particle.y = -10;
    });
    
    this.updateGrid();
  }
  
  render() {
    // Batch rendering with a single path
    this.ctx.save();
    
    // Draw all particles in one batch
    this.ctx.beginPath();
    this.particles.forEach(particle => {
      this.ctx.moveTo(particle.x + particle.size, particle.y);
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
    });
    this.ctx.fillStyle = 'rgba(59, 130, 246, 0.3)';
    this.ctx.fill();
    
    // Draw connections using spatial indexing
    this.ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)';
    this.ctx.lineWidth = 0.5;
    this.ctx.beginPath();
    
    this.particles.forEach((particle, i) => {
      const neighbors = this.getNeighbors(particle);
      
      neighbors.forEach(j => {
        if (j > i) { // Avoid duplicate connections
          const p2 = this.particles[j];
          const dx = particle.x - p2.x;
          const dy = particle.y - p2.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < this.gridSize) {
            this.ctx.moveTo(particle.x, particle.y);
            this.ctx.lineTo(p2.x, p2.y);
          }
        }
      });
    });
    
    this.ctx.stroke();
    this.ctx.restore();
  }
}

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeMountRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const particleSystemRef = useRef<OptimizedParticleSystem | null>(null);
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);
  const fpsRef = useRef<HTMLDivElement>(null);
  
  // Initialize GSAP timeline
  const tlRef = useRef<gsap.core.Timeline>();
  
  // Debounced resize handler
  const resizeHandler = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = window.innerWidth * dpr;
    canvas.height = window.innerHeight * dpr;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.scale(dpr, dpr);
    }
  }, []);
  
  useEffect(() => {
    setIsVisible(true);
    
    // Initialize Three.js globe
    if (threeMountRef.current) {
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
      camera.position.z = 5;
      
      const renderer = new THREE.WebGLRenderer({ 
        alpha: true, 
        antialias: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(400, 400);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      threeMountRef.current.appendChild(renderer.domElement);
      
      // Create globe with shader material
      const geometry = new THREE.SphereGeometry(1.5, 64, 64);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color(0x3b82f6) },
          color2: { value: new THREE.Color(0xa855f7) },
          color3: { value: new THREE.Color(0xec4899) }
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vPosition;
          uniform float time;
          
          void main() {
            vUv = uv;
            vPosition = position;
            
            vec3 pos = position;
            float displacement = sin(pos.x * 10.0 + time) * 0.02;
            displacement += sin(pos.y * 10.0 + time * 1.1) * 0.02;
            displacement += sin(pos.z * 10.0 + time * 0.9) * 0.02;
            
            pos += normal * displacement;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
          uniform vec3 color3;
          uniform float time;
          varying vec2 vUv;
          varying vec3 vPosition;
          
          void main() {
            float mixValue1 = sin(vUv.x * 10.0 + time) * 0.5 + 0.5;
            float mixValue2 = cos(vUv.y * 10.0 + time * 0.8) * 0.5 + 0.5;
            
            vec3 color = mix(color1, color2, mixValue1);
            color = mix(color, color3, mixValue2);
            
            float fresnel = pow(1.0 - dot(normalize(vPosition), vec3(0.0, 0.0, 1.0)), 2.0);
            color += fresnel * 0.3;
            
            gl_FragColor = vec4(color, 0.8);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide
      });
      
      const globe = new THREE.Mesh(geometry, material);
      scene.add(globe);
      
      // Add wireframe overlay
      const wireframeGeometry = new THREE.IcosahedronGeometry(1.52, 2);
      const wireframeMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        wireframe: true,
        transparent: true,
        opacity: 0.1
      });
      const wireframe = new THREE.Mesh(wireframeGeometry, wireframeMaterial);
      scene.add(wireframe);
      
      // Animation loop for Three.js
      const animate = (time: number) => {
        material.uniforms.time.value = time * 0.001;
        globe.rotation.y = time * 0.0002;
        globe.rotation.x = Math.sin(time * 0.0001) * 0.1;
        wireframe.rotation.y = -time * 0.0003;
        wireframe.rotation.z = time * 0.0001;
        
        renderer.render(scene, camera);
      };
      
      // Store animation function for RAF
      (window as any).threeAnimate = animate;
      
      // Cleanup
      return () => {
        if (threeMountRef.current?.contains(renderer.domElement)) {
          threeMountRef.current.removeChild(renderer.domElement);
        }
        geometry.dispose();
        material.dispose();
        wireframeGeometry.dispose();
        wireframeMaterial.dispose();
        renderer.dispose();
      };
    }
  }, []);
  
  useEffect(() => {
    // Initialize particle system
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    
    // Set up canvas with device pixel ratio
    resizeHandler();
    
    // Create optimized particle system
    particleSystemRef.current = new OptimizedParticleSystem(
      canvas, 
      ctx, 
      window.innerWidth > 768 ? 40 : 20 // Fewer particles on mobile
    );
    
    // Mouse tracking with throttling
    let mouseTimeout: NodeJS.Timeout;
    const handleMouseMove = (e: MouseEvent) => {
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        if (particleSystemRef.current) {
          particleSystemRef.current.mouseX = e.clientX;
          particleSystemRef.current.mouseY = e.clientY;
        }
      }, 16); // 60fps throttle
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeHandler);
    
    // Main animation loop with FPS counter
    let frameCount = 0;
    let lastFpsUpdate = 0;
    
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Update and render particles
      if (particleSystemRef.current) {
        particleSystemRef.current.update(deltaTime);
        particleSystemRef.current.render();
      }
      
      // Call Three.js animation
      if ((window as any).threeAnimate) {
        (window as any).threeAnimate(currentTime);
      }
      
      // FPS counter
      frameCount++;
      if (currentTime - lastFpsUpdate > 1000) {
        if (fpsRef.current) {
          fpsRef.current.textContent = `${Math.round(frameCount * 1000 / (currentTime - lastFpsUpdate))} FPS`;
        }
        frameCount = 0;
        lastFpsUpdate = currentTime;
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animationFrameRef.current = requestAnimationFrame(animate);
    
    return () => {
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [resizeHandler]);
  
  useEffect(() => {
    // GSAP animations for UI elements
    if (!isVisible) return;
    
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
    tlRef.current = tl;
    
    // Animate hero content
    tl.from(".hero-title", {
      y: 30,
      opacity: 0,
      duration: 1,
      stagger: 0.1
    })
    .from(".hero-description", {
      y: 20,
      opacity: 0,
      duration: 0.8
    }, "-=0.5")
    .from(".hero-search", {
      scale: 0.9,
      opacity: 0,
      duration: 0.6
    }, "-=0.4")
    .from(".hero-feature", {
      x: -20,
      opacity: 0,
      duration: 0.5,
      stagger: 0.1
    }, "-=0.3")
    .from(".floating-card", {
      scale: 0,
      opacity: 0,
      duration: 0.6,
      stagger: 0.2,
      ease: "back.out(1.7)"
    }, "-=0.5");
    
    // Hover animations for cards
    const cards = document.querySelectorAll('.floating-card');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out"
        });
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
      });
    });
    
    return () => {
      tl.kill();
    };
  }, [isVisible]);

  return (
    <section ref={heroRef} className="pt-28 pb-20 relative overflow-hidden min-h-[90vh]">
      {/* FPS Counter */}
      <div 
        ref={fpsRef}
        className="fixed top-20 right-4 z-50 text-xs font-mono text-neutral-500 dark:text-neutral-400"
        style={{ display: process.env.NODE_ENV === 'development' ? 'block' : 'none' }}
      />
      
      {/* Optimized particle canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 opacity-40 dark:opacity-30 pointer-events-none"
        style={{ 
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />
      
      {/* Gradient orbs with improved performance */}
      <div className="absolute top-20 right-0 w-[min(600px,50vw)] h-[min(600px,50vh)] opacity-30 pointer-events-none">
        <div 
          className="w-full h-full rounded-full bg-gradient-to-br from-primary-400 to-transparent blur-3xl"
          style={{ 
            willChange: 'transform, opacity',
            animation: 'pulse-slow 4s ease-in-out infinite'
          }} 
        />
      </div>
      <div className="absolute bottom-0 left-0 w-[min(800px,60vw)] h-[min(800px,60vh)] opacity-30 pointer-events-none">
        <div 
          className="w-full h-full rounded-full bg-gradient-to-tr from-secondary-400 to-transparent blur-3xl"
          style={{ 
            willChange: 'transform, opacity',
            animation: 'pulse-slow 4s ease-in-out 2s infinite'
          }} 
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="hero-title font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Find Your{' '}
              <span className="relative inline-block">
                <span className="gradient-text animate-gradient-x">Perfect Connection</span>
                <span 
                  className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-primary-500 to-secondary-500"
                  style={{
                    transformOrigin: 'left',
                    animation: 'underline-reveal 0.8s ease-out 0.5s forwards',
                    transform: 'scaleX(0)'
                  }} 
                />
              </span>{' '}
              with AI
            </h1>
            <p className="hero-description text-lg sm:text-xl text-neutral-600 dark:text-neutral-300 max-w-2xl">
              Compare internet providers with our AI-powered platform that analyzes coverage, speed, and pricing in your area for personalized recommendations.
            </p>
            
            {/* ZIP Code Search Form */}
            <div className="hero-search">
              <ZipCodeSearch className="max-w-xl" />
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm text-neutral-500 dark:text-neutral-400">
              {[
                { icon: 'ri-check-line', text: '3,500+ Providers' },
                { icon: 'ri-check-line', text: 'AI-Powered Recommendations' },
                { icon: 'ri-check-line', text: 'Real-time Availability' }
              ].map((item, i) => (
                <div 
                  key={i}
                  className="hero-feature flex items-center"
                >
                  <i className={`${item.icon} text-primary-500 mr-2`}></i>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="relative w-full h-[400px] sm:h-[500px] flex items-center justify-center">
              {/* Three.js Globe Container */}
              <div 
                ref={threeMountRef} 
                className="absolute inset-0 flex items-center justify-center"
                style={{ perspective: '1000px' }}
              />
              
              {/* Floating UI cards with improved positioning */}
              <div className="absolute inset-0 pointer-events-none">
                <div 
                  className="floating-card absolute top-[10%] right-[10%] pointer-events-auto"
                >
                  <div className="glass-card p-4 rounded-xl shadow-xl backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                        <i className="ri-speed-up-line text-white animate-pulse" />
                      </div>
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">Average Speed</div>
                        <div className="text-lg font-bold dark:text-white">
                          <span className="tabular-nums">940</span> Mbps
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="floating-card absolute bottom-[20%] left-[5%] pointer-events-auto"
                >
                  <div className="glass-card p-4 rounded-xl shadow-xl backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center flex-shrink-0">
                        <i className="ri-price-tag-3-line text-white animate-pulse" />
                      </div>
                      <div>
                        <div className="text-xs text-neutral-500 dark:text-neutral-400">Best Value Plan</div>
                        <div className="text-lg font-bold dark:text-white">
                          $<span className="tabular-nums">49.99</span>/mo
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="floating-card absolute top-[50%] left-[-5%] pointer-events-auto"
                >
                  <div className="glass-card p-3 rounded-lg shadow-xl backdrop-blur-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center flex-shrink-0">
                        <i className="ri-shield-check-line text-white text-sm" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold dark:text-white whitespace-nowrap">99.9% Uptime</div>
                      </div>
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