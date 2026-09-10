import { useEffect, useRef, useState } from 'react';
import { JarvisMode } from '../types';

interface NeuralOrbProps {
  size?: number;
  mode?: JarvisMode;
  active?: boolean;
}

export default function NeuralOrb({
  size: manualSize,
  mode = 'idle',
  active = true
}: NeuralOrbProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [computedSize, setComputedSize] = useState<number>(manualSize || 380);

  // Measure container dimensions responsively to maximize globe size while maintaining safe padding
  useEffect(() => {
    if (manualSize) {
      setComputedSize(manualSize);
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      const rect = container.getBoundingClientRect();
      const availW = rect.width || 420;
      const availH = rect.height || 420;

      // Maximize globe size to fill container with clean breathing space
      const maxDim = Math.min(availW - 16, availH - 16);
      // Scale from min 300px up to 680px for a majestic prominent globe
      const clamped = Math.max(300, Math.min(680, Math.floor(maxDim)));
      setComputedSize(clamped);
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [manualSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const numPoints = 960;
    const points: Array<{
      ux: number; // Unit x
      uy: number; // Unit y
      uz: number; // Unit z
      phase: number;
      latitude: number;
    }> = [];

    const effectiveSize = computedSize;
    // Maximize sphere radius to fill the canvas proudly (44% of canvas size)
    const baseRadius = effectiveSize * 0.44;

    // Distribute points uniformly on sphere surface using Fibonacci spiral
    const phi = Math.PI * (Math.sqrt(5) - 1);
    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(Math.max(0, 1 - y * y));
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      points.push({
        ux: x,
        uy: y,
        uz: z,
        phase: Math.random() * Math.PI * 2,
        latitude: y
      });
    }

    // Dynamic animation parameters with smooth interpolation (lerp)
    const current = {
      rotSpeedY: 0.0035,
      rotSpeedX: 0.0015,
      rotSpeedZ: 0.0,
      glowIntensity: 0.12,
      r: 13,
      g: 245,
      b: 151
    };

    let angleY = 0;
    let angleX = 0.2;
    let angleZ = 0;
    let time = 0;

    const render = () => {
      // Determine target parameters based on the current mode
      // All modes maintain a 100% mathematically round sphere
      let targetRotY = 0.0035;
      let targetRotX = 0.0015;
      let targetRotZ = 0.0;
      let targetGlow = 0.12;
      let targetR = 13;
      let targetG = 245;
      let targetB = 151;

      switch (mode) {
        case 'listening':
          targetRotY = 0.006;
          targetRotX = 0.002;
          targetRotZ = 0.0;
          targetGlow = 0.18;
          targetR = 0;
          targetG = 245;
          targetB = 210; // Vibrant electric cyan-green
          break;

        case 'thinking':
          targetRotY = 0.008; // Smooth, moderate pace
          targetRotX = 0.003;
          targetRotZ = 0.004; // Dual-axis gyroscopic rotation
          targetGlow = 0.16;
          targetR = 0;
          targetG = 225;
          targetB = 255; // Electric cyan
          break;

        case 'speaking':
          targetRotY = 0.005;
          targetRotX = 0.0015;
          targetRotZ = 0.0;
          targetGlow = 0.20;
          targetR = 13;
          targetG = 255;
          targetB = 165; // Rich emerald mint
          break;

        case 'idle':
        default:
          targetRotY = 0.0035; // Majestic serene rotation
          targetRotX = 0.0015;
          targetRotZ = 0.0;
          targetGlow = 0.12;
          targetR = 13;
          targetG = 245;
          targetB = 151; // Iconic Jarvis emerald
          break;
      }

      // Smooth interpolation (lerp)
      const lerpSpeed = 0.04;
      current.rotSpeedY += (targetRotY - current.rotSpeedY) * lerpSpeed;
      current.rotSpeedX += (targetRotX - current.rotSpeedX) * lerpSpeed;
      current.rotSpeedZ += (targetRotZ - current.rotSpeedZ) * lerpSpeed;
      current.glowIntensity += (targetGlow - current.glowIntensity) * lerpSpeed;
      current.r += (targetR - current.r) * lerpSpeed;
      current.g += (targetG - current.g) * lerpSpeed;
      current.b += (targetB - current.b) * lerpSpeed;

      time += 0.02;
      angleY += current.rotSpeedY;
      angleX = 0.2 + Math.sin(time * 0.35) * 0.04;
      angleZ += current.rotSpeedZ;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // UNIFORM sphere breathing: all points share the EXACT SAME radius
      // This guarantees the silhouette remains a 100% pure circle at all times
      let sphereScale = 1.0;
      if (mode === 'idle') {
        sphereScale = 1.0 + Math.sin(time * 1.4) * 0.015;
      } else if (mode === 'listening') {
        sphereScale = 1.0 + Math.sin(time * 2.2) * 0.02;
      } else if (mode === 'speaking') {
        sphereScale = 1.0 + Math.sin(time * 3.5) * 0.018;
      } else {
        sphereScale = 1.0 + Math.sin(time * 1.8) * 0.012;
      }

      const activeRadius = baseRadius * sphereScale;

      // Outer radial glow halo
      const glowRadius = activeRadius * 1.25;
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        activeRadius * 0.1,
        centerX,
        centerY,
        glowRadius
      );
      glowGrad.addColorStop(
        0,
        `rgba(${Math.round(current.r)}, ${Math.round(current.g)}, ${Math.round(current.b)}, ${current.glowIntensity * 1.1})`
      );
      glowGrad.addColorStop(
        0.55,
        `rgba(${Math.round(current.r)}, ${Math.round(current.g)}, ${Math.round(current.b)}, ${current.glowIntensity * 0.35})`
      );
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // Rotation matrix precomputations
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosZ = Math.cos(angleZ);
      const sinZ = Math.sin(angleZ);

      // Mode-specific wave pulses for dot lighting (light travels across surface, sphere shape is intact)
      const speechPulse =
        mode === 'speaking'
          ? Math.sin(time * 5.0) * 0.3 + Math.cos(time * 2.4) * 0.3 + 0.8
          : 1.0;

      const projected = points.map((p) => {
        // 3D rotation applied to unit vectors
        // Y rotation
        let x1 = p.ux * cosY - p.uz * sinY;
        let z1 = p.ux * sinY + p.uz * cosY;

        // X rotation
        let y1 = p.uy * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.uy * sinX;

        // Z rotation (used during thinking mode for gyroscopic spin)
        if (current.rotSpeedZ > 0.001) {
          const x2 = x1 * cosZ - y1 * sinZ;
          const y2 = x1 * sinZ + y1 * cosZ;
          x1 = x2;
          y1 = y2;
        }

        // Perspective projection: fov of 1400 gives crisp depth with 100% circular silhouette
        const fov = 1400;
        const scale = fov / (fov + z2 * activeRadius);
        const screenX = centerX + x1 * activeRadius * scale;
        const screenY = centerY + y1 * activeRadius * scale;

        // Alpha calculation: z2 ranges from -1.0 (back) to +1.0 (front)
        // Ensure even the back and edge dots have vibrant visibility (min alpha 0.45)
        const alpha = Math.max(0.42, Math.min(1.0, (z2 + 1.0) / 2.0));

        return {
          screenX,
          screenY,
          scale,
          alpha,
          z2,
          latitude: p.latitude,
          phase: p.phase
        };
      });

      // Sort points back-to-front for clean layering
      projected.sort((a, b) => a.z2 - b.z2);

      const baseR = Math.round(current.r);
      const baseG = Math.round(current.g);
      const baseB = Math.round(current.b);

      for (const p of projected) {
        ctx.beginPath();

        // Base particle radius
        let ptRadius = Math.max(1.0, p.scale * 1.6);

        // Mode-specific distinct dot dynamics:
        if (mode === 'speaking') {
          // Rhythmic harmonic modulation of particle size
          ptRadius *= 0.85 + speechPulse * 0.35;
        } else if (mode === 'listening') {
          // Wave scanning along latitude
          const scan = Math.sin(time * 3.0 - p.latitude * 3.5);
          if (scan > 0.3) {
            ptRadius *= 1.25;
          }
        } else if (mode === 'thinking') {
          // Synaptic flashes along bands
          const synaptic = Math.sin(time * 3.8 + p.latitude * 5.0);
          if (synaptic > 0.4) {
            ptRadius *= 1.2;
          }
        }

        ctx.arc(p.screenX, p.screenY, ptRadius, 0, Math.PI * 2);

        // User requirement:
        // "darmiyan me jo white hai usko white hi rehny do lekin jo bilkul corner per jo thory grey type dots hain unko green kar do jesy doosry green hain unk sath merge karo do inko b."
        if (p.z2 > 0.65) {
          // Center / Front core: bright luminous white with gentle emerald tint
          ctx.fillStyle = `rgba(255, 255, 255, ${Math.min(1.0, p.alpha * 1.15)})`;
        } else if (p.z2 > 0.3) {
          // Front-mid transition: ultra-bright emerald
          ctx.fillStyle = `rgba(${Math.min(255, baseR + 80)}, ${baseG}, ${Math.min(255, baseB + 40)}, ${p.alpha})`;
        } else {
          // ALL other dots, including outer edges, corners, and back:
          // PURE GREEN matching the rest! Zero grey, zero dull slate!
          ctx.fillStyle = `rgba(${baseR}, ${baseG}, ${baseB}, ${Math.max(0.45, p.alpha * 0.95)})`;
        }
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [computedSize, mode, active]);

  return (
    <div
      ref={containerRef}
      id="neural-orb-container"
      className="w-full h-full flex items-center justify-center select-none relative overflow-hidden"
    >
      <canvas
        ref={canvasRef}
        width={computedSize}
        height={computedSize}
        style={{ width: computedSize, height: computedSize }}
        className="pointer-events-none drop-shadow-[0_0_35px_rgba(13,245,151,0.2)] transition-all duration-300"
      />
      {/* Central neural core ping dot */}
      <div
        className={`absolute w-2.5 h-2.5 rounded-full blur-[1px] animate-pulse pointer-events-none transition-colors duration-500 ${
          mode === 'thinking'
            ? 'bg-[#00e5ff] shadow-[0_0_12px_#00e5ff]'
            : mode === 'speaking'
            ? 'bg-[#14ffaa] shadow-[0_0_15px_#14ffaa]'
            : 'bg-[#0df597] shadow-[0_0_10px_#0df597]'
        }`}
      />
    </div>
  );
}
