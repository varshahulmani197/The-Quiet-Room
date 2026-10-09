import React, { useEffect, useRef } from 'react';
import { WeatherType, LightingMood, WeatherOverlaySettings } from '../types';

interface WeatherOverlayProps {
  weather: WeatherType;
  lightingMood: LightingMood;
  emotionalTags: string[];
  settings: WeatherOverlaySettings;
  reducedMotion?: boolean;
}

interface Particle {
  x: number;
  y: number;
  z: number; // depth plane: 0.3 (far) to 1.0 (near)
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  baseAlpha: number;
  color: string;
  rotation?: number;
  rotationSpeed?: number;
  swayPhase?: number;
  swaySpeed?: number;
  swayAmount?: number;
  pulsePhase?: number;
  pulseSpeed?: number;
  length?: number; // for rain needles
  aspectRatio?: number; // for petals (width vs height)
  sparkTail?: number;
}

interface Ripple {
  x: number;
  y: number;
  radius: number;
  maxRadius: number;
  alpha: number;
}

// Lighting configuration for each lightingMood
interface LightingConfig {
  beamColor: string; // rgba
  ambientTint: string; // rgba
  beamAngle: number; // degrees
  beamCount: number;
  beamSpread: number;
  beamIntensity: number; // 0 to 1
  coreHighlight: string;
}

const LIGHTING_CONFIGS: Record<LightingMood, LightingConfig> = {
  'cool-overcast': {
    beamColor: 'rgba(148, 163, 184, 0.04)',
    ambientTint: 'rgba(100, 116, 139, 0.05)',
    beamAngle: 85,
    beamCount: 2,
    beamSpread: 0.35,
    beamIntensity: 0.5,
    coreHighlight: 'rgba(186, 230, 253, 0.03)',
  },
  'silvery-moonlight': {
    beamColor: 'rgba(224, 231, 255, 0.06)',
    ambientTint: 'rgba(147, 197, 253, 0.04)',
    beamAngle: 45,
    beamCount: 2,
    beamSpread: 0.28,
    beamIntensity: 0.7,
    coreHighlight: 'rgba(255, 255, 255, 0.05)',
  },
  'golden-dawn': {
    beamColor: 'rgba(251, 191, 36, 0.08)',
    ambientTint: 'rgba(245, 158, 11, 0.06)',
    beamAngle: 38,
    beamCount: 3,
    beamSpread: 0.3,
    beamIntensity: 0.85,
    coreHighlight: 'rgba(254, 240, 138, 0.07)',
  },
  'emerald-canopy': {
    beamColor: 'rgba(52, 211, 153, 0.06)',
    ambientTint: 'rgba(16, 185, 129, 0.04)',
    beamAngle: 60,
    beamCount: 3,
    beamSpread: 0.32,
    beamIntensity: 0.65,
    coreHighlight: 'rgba(167, 243, 208, 0.05)',
  },
  'warm-amber': {
    beamColor: 'rgba(249, 115, 22, 0.07)',
    ambientTint: 'rgba(234, 88, 12, 0.06)',
    beamAngle: 110,
    beamCount: 2,
    beamSpread: 0.4,
    beamIntensity: 0.75,
    coreHighlight: 'rgba(253, 186, 116, 0.06)',
  },
  'rose-twilight': {
    beamColor: 'rgba(244, 114, 182, 0.06)',
    ambientTint: 'rgba(192, 132, 252, 0.05)',
    beamAngle: 50,
    beamCount: 2,
    beamSpread: 0.3,
    beamIntensity: 0.7,
    coreHighlight: 'rgba(251, 207, 232, 0.05)',
  },
  'vivid-electric': {
    beamColor: 'rgba(245, 158, 11, 0.09)',
    ambientTint: 'rgba(239, 68, 68, 0.05)',
    beamAngle: 35,
    beamCount: 3,
    beamSpread: 0.25,
    beamIntensity: 0.9,
    coreHighlight: 'rgba(252, 211, 77, 0.08)',
  },
  'neutral-diffuse': {
    beamColor: 'rgba(226, 232, 240, 0.03)',
    ambientTint: 'rgba(203, 213, 225, 0.02)',
    beamAngle: 55,
    beamCount: 1,
    beamSpread: 0.4,
    beamIntensity: 0.35,
    coreHighlight: 'rgba(255, 255, 255, 0.02)',
  },
};

