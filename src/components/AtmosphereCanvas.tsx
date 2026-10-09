import React, { useEffect, useRef } from 'react';
import { AtmosphereType, Mood } from '../types';

interface AtmosphereCanvasProps {
  atmosphere: AtmosphereType;
  mood: Mood;
  intensity?: 'subtle' | 'normal' | 'rich';
  reducedMotion?: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  color: string;
  pulseSpeed?: number;
  pulsePhase?: number;
  length?: number; // for rain streaks
}

export const AtmosphereCanvas: React.FC<AtmosphereCanvasProps> = ({
  atmosphere,
  mood,
  intensity = 'normal',
  reducedMotion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Background gradient colors based on atmosphere and mood
  const getAtmosphereGradient = () => {
    switch (atmosphere) {
      case 'rain':
        return {
          bg1: '#090d14',
          bg2: '#0e1624',
          accent: 'rgba(56, 189, 248, 0.05)',
        };
      case 'night':
        return {
          bg1: '#07090e',
          bg2: '#0d131f',
          accent: 'rgba(129, 140, 248, 0.04)',
        };
      case 'forest':
        return {
          bg1: '#080d09',
          bg2: '#0f1712',
          accent: 'rgba(52, 211, 153, 0.04)',
        };
      case 'sunrise':
        return {
          bg1: '#120c09',
          bg2: '#1b1410',
          accent: 'rgba(251, 191, 36, 0.05)',
        };
      case 'fireplace':
        return {
          bg1: '#110907',
          bg2: '#1c100b',
          accent: 'rgba(249, 115, 22, 0.05)',
        };
      case 'minimal':
      default:
        // Adjust for emotional nuance even in minimal
        if (mood === 'melancholic') return { bg1: '#0a0d13', bg2: '#101520', accent: 'rgba(99, 102, 241, 0.03)' };
        if (mood === 'peaceful') return { bg1: '#090e0b', bg2: '#0e1511', accent: 'rgba(16, 185, 129, 0.03)' };
        if (mood === 'joyful') return { bg1: '#110e08', bg2: '#18140c', accent: 'rgba(245, 158, 11, 0.03)' };
        if (mood === 'romantic') return { bg1: '#110910', bg2: '#191019', accent: 'rgba(236, 72, 153, 0.03)' };
        return { bg1: '#0a0c10', bg2: '#101318', accent: 'rgba(255, 255, 255, 0.02)' };
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // Particle count multiplier
    const countMultiplier = intensity === 'subtle' ? 0.45 : intensity === 'rich' ? 1.6 : 1.0;
    let particles: Particle[] = [];

    const initParticles = () => {
      particles = [];
      const isRain = atmosphere === 'rain';
      const isNight = atmosphere === 'night';
      const isForest = atmosphere === 'forest';
      const isSunrise = atmosphere === 'sunrise';
      const isFireplace = atmosphere === 'fireplace';

      let count = 40;
      if (isRain) count = 85;
      else if (isNight) count = 70;
      else if (isForest) count = 50;
      else if (isSunrise) count = 55;
      else if (isFireplace) count = 45;

      count = Math.floor(count * countMultiplier);

      for (let i = 0; i < count; i++) {
        if (isRain) {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: -0.8 - Math.random() * 0.8,
            vy: 9 + Math.random() * 9,
            size: 1 + Math.random() * 1.2,
            length: 14 + Math.random() * 18,
            alpha: 0.15 + Math.random() * 0.25,
            baseAlpha: 0.15 + Math.random() * 0.25,
            color: '#a5c4d4',
          });
        } else if (isNight) {
          // Twinkling celestial stars
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.08,
            vy: (Math.random() - 0.5) * 0.08,
            size: 0.8 + Math.random() * 1.6,
            alpha: 0.2 + Math.random() * 0.5,
            baseAlpha: 0.2 + Math.random() * 0.5,
            pulseSpeed: 0.01 + Math.random() * 0.02,
            pulsePhase: Math.random() * Math.PI * 2,
            color: Math.random() > 0.3 ? '#c7d2fe' : '#e0e7ff',
          });
        } else if (isForest) {
          // Floating green and emerald spores
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: 0.15 + Math.random() * 0.3,
            vy: (Math.random() - 0.5) * 0.2,
            size: 1.2 + Math.random() * 2.2,
            alpha: 0.15 + Math.random() * 0.35,
            baseAlpha: 0.15 + Math.random() * 0.35,
            pulseSpeed: 0.015 + Math.random() * 0.02,
            pulsePhase: Math.random() * Math.PI * 2,
            color: Math.random() > 0.4 ? '#6ee7b7' : '#a7f3d0',
          });
        } else if (isSunrise) {
          // Warm rising golden dust motes
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.25,
            vy: -0.3 - Math.random() * 0.5,
            size: 1.5 + Math.random() * 2.5,
            alpha: 0.2 + Math.random() * 0.4,
            baseAlpha: 0.2 + Math.random() * 0.4,
            pulseSpeed: 0.01 + Math.random() * 0.02,
            pulsePhase: Math.random() * Math.PI * 2,
            color: Math.random() > 0.3 ? '#fde68a' : '#fef3c7',
          });
        } else if (isFireplace) {
          // Ascending warm ember sparks
          particles.push({
            x: Math.random() * width,
            y: height - Math.random() * height * 0.7,
            vx: (Math.random() - 0.5) * 0.4,
            vy: -0.6 - Math.random() * 1.1,
            size: 1.2 + Math.random() * 2.4,
            alpha: 0.25 + Math.random() * 0.5,
            baseAlpha: 0.25 + Math.random() * 0.5,
            pulseSpeed: 0.03 + Math.random() * 0.04,
            pulsePhase: Math.random() * Math.PI * 2,
            color: Math.random() > 0.4 ? '#fb923c' : '#fdba74',
          });
        } else {
          // Minimal gentle stardust
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            vx: (Math.random() - 0.5) * 0.05,
            vy: (Math.random() - 0.5) * 0.05,
            size: 1 + Math.random() * 1.2,
            alpha: 0.08 + Math.random() * 0.15,
            baseAlpha: 0.08 + Math.random() * 0.15,
            pulseSpeed: 0.008 + Math.random() * 0.015,
            pulsePhase: Math.random() * Math.PI * 2,
            color: '#e2e8f0',
          });
        }
      }
    };

    initParticles();

    let frame = 0;

    const render = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      const isRain = atmosphere === 'rain';

      // Draw subtle ambient particles
      if (!reducedMotion) {
        for (const p of particles) {
          // Update positions
          p.x += p.vx;
          p.y += p.vy;

          if (p.pulseSpeed !== undefined && p.pulsePhase !== undefined) {
            p.pulsePhase += p.pulseSpeed;
            p.alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(p.pulsePhase));
          }

          // Wrap boundaries
          if (isRain) {
            if (p.y > height) {
              p.y = -p.length!;
              p.x = Math.random() * (width + 100);
            }
            if (p.x < -20) p.x = width + 20;

            // Render raindrop streak
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.vx * (p.length! / 5), p.y + p.length!);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.lineWidth = p.size;
            ctx.stroke();
          } else {
            if (p.x < 0) p.x = width;
            if (p.x > width) p.x = 0;
            if (p.y < 0) p.y = height;
            if (p.y > height) p.y = 0;

            // Soft glowing particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
          }
        }
      }

      ctx.globalAlpha = 1.0;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [atmosphere, mood, intensity, reducedMotion]);

  const colors = getAtmosphereGradient();

  return (
    <div
      className="fixed inset-0 pointer-events-none transition-colors duration-[3000ms] ease-out z-0 overflow-hidden"
      style={{
        background: `radial-gradient(ellipse at 50% 30%, ${colors.bg2} 0%, ${colors.bg1} 100%)`,
      }}
    >
      {/* Subtle vignette layer */}
      <div
        className="absolute inset-0 transition-opacity duration-[2500ms]"
        style={{
          background: 'radial-gradient(circle at 50% 50%, transparent 60%, rgba(0, 0, 0, 0.45) 100%)',
        }}
      />
      {/* Canvas for dynamic particles/rain/embers */}
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
