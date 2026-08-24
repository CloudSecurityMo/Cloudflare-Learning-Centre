"use client";

import * as React from "react";

/** Resolves the `--brand` CSS variable to an rgb() string canvas can use directly, regardless of its source color space (oklch, etc). */
function resolveBrandColor(): string {
  const probe = document.createElement("div");
  probe.style.color = "var(--brand)";
  document.body.appendChild(probe);
  const resolved = getComputedStyle(probe).color;
  document.body.removeChild(probe);
  return resolved;
}

/**
 * A quiet, edge-network-themed dot field: a ripple of brightness expands
 * outward from the center on a loop, evoking request/response traffic
 * radiating across a global network. Pure canvas, no dependencies, and a
 * static single frame when the viewer prefers reduced motion.
 */
export function NetworkBackground({ className }: { className?: string }) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const spacing = 15;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const brand = resolveBrandColor();
    let width = 0;
    let height = 0;
    let raf = 0;

    function resize() {
      const parent = canvas!.parentElement;
      if (!parent) return;
      width = parent.clientWidth;
      height = parent.clientHeight;
      canvas!.width = width * dpr;
      canvas!.height = height * dpr;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw(reduceMotion ? 0 : performance.now());
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const maxDist = Math.hypot(cx, cy) || 1;
      ctx!.fillStyle = brand;

      for (let x = spacing / 2; x < width; x += spacing) {
        for (let y = spacing / 2; y < height; y += spacing) {
          const dist = Math.hypot(x - cx, y - cy) / maxDist;
          const wave = Math.sin(dist * 9 - time * 0.0011);
          ctx!.globalAlpha = 0.14 + Math.max(0, wave) * 0.26;
          ctx!.fillRect(x - 1.1, y - 1.1, 2.2, 2.2);
        }
      }
      ctx!.globalAlpha = 1;
      if (!reduceMotion) raf = requestAnimationFrame(draw);
    }

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas.parentElement!);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={className} />;
}