export const WeatherOverlay: React.FC<WeatherOverlayProps> = ({
  weather,
  lightingMood,
  settings,
  reducedMotion = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Intensity multipliers
  const particleMultiplier =
    settings.particleIntensity === 'off'
      ? 0
      : settings.particleIntensity === 'subtle'
      ? 0.5
      : settings.particleIntensity === 'rich'
      ? 1.6
      : 1.0;

  const lightingMultiplier =
    settings.lightingIntensity === 'off'
      ? 0
      : settings.lightingIntensity === 'soft'
      ? 0.5
      : settings.lightingIntensity === 'vivid'
      ? 1.5
      : 1.0;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
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

    let particles: Particle[] = [];
    let ripples: Ripple[] = [];

    const initParticles = () => {
      particles = [];
      ripples = [];

      if (particleMultiplier === 0) return;

      let baseCount = 50;
      switch (weather) {
        case 'rain':
          baseCount = 95;
          break;
        case 'snow':
          baseCount = 85;
          break;
        case 'sunbeams':
          baseCount = 65;
          break;
        case 'petals':
          baseCount = 45;
          break;
        case 'embers':
          baseCount = 55;
          break;
        case 'fireflies':
          baseCount = 40;
          break;
        case 'zeal-sparks':
          baseCount = 60;
          break;
        case 'clear':
        default:
          baseCount = 30;
          break;
      }

      if (reducedMotion) {
        baseCount = Math.floor(baseCount * 0.4);
      }

      const totalCount = Math.floor(baseCount * particleMultiplier);

      for (let i = 0; i < totalCount; i++) {
        const z = 0.3 + Math.random() * 0.7; // depth: 0.3 to 1.0

        if (weather === 'rain') {
          particles.push({
            x: Math.random() * (width + 200) - 100,
            y: Math.random() * height,
            z,
            vx: -1.2 * z * (reducedMotion ? 0.4 : 1),
            vy: (12 + Math.random() * 10) * z * (reducedMotion ? 0.4 : 1),
            size: (0.9 + Math.random() * 0.8) * z,
            length: (12 + Math.random() * 16) * z,
            alpha: (0.12 + Math.random() * 0.22) * z,
            baseAlpha: (0.12 + Math.random() * 0.22) * z,
            color: '#93c5fd',
          });
        } else if (weather === 'snow') {
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            z,
            vx: (Math.random() - 0.5) * 0.3,
            vy: (0.8 + Math.random() * 1.6) * z * (reducedMotion ? 0.4 : 1),
            size: (1.2 + Math.random() * 2.8) * z,
            alpha: (0.15 + Math.random() * 0.4) * z,
            baseAlpha: (0.15 + Math.random() * 0.4) * z,
            swayPhase: Math.random() * Math.PI * 2,
            swaySpeed: 0.015 + Math.random() * 0.02,
            swayAmount: 0.8 + Math.random() * 1.4,
            color: Math.random() > 0.4 ? '#f8fafc' : '#e2e8f0',
          });
        } else if (weather === 'sunbeams') {
          // Floating golden dust motes in sunbeams
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            z,
            vx: (Math.random() - 0.5) * 0.25 * (reducedMotion ? 0.3 : 1),
            vy: (-0.15 - Math.random() * 0.4) * z * (reducedMotion ? 0.3 : 1),
            size: (1.0 + Math.random() * 2.2) * z,
            alpha: (0.15 + Math.random() * 0.35) * z,
            baseAlpha: (0.15 + Math.random() * 0.35) * z,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.012 + Math.random() * 0.025,
            color: Math.random() > 0.3 ? '#fef08a' : '#fde047',
          });
        } else if (weather === 'petals') {
          // Drifting sakura/autumn petals
          particles.push({
            x: Math.random() * (width + 100),
            y: Math.random() * height,
            z,
            vx: (-0.4 - Math.random() * 0.6) * (reducedMotion ? 0.3 : 1),
            vy: (0.6 + Math.random() * 1.2) * z * (reducedMotion ? 0.3 : 1),
            size: (2.5 + Math.random() * 3.5) * z,
            alpha: (0.2 + Math.random() * 0.35) * z,
            baseAlpha: (0.2 + Math.random() * 0.35) * z,
            rotation: Math.random() * Math.PI * 2,
            rotationSpeed: (Math.random() - 0.5) * 0.03 * (reducedMotion ? 0.2 : 1),
            swayPhase: Math.random() * Math.PI * 2,
            swaySpeed: 0.02 + Math.random() * 0.025,
            swayAmount: 1.2,
            aspectRatio: 0.55 + Math.random() * 0.3,
            color:
              Math.random() > 0.5
                ? '#fbcfe8' // soft rose petal
                : Math.random() > 0.5
                ? '#fed7aa' // warm peach petal
                : '#a7f3d0', // delicate leaf spore
          });
        } else if (weather === 'embers') {
          // Warm rising hearth embers
          particles.push({
            x: Math.random() * width,
            y: height - Math.random() * (height * 0.6),
            z,
            vx: (Math.random() - 0.5) * 0.5 * (reducedMotion ? 0.3 : 1),
            vy: (-0.9 - Math.random() * 1.6) * z * (reducedMotion ? 0.3 : 1),
            size: (1.2 + Math.random() * 2.2) * z,
            alpha: (0.25 + Math.random() * 0.45) * z,
            baseAlpha: (0.25 + Math.random() * 0.45) * z,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.03 + Math.random() * 0.04,
            swayPhase: Math.random() * Math.PI * 2,
            swaySpeed: 0.025 + Math.random() * 0.03,
            swayAmount: 0.8,
            color: Math.random() > 0.4 ? '#fb923c' : '#fdba74',
          });
        } else if (weather === 'fireflies') {
          // Twilight fireflies with breathing pulse
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            z,
            vx: (Math.random() - 0.5) * 0.15 * (reducedMotion ? 0.2 : 1),
            vy: (Math.random() - 0.5) * 0.15 * (reducedMotion ? 0.2 : 1),
            size: (1.5 + Math.random() * 2.5) * z,
            alpha: (0.18 + Math.random() * 0.45) * z,
            baseAlpha: (0.18 + Math.random() * 0.45) * z,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.015 + Math.random() * 0.025,
            color: Math.random() > 0.4 ? '#c7d2fe' : '#fbcfe8',
          });
        } else if (weather === 'zeal-sparks') {
          // Spirited rising momentum sparks
          particles.push({
            x: Math.random() * width,
            y: height - Math.random() * (height * 0.8),
            z,
            vx: (0.4 + Math.random() * 0.8) * (reducedMotion ? 0.3 : 1),
            vy: (-1.4 - Math.random() * 2.2) * z * (reducedMotion ? 0.3 : 1),
            size: (1.1 + Math.random() * 2.0) * z,
            alpha: (0.25 + Math.random() * 0.5) * z,
            baseAlpha: (0.25 + Math.random() * 0.5) * z,
            sparkTail: 6 + Math.random() * 12,
            color: Math.random() > 0.3 ? '#f59e0b' : '#fbbf24',
          });
        } else {
          // Clear: gentle ambient dust motes
          particles.push({
            x: Math.random() * width,
            y: Math.random() * height,
            z,
            vx: (Math.random() - 0.5) * 0.08 * (reducedMotion ? 0.2 : 1),
            vy: (Math.random() - 0.5) * 0.08 * (reducedMotion ? 0.2 : 1),
            size: (0.8 + Math.random() * 1.4) * z,
            alpha: (0.06 + Math.random() * 0.14) * z,
            baseAlpha: (0.06 + Math.random() * 0.14) * z,
            pulsePhase: Math.random() * Math.PI * 2,
            pulseSpeed: 0.008 + Math.random() * 0.015,
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

      const time = frame * 0.016;
      const lighting = LIGHTING_CONFIGS[lightingMood] || LIGHTING_CONFIGS['neutral-diffuse'];

      // ==============================================================
      // 1. CHANGING LIGHT / VOLUMETRIC BEAMS & AMBIENT ILLUMINATION
      // ==============================================================
      if (lightingMultiplier > 0) {
        // Breathing pulse factor
        const pulse =
          settings.ambientLightPulse && !reducedMotion
            ? 0.88 + 0.12 * Math.sin(time * 0.6)
            : 1.0;

        const effectiveIntensity = lighting.beamIntensity * lightingMultiplier * pulse;

        // Ambient radial illumination wash
        const radialGrad = ctx.createRadialGradient(
          width * 0.45,
          height * 0.25,
          50,
          width * 0.5,
          height * 0.5,
          Math.max(width, height) * 0.75
        );
        radialGrad.addColorStop(0, lighting.ambientTint);
        radialGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.fillStyle = radialGrad;
        ctx.globalAlpha = effectiveIntensity;
        ctx.fillRect(0, 0, width, height);

        // Volumetric light shafts (e.g. golden sunbeams or pale moonbeams)
        if (lighting.beamCount > 0) {
          const originX = width * 0.3;
          const originY = -50;
          const length = height * 1.5;
          const rad = (lighting.beamAngle * Math.PI) / 180;

          for (let b = 0; b < lighting.beamCount; b++) {
            const offsetAngle = (b - (lighting.beamCount - 1) / 2) * lighting.beamSpread;
            const currentAngle = rad + offsetAngle;
            const beamWidth = width * 0.22;

            const x1 = originX + Math.cos(currentAngle - 0.15) * length;
            const y1 = originY + Math.sin(currentAngle - 0.15) * length;
            const x2 = originX + Math.cos(currentAngle + 0.15) * length;
            const y2 = originY + Math.sin(currentAngle + 0.15) * length;

            const beamGrad = ctx.createLinearGradient(originX, originY, (x1 + x2) / 2, (y1 + y2) / 2);
            beamGrad.addColorStop(0, lighting.beamColor);
            beamGrad.addColorStop(0.5, lighting.coreHighlight);
            beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

            ctx.beginPath();
            ctx.moveTo(originX - beamWidth * 0.3, originY);
            ctx.lineTo(originX + beamWidth * 0.3, originY);
            ctx.lineTo(x2, y2);
            ctx.lineTo(x1, y1);
            ctx.closePath();

            ctx.fillStyle = beamGrad;
            ctx.globalAlpha = effectiveIntensity * (0.65 + 0.35 * Math.sin(time * 0.4 + b));
            ctx.fill();
          }
        }
      }

      // ==============================================================
      // 2. FALLING PARTICLES SIMULATION
      // ==============================================================
      if (particleMultiplier > 0) {
        for (const p of particles) {
          // Update physics
          let currentVx = p.vx;
          if (p.swayPhase !== undefined && p.swaySpeed !== undefined && p.swayAmount !== undefined) {
            p.swayPhase += p.swaySpeed;
            if (!reducedMotion) {
              currentVx += Math.sin(p.swayPhase) * p.swayAmount * 0.3;
            }
          }

          p.x += currentVx;
          p.y += p.vy;

          if (p.rotation !== undefined && p.rotationSpeed !== undefined) {
            p.rotation += p.rotationSpeed;
          }

          if (p.pulsePhase !== undefined && p.pulseSpeed !== undefined) {
            p.pulsePhase += p.pulseSpeed;
            p.alpha = p.baseAlpha * (0.6 + 0.4 * Math.sin(p.pulsePhase));
          }

          // Boundary wraps
          if (weather === 'rain') {
            if (p.y > height + 20) {
              // Create subtle floor ripple occasionally
              if (Math.random() < 0.15 && ripples.length < 15) {
                ripples.push({
                  x: p.x,
                  y: height - 10 - Math.random() * 40,
                  radius: 1,
                  maxRadius: 8 + Math.random() * 12,
                  alpha: 0.25,
                });
              }
              p.y = -p.length!;
              p.x = Math.random() * (width + 200) - 100;
            }
            if (p.x < -150) p.x = width + 50;

            // Render rain streak
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p.x + p.vx * 3, p.y + p.length!);
            ctx.strokeStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.lineWidth = p.size;
            ctx.stroke();
          } else if (weather === 'embers' || weather === 'zeal-sparks') {
            // Rising sparks
            if (p.y < -30) {
              p.y = height + 20;
              p.x = Math.random() * width;
            }
            if (p.x < -20) p.x = width + 20;
            if (p.x > width + 20) p.x = -20;

            if (p.sparkTail && !reducedMotion) {
              // Directed streak for zeal sparks
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p.x - p.vx * p.sparkTail * 0.4, p.y - p.vy * p.sparkTail * 0.4);
              ctx.strokeStyle = p.color;
              ctx.globalAlpha = p.alpha * 0.8;
              ctx.lineWidth = p.size;
              ctx.stroke();
            }

            // Glow core
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
          } else if (weather === 'petals') {
            // Drifting petals with rotation
            if (p.y > height + 30) {
              p.y = -30;
              p.x = Math.random() * (width + 100);
            }
            if (p.x < -40) p.x = width + 40;

            ctx.save();
            ctx.translate(p.x, p.y);
            if (p.rotation !== undefined) {
              ctx.rotate(p.rotation);
            }
            ctx.beginPath();
            ctx.ellipse(0, 0, p.size, p.size * (p.aspectRatio || 0.6), 0, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();
            ctx.restore();
          } else {
            // Snow / Golden Dust / Fireflies / Clear
            if (p.y > height + 20) {
              p.y = -20;
              p.x = Math.random() * width;
            } else if (p.y < -20) {
              p.y = height + 20;
              p.x = Math.random() * width;
            }
            if (p.x < -20) p.x = width + 20;
            if (p.x > width + 20) p.x = -20;

            // Soft glowing or feathery particle
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.alpha;
            ctx.fill();

            // Extra soft halo for fireflies
            if (weather === 'fireflies' && p.z > 0.6) {
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size * 2.8, 0, Math.PI * 2);
              ctx.fillStyle = p.color;
              ctx.globalAlpha = p.alpha * 0.25;
              ctx.fill();
            }
          }
        }

        // ==============================================================
        // 3. RAIN SPLASH RIPPLES
        // ==============================================================
        if (weather === 'rain' && ripples.length > 0) {
          for (let r = ripples.length - 1; r >= 0; r--) {
            const rip = ripples[r];
            rip.radius += 0.45;
            rip.alpha *= 0.94;

            ctx.beginPath();
            ctx.ellipse(rip.x, rip.y, rip.radius * 2, rip.radius * 0.6, 0, 0, Math.PI * 2);
            ctx.strokeStyle = '#93c5fd';
            ctx.globalAlpha = rip.alpha;
            ctx.lineWidth = 0.8;
            ctx.stroke();

            if (rip.alpha < 0.02 || rip.radius > rip.maxRadius) {
              ripples.splice(r, 1);
            }
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
  }, [weather, lightingMood, particleMultiplier, lightingMultiplier, settings.ambientLightPulse, reducedMotion]);

  return (
    <div className="fixed inset-0 pointer-events-none z-1 overflow-hidden transition-opacity duration-1000">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};
