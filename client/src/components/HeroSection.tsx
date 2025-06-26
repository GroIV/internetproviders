import { useEffect, useRef, useState, useCallback } from "react";
import { gsap } from "gsap";
import * as THREE from "three";
import ZipCodeSearch from "./ZipCodeSearch";

// Enhanced Fiber Optic Particle System with Electricity Effects
class FiberOpticSystem {
  particles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    opacity: number;
    color: string;
    trail: Array<{x: number; y: number}>;
    energy: number;
    type: 'fiber' | 'electric' | 'data';
  }> = [];
  
  electricArcs: Array<{
    points: Array<{x: number; y: number}>;
    life: number;
    opacity: number;
    color: string;
  }> = [];
  
  dataStreams: Array<{
    path: Array<{x: number; y: number}>;
    progress: number;
    speed: number;
    color: string;
    size: number;
  }> = [];
  
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  mouseX = 0;
  mouseY = 0;
  time = 0;
  
  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, particleCount: number) {
    this.canvas = canvas;
    this.ctx = ctx;
    
    // Initialize diverse particle types
    for (let i = 0; i < particleCount; i++) {
      const type = i < particleCount * 0.4 ? 'fiber' : 
                   i < particleCount * 0.7 ? 'electric' : 'data';
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = Math.random() * Math.min(canvas.width, canvas.height) * 0.4;
      
      const colors = {
        fiber: ['#00ffff', '#00ccff', '#0099ff', '#0066ff'],
        electric: ['#ff00ff', '#ff00aa', '#aa00ff', '#ffaa00'],
        data: ['#00ff00', '#00ff88', '#88ff00', '#ffff00']
      };
      
      this.particles.push({
        x: canvas.width / 2 + Math.cos(angle) * radius,
        y: canvas.height / 2 + Math.sin(angle) * radius,
        vx: (Math.random() - 0.5) * (type === 'electric' ? 2 : 1),
        vy: (Math.random() - 0.5) * (type === 'electric' ? 2 : 1),
        size: type === 'data' ? Math.random() * 3 + 1 : Math.random() * 2 + 0.5,
        opacity: Math.random() * 0.6 + 0.4,
        color: colors[type][Math.floor(Math.random() * colors[type].length)],
        trail: [],
        energy: Math.random(),
        type
      });
    }
    
    // Initialize data streams
    for (let i = 0; i < 5; i++) {
      const path = this.generateDataPath();
      this.dataStreams.push({
        path,
        progress: Math.random(),
        speed: Math.random() * 0.02 + 0.01,
        color: ['#00ffff', '#ff00ff', '#ffff00'][Math.floor(Math.random() * 3)],
        size: Math.random() * 3 + 2
      });
    }
  }
  
  generateDataPath() {
    const points = [];
    const startX = Math.random() * this.canvas.width;
    const startY = Math.random() * this.canvas.height;
    const endX = Math.random() * this.canvas.width;
    const endY = Math.random() * this.canvas.height;
    
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = startX + (endX - startX) * t + Math.sin(t * Math.PI * 2) * 50;
      const y = startY + (endY - startY) * t + Math.cos(t * Math.PI * 3) * 50;
      points.push({ x, y });
    }
    
    return points;
  }
  
  generateElectricArc(x1: number, y1: number, x2: number, y2: number) {
    const points = [];
    const steps = 15;
    const variance = 30;
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t;
      
      if (i > 0 && i < steps) {
        const offset = (Math.random() - 0.5) * variance;
        const perpX = -(y2 - y1) / Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        const perpY = (x2 - x1) / Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
        
        points.push({
          x: x + perpX * offset,
          y: y + perpY * offset
        });
      } else {
        points.push({ x, y });
      }
    }
    
    return points;
  }
  
  update(deltaTime: number) {
    this.time += deltaTime * 0.001;
    const dt = Math.min(deltaTime / 16, 2);
    
    // Update particles
    this.particles.forEach((particle, i) => {
      // Enhanced mouse interaction
      const dx = this.mouseX - particle.x;
      const dy = this.mouseY - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance < 150) {
        const force = (1 - distance / 150) * 0.2;
        if (particle.type === 'electric') {
          // Electric particles repel
          particle.vx += (dx / distance) * force * 2;
          particle.vy += (dy / distance) * force * 2;
          
          // Create electric arc occasionally
          if (Math.random() < 0.02 && this.electricArcs.length < 10) {
            this.electricArcs.push({
              points: this.generateElectricArc(particle.x, particle.y, this.mouseX, this.mouseY),
              life: 1,
              opacity: 1,
              color: particle.color
            });
          }
        } else {
          // Other particles attract
          particle.vx -= (dx / distance) * force;
          particle.vy -= (dy / distance) * force;
        }
      }
      
      // Add some turbulence
      if (particle.type === 'fiber') {
        particle.vx += Math.sin(this.time + i) * 0.05;
        particle.vy += Math.cos(this.time + i) * 0.05;
      }
      
      // Update energy
      particle.energy = (Math.sin(this.time * 2 + i) + 1) / 2;
      
      // Update position with damping
      particle.vx *= particle.type === 'electric' ? 0.95 : 0.98;
      particle.vy *= particle.type === 'electric' ? 0.95 : 0.98;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      
      // Update trail
      particle.trail.push({ x: particle.x, y: particle.y });
      if (particle.trail.length > (particle.type === 'fiber' ? 20 : 10)) {
        particle.trail.shift();
      }
      
      // Wrap around edges
      if (particle.x < -20) particle.x = this.canvas.width + 20;
      if (particle.x > this.canvas.width + 20) particle.x = -20;
      if (particle.y < -20) particle.y = this.canvas.height + 20;
      if (particle.y > this.canvas.height + 20) particle.y = -20;
    });
    
    // Update electric arcs
    this.electricArcs = this.electricArcs.filter(arc => {
      arc.life -= 0.05;
      arc.opacity = arc.life;
      return arc.life > 0;
    });
    
    // Create random electric arcs between particles
    if (Math.random() < 0.1 && this.electricArcs.length < 15) {
      const electricParticles = this.particles.filter(p => p.type === 'electric');
      if (electricParticles.length >= 2) {
        const p1 = electricParticles[Math.floor(Math.random() * electricParticles.length)];
        const p2 = electricParticles[Math.floor(Math.random() * electricParticles.length)];
        
        const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
        if (dist < 200 && dist > 50) {
          this.electricArcs.push({
            points: this.generateElectricArc(p1.x, p1.y, p2.x, p2.y),
            life: 1,
            opacity: 1,
            color: '#ff00ff'
          });
        }
      }
    }
    
    // Update data streams
    this.dataStreams.forEach(stream => {
      stream.progress += stream.speed;
      if (stream.progress > 1) {
        stream.progress = 0;
        stream.path = this.generateDataPath();
        stream.color = ['#00ffff', '#ff00ff', '#ffff00'][Math.floor(Math.random() * 3)];
      }
    });
  }
  
  render() {
    this.ctx.save();
    
    // Set composite operation for glow effect
    this.ctx.globalCompositeOperation = 'screen';
    
    // Draw fiber optic trails
    this.particles.filter(p => p.type === 'fiber').forEach(particle => {
      if (particle.trail.length > 1) {
        this.ctx.beginPath();
        this.ctx.strokeStyle = particle.color;
        this.ctx.lineWidth = particle.size * 0.5;
        this.ctx.globalAlpha = particle.opacity * 0.3;
        
        particle.trail.forEach((point, i) => {
          if (i === 0) {
            this.ctx.moveTo(point.x, point.y);
          } else {
            this.ctx.lineTo(point.x, point.y);
          }
        });
        
        this.ctx.stroke();
      }
    });
    
    // Draw data streams
    this.dataStreams.forEach(stream => {
      const pointIndex = Math.floor(stream.progress * (stream.path.length - 1));
      const point = stream.path[pointIndex];
      
      if (point) {
        // Draw glowing orb
        const gradient = this.ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, stream.size * 4
        );
        gradient.addColorStop(0, stream.color);
        gradient.addColorStop(0.5, stream.color + '88');
        gradient.addColorStop(1, 'transparent');
        
        this.ctx.fillStyle = gradient;
        this.ctx.globalAlpha = 0.8;
        this.ctx.fillRect(
          point.x - stream.size * 4,
          point.y - stream.size * 4,
          stream.size * 8,
          stream.size * 8
        );
        
        // Draw trail
        this.ctx.beginPath();
        this.ctx.strokeStyle = stream.color;
        this.ctx.lineWidth = stream.size;
        this.ctx.globalAlpha = 0.5;
        
        const trailLength = 10;
        const startIndex = Math.max(0, pointIndex - trailLength);
        
        for (let i = startIndex; i <= pointIndex; i++) {
          const trailPoint = stream.path[i];
          const alpha = (i - startIndex) / trailLength;
          
          if (i === startIndex) {
            this.ctx.moveTo(trailPoint.x, trailPoint.y);
          } else {
            this.ctx.lineTo(trailPoint.x, trailPoint.y);
          }
        }
        
        this.ctx.stroke();
      }
    });
    
    // Draw electric arcs
    this.electricArcs.forEach(arc => {
      this.ctx.beginPath();
      this.ctx.strokeStyle = arc.color;
      this.ctx.lineWidth = 2;
      this.ctx.globalAlpha = arc.opacity * 0.8;
      this.ctx.shadowBlur = 10;
      this.ctx.shadowColor = arc.color;
      
      arc.points.forEach((point, i) => {
        if (i === 0) {
          this.ctx.moveTo(point.x, point.y);
        } else {
          this.ctx.lineTo(point.x, point.y);
        }
      });
      
      this.ctx.stroke();
      
      // Draw secondary glow
      this.ctx.strokeStyle = '#ffffff';
      this.ctx.lineWidth = 0.5;
      this.ctx.globalAlpha = arc.opacity * 0.4;
      this.ctx.stroke();
    });
    
    // Reset shadow
    this.ctx.shadowBlur = 0;
    
    // Draw all particles with glow
    this.particles.forEach(particle => {
      const glowSize = particle.size * (2 + particle.energy);
      
      // Outer glow
      const gradient = this.ctx.createRadialGradient(
        particle.x, particle.y, 0,
        particle.x, particle.y, glowSize * 3
      );
      gradient.addColorStop(0, particle.color);
      gradient.addColorStop(0.4, particle.color + '44');
      gradient.addColorStop(1, 'transparent');
      
      this.ctx.fillStyle = gradient;
      this.ctx.globalAlpha = particle.opacity * particle.energy;
      this.ctx.fillRect(
        particle.x - glowSize * 3,
        particle.y - glowSize * 3,
        glowSize * 6,
        glowSize * 6
      );
      
      // Core particle
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
      this.ctx.fillStyle = particle.color;
      this.ctx.globalAlpha = particle.opacity;
      this.ctx.fill();
      
      // Inner bright core
      this.ctx.beginPath();
      this.ctx.arc(particle.x, particle.y, particle.size * 0.5, 0, Math.PI * 2);
      this.ctx.fillStyle = '#ffffff';
      this.ctx.globalAlpha = particle.opacity * 0.8;
      this.ctx.fill();
    });
    
    // Draw connections between nearby particles
    this.ctx.globalCompositeOperation = 'lighter';
    this.particles.forEach((p1, i) => {
      this.particles.slice(i + 1).forEach(p2 => {
        const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
        
        if (dist < 100) {
          const opacity = (1 - dist / 100) * 0.3;
          
          // Create gradient line
          const gradient = this.ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
          gradient.addColorStop(0, p1.color);
          gradient.addColorStop(1, p2.color);
          
          this.ctx.beginPath();
          this.ctx.moveTo(p1.x, p1.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = gradient;
          this.ctx.lineWidth = 1;
          this.ctx.globalAlpha = opacity * Math.min(p1.energy, p2.energy);
          this.ctx.stroke();
        }
      });
    });
    
    this.ctx.restore();
  }
}

