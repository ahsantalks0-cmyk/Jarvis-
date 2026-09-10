import { useEffect, useRef } from 'react';

interface NeuralOrbProps {
  size?: number;
  active?: boolean;
}

export default function NeuralOrb({ size = 320, active = true }: NeuralOrbProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    const numPoints = 650;
    const points: Array<{ x: number; y: number; z: number; baseRadius: number; phase: number }> = [];
    const radius = size * 0.38;

    // Generate points uniformly distributed on sphere surface (Fibonacci sphere)
    const phi = Math.PI * (Math.sqrt(5) - 1);
    for (let i = 0; i < numPoints; i++) {
      const y = 1 - (i / (numPoints - 1)) * 2; // -1 to 1
      const radiusAtY = Math.sqrt(1 - y * y);
      const theta = phi * i;

      const x = Math.cos(theta) * radiusAtY;
      const z = Math.sin(theta) * radiusAtY;

      points.push({
        x: x * radius,
        y: y * radius,
        z: z * radius,
        baseRadius: radius,
        phase: Math.random() * Math.PI * 2
      });
    }

    let angleY = 0;
    let angleX = 0.2;
    let time = 0;

    const render = () => {
      time += 0.025;
      angleY += 0.007;
      angleX = 0.25 + Math.sin(time * 0.5) * 0.08;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;

      // Draw subtle outer radial glow
      const glowGrad = ctx.createRadialGradient(
        centerX,
        centerY,
        radius * 0.1,
        centerX,
        centerY,
        radius * 1.3
      );
      glowGrad.addColorStop(0, 'rgba(13, 245, 151, 0.06)');
      glowGrad.addColorStop(0.5, 'rgba(0, 229, 255, 0.03)');
      glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 1.3, 0, Math.PI * 2);
      ctx.fill();

      // Sort points by Z to render back-to-front
      const cosY = Math.cos(angleY);
      const sinY = Math.sin(angleY);
      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);

      const projected = points.map((p) => {
        // Organic breathing modulation
        const pulse = active ? Math.sin(time * 2 + p.phase) * (radius * 0.06) : 0;
        const currentR = p.baseRadius + pulse;
        const normX = (p.x / p.baseRadius) * currentR;
        const normY = (p.y / p.baseRadius) * currentR;
        const normZ = (p.z / p.baseRadius) * currentR;

        // Rotation around Y
        const x1 = normX * cosY - normZ * sinY;
        const z1 = normZ * cosY + normX * sinY;

        // Rotation around X
        const y1 = normY * cosX - z1 * sinX;
        const z2 = z1 * cosX + normY * sinX;

        // Perspective projection
        const fov = 400;
        const scale = fov / (fov + z2);
        const screenX = centerX + x1 * scale;
        const screenY = centerY + y1 * scale;
        const alpha = Math.max(0.12, Math.min(1, (z2 + radius) / (2 * radius)));

        return { screenX, screenY, scale, alpha, z2 };
      });

      projected.sort((a, b) => a.z2 - b.z2);

      for (const p of projected) {
        ctx.beginPath();
        const ptRadius = Math.max(0.7, p.scale * 1.6);
        ctx.arc(p.screenX, p.screenY, ptRadius, 0, Math.PI * 2);

        // Core white-emerald tint on foreground, dimmer cyan-slate on background
        if (p.alpha > 0.7) {
          ctx.fillStyle = `rgba(220, 255, 245, ${p.alpha})`;
        } else if (p.alpha > 0.4) {
          ctx.fillStyle = `rgba(13, 245, 151, ${p.alpha * 0.8})`;
        } else {
          ctx.fillStyle = `rgba(100, 130, 170, ${p.alpha * 0.6})`;
        }
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [size, active]);

  return (
    <div className="relative flex items-center justify-center select-none" id="neural-orb-container">
      <canvas
        ref={canvasRef}
        width={size}
        height={size}
        className="pointer-events-none drop-shadow-[0_0_25px_rgba(13,245,151,0.15)]"
      />
      {/* Central neural core subtle ping dot */}
      <div className="absolute w-2 h-2 rounded-full bg-[#0df597] blur-[1px] animate-pulse pointer-events-none opacity-60" />
    </div>
  );
}