const HeroSection = () => {
  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threeMountRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const fiberSystemRef = useRef<FiberOpticSystem | null>(null);
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
    
    // Initialize Three.js globe with enhanced effects
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
      
      // Add lights for better visuals
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
      scene.add(ambientLight);
      
      const pointLight = new THREE.PointLight(0x00ffff, 2, 100);
      pointLight.position.set(5, 5, 5);
      scene.add(pointLight);
      
      // Create globe with enhanced shader material
      const geometry = new THREE.SphereGeometry(1.5, 64, 64);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          color1: { value: new THREE.Color(0x00ffff) }, // Cyan
          color2: { value: new THREE.Color(0xff00ff) }, // Magenta
          color3: { value: new THREE.Color(0xffff00) }, // Yellow
          color4: { value: new THREE.Color(0x00ff00) }  // Green
        },
        vertexShader: `
          varying vec2 vUv;
          varying vec3 vPosition;
          varying vec3 vNormal;
          uniform float time;
          
          void main() {
            vUv = uv;
            vPosition = position;
            vNormal = normal;
            
            vec3 pos = position;
            
            // Create rippling effect
            float wave1 = sin(pos.x * 10.0 + time * 2.0) * 0.03;
            float wave2 = sin(pos.y * 15.0 + time * 2.5) * 0.02;
            float wave3 = sin(pos.z * 12.0 + time * 1.8) * 0.025;
            
            float displacement = wave1 + wave2 + wave3;
            
            // Add noise-like displacement
            float noise = sin(pos.x * 20.0 + time) * sin(pos.y * 20.0 + time * 1.1) * 0.02;
            displacement += noise;
            
            pos += normal * displacement;
            
            gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
          }
        `,
        fragmentShader: `
          uniform vec3 color1;
          uniform vec3 color2;
          uniform vec3 color3;
          uniform vec3 color4;
          uniform float time;
          varying vec2 vUv;
          varying vec3 vPosition;
          varying vec3 vNormal;
          
          void main() {
            // Create animated color mixing
            float t1 = sin(vUv.x * 10.0 + time) * 0.5 + 0.5;
            float t2 = cos(vUv.y * 10.0 + time * 0.8) * 0.5 + 0.5;
            float t3 = sin((vUv.x + vUv.y) * 8.0 + time * 1.2) * 0.5 + 0.5;
            
            vec3 color = mix(color1, color2, t1);
            color = mix(color, color3, t2);
            color = mix(color, color4, t3);
            
            // Add electric glow effect
            float electricPulse = sin(time * 5.0 + vUv.x * 20.0) * 0.5 + 0.5;
            color += vec3(0.0, electricPulse * 0.3, electricPulse * 0.5);
            
            // Fresnel effect for rim lighting
            vec3 viewDirection = normalize(cameraPosition - vPosition);
            float fresnel = pow(1.0 - dot(viewDirection, vNormal), 2.0);
            color += fresnel * vec3(0.3, 0.6, 1.0);
            
            // Add brightness variations
            float brightness = sin(vUv.x * 30.0 + time * 3.0) * 0.1 + 0.9;
            color *= brightness;
            
            gl_FragColor = vec4(color, 0.9);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide
      });
      
      const globe = new THREE.Mesh(geometry, material);
      scene.add(globe);
      
      // Add multiple wireframe layers for complexity
      const wireframeColors = [0x00ffff, 0xff00ff, 0xffff00];
      const wireframes: THREE.Mesh[] = [];
      
      wireframeColors.forEach((color, index) => {
        const wireGeometry = new THREE.IcosahedronGeometry(1.52 + index * 0.05, 2 + index);
        const wireMaterial = new THREE.MeshBasicMaterial({
          color,
          wireframe: true,
          transparent: true,
          opacity: 0.1 - index * 0.02
        });
        const wireframe = new THREE.Mesh(wireGeometry, wireMaterial);
        wireframes.push(wireframe);
        scene.add(wireframe);
      });
      
      // Add particle field around globe
      const particleGeometry = new THREE.BufferGeometry();
      const particleCount = 1000;
      const positions = new Float32Array(particleCount * 3);
      const colors = new Float32Array(particleCount * 3);
      
      for (let i = 0; i < particleCount * 3; i += 3) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.random() * Math.PI;
        const radius = 2 + Math.random() * 2;
        
        positions[i] = radius * Math.sin(phi) * Math.cos(theta);
        positions[i + 1] = radius * Math.sin(phi) * Math.sin(theta);
        positions[i + 2] = radius * Math.cos(phi);
        
        const colorChoice = Math.random();
        if (colorChoice < 0.33) {
          colors[i] = 0; colors[i + 1] = 1; colors[i + 2] = 1; // Cyan
        } else if (colorChoice < 0.66) {
          colors[i] = 1; colors[i + 1] = 0; colors[i + 2] = 1; // Magenta
        } else {
          colors[i] = 1; colors[i + 1] = 1; colors[i + 2] = 0; // Yellow
        }
      }
      
      particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      
      const particleMaterial = new THREE.PointsMaterial({
        size: 0.05,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending
      });
      
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      scene.add(particles);
      
      // Animation loop for Three.js
      const animate = (time: number) => {
        material.uniforms.time.value = time * 0.001;
        
        // Rotate globe
        globe.rotation.y = time * 0.0002;
        globe.rotation.x = Math.sin(time * 0.0001) * 0.1;
        
        // Rotate wireframes at different speeds
        wireframes.forEach((wireframe, index) => {
          wireframe.rotation.y = -time * (0.0003 + index * 0.0001);
          wireframe.rotation.z = time * (0.0001 + index * 0.00005);
          wireframe.rotation.x = Math.sin(time * 0.0001) * 0.1 * (index + 1);
        });
        
        // Rotate particle field
        particles.rotation.y = time * 0.0001;
        
        // Animate point light
        pointLight.position.x = Math.sin(time * 0.001) * 5;
        pointLight.position.z = Math.cos(time * 0.001) * 5;
        pointLight.intensity = 2 + Math.sin(time * 0.005) * 0.5;
        
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
        wireframes.forEach(w => {
          w.geometry.dispose();
          (w.material as THREE.Material).dispose();
        });
        particleGeometry.dispose();
        particleMaterial.dispose();
        renderer.dispose();
      };
    }
  }, []);
  
  useEffect(() => {
    // Initialize fiber optic system
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    
    // Set up canvas with device pixel ratio
    resizeHandler();
    
    // Create fiber optic system
    fiberSystemRef.current = new FiberOpticSystem(
      canvas, 
      ctx, 
      window.innerWidth > 768 ? 60 : 30 // More particles for vibrant effect
    );
    
    // Mouse tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (fiberSystemRef.current) {
        fiberSystemRef.current.mouseX = e.clientX;
        fiberSystemRef.current.mouseY = e.clientY;
      }
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', resizeHandler);
    
    // Main animation loop
    let frameCount = 0;
    let lastFpsUpdate = 0;
    
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTimeRef.current;
      lastTimeRef.current = currentTime;
      
      // Clear canvas with slight fade for trail effect
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Update and render fiber system
      if (fiberSystemRef.current) {
        fiberSystemRef.current.update(deltaTime);
        fiberSystemRef.current.render();
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
    
    // Animate hero content with electric effect
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
    
    // Enhanced hover animations for cards
    const cards = document.querySelectorAll('.floating-card');
    cards.forEach(card => {
      card.addEventListener('mouseenter', () => {
        gsap.to(card, {
          scale: 1.05,
          duration: 0.3,
          ease: "power2.out"
        });
        
        // Add glow effect
        gsap.to(card.querySelector('.glass-card'), {
          boxShadow: "0 0 30px rgba(0, 255, 255, 0.5)",
          duration: 0.3
        });
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          scale: 1,
          duration: 0.3,
          ease: "power2.out"
        });
        
        gsap.to(card.querySelector('.glass-card'), {
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)",
          duration: 0.3
        });
      });
    });
    
    return () => {
      tl.kill();
    };
  }, [isVisible]);

  return (
    <section ref={heroRef} className="pt-20 pb-20 relative overflow-hidden min-h-[90vh] bg-black">
      <style jsx>{`
        @keyframes electric-pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        
        @keyframes data-flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        .glass-card {
          background: rgba(0, 0, 0, 0.6);
          border: 1px solid rgba(0, 255, 255, 0.3);
          backdrop-filter: blur(10px);
        }
        
        .gradient-text {
          background: linear-gradient(135deg, #00ffff, #ff00ff, #ffff00);
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        
        @keyframes gradient-shift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
      
      {/* FPS Counter */}
      <div 
        ref={fpsRef}
        className="fixed top-20 right-4 z-50 text-xs font-mono text-cyan-400"
        style={{ display: process.env.NODE_ENV === 'development' ? 'block' : 'none' }}
      />
      
      {/* Fiber optic canvas */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none"
        style={{ 
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
      />
      
      {/* Enhanced gradient orbs */}
      <div className="absolute top-20 right-0 w-[min(600px,50vw)] h-[min(600px,50vh)] opacity-50 pointer-events-none">
        <div 
          className="w-full h-full rounded-full"
          style={{ 
            background: 'radial-gradient(circle, rgba(0,255,255,0.4) 0%, transparent 70%)',
            filter: 'blur(40px)',
            animation: 'electric-pulse 2s ease-in-out infinite'
          }} 
        />
      </div>
      <div className="absolute bottom-0 left-0 w-[min(800px,60vw)] h-[min(800px,60vh)] opacity-50 pointer-events-none">
        <div 
          className="w-full h-full rounded-full"
          style={{ 
            background: 'radial-gradient(circle, rgba(255,0,255,0.4) 0%, transparent 70%)',
            filter: 'blur(40px)',
            animation: 'electric-pulse 2s ease-in-out 1s infinite'
          }} 
        />
      </div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[min(1000px,70vw)] h-[min(1000px,70vh)] opacity-30 pointer-events-none">
        <div 
          className="w-full h-full rounded-full"
          style={{ 
            background: 'radial-gradient(circle, rgba(255,255,0,0.3) 0%, transparent 70%)',
            filter: 'blur(60px)',
            animation: 'electric-pulse 3s ease-in-out 0.5s infinite'
          }} 
        />
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <h1 className="hero-title font-display text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight text-white">
              Experience{' '}
              <span className="relative inline-block">
                <span className="gradient-text bg-clip-text text-transparent">Lightning-Fast</span>
                <span 
                  className="absolute bottom-0 left-0 w-full h-1"
                  style={{
                    background: 'linear-gradient(90deg, #00ffff, #ff00ff, #ffff00)',
                    transformOrigin: 'left',
                    animation: 'underline-reveal 0.8s ease-out 0.5s forwards, data-flow 2s linear infinite',
                    transform: 'scaleX(0)'
                  }} 
                />
              </span>{' '}
              Fiber Internet
            </h1>
            <p className="hero-description text-lg sm:text-xl text-gray-300 max-w-2xl">
              Harness the power of fiber optic technology with speeds up to 10 Gbps. Our AI analyzes your needs to find the perfect high-speed connection.
            </p>
            
            {/* ZIP Code Search Form */}
            <div className="hero-search">
              <ZipCodeSearch className="max-w-xl" />
            </div>
            
            <div className="flex flex-wrap gap-6 text-sm text-gray-400">
              {[
                { icon: 'ri-flashlight-line', text: 'Up to 10 Gbps', color: 'text-cyan-400' },
                { icon: 'ri-cpu-line', text: 'AI-Powered Analysis', color: 'text-magenta-400' },
                { icon: 'ri-global-line', text: 'Nationwide Coverage', color: 'text-yellow-400' }
              ].map((item, i) => (
                <div 
                  key={i}
                  className="hero-feature flex items-center"
                >
                  <i className={`${item.icon} ${item.color} mr-2 text-lg`}></i>
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
              
              {/* Floating UI cards with neon styling */}
              <div className="absolute inset-0 pointer-events-none">
                <div 
                  className="floating-card absolute top-[10%] right-[10%] pointer-events-auto"
                >
                  <div className="glass-card p-4 rounded-xl shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                           style={{ background: 'linear-gradient(135deg, #00ffff, #0088ff)' }}>
                        <i className="ri-speed-up-line text-black font-bold" />
                      </div>
                      <div>
                        <div className="text-xs text-cyan-400">Fiber Speed</div>
                        <div className="text-lg font-bold text-white">
                          <span className="tabular-nums">10</span> Gbps
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="floating-card absolute bottom-[20%] left-[5%] pointer-events-auto"
                >
                  <div className="glass-card p-4 rounded-xl shadow-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                           style={{ background: 'linear-gradient(135deg, #ff00ff, #ff0088)' }}>
                        <i className="ri-wifi-line text-black font-bold" />
                      </div>
                      <div>
                        <div className="text-xs text-magenta-400">Low Latency</div>
                        <div className="text-lg font-bold text-white">
                          <span className="tabular-nums">&lt;1</span>ms
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div 
                  className="floating-card absolute top-[50%] left-[-5%] pointer-events-auto"
                >
                  <div className="glass-card p-3 rounded-lg shadow-xl">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                           style={{ background: 'linear-gradient(135deg, #ffff00, #ff8800)' }}>
                        <i className="ri-shield-check-line text-black text-sm font-bold" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-yellow-400 whitespace-nowrap">99.99% Uptime</div>
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