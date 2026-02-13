'use client';

import { useEffect, useRef } from 'react';
import styles from './NodeNetwork.module.css';

export default function NodeNetwork() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationId;
    let nodes = [];

    const NODE_COUNT = 45;
    const CONNECTION_DIST = 180;
    const NODE_SPEED = 0.15;
    const LINE_COLOR_BASE = [203, 251, 66];

    // Shining pulse config
    const PULSE_SPEED = 0.0008;       // how fast the shine travels
    const PULSE_WAVELENGTH = 400;     // px between pulse peaks
    const SHINE_MIN = 0.15;           // base node opacity
    const SHINE_MAX = 0.7;            // peak shine opacity
    const GLOW_RADIUS_MULT = 6;       // glow blur radius multiplier
    let time = 0;

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
      ctx.scale(dpr, dpr);
    };

    const createNodes = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      nodes = [];
      for (let i = 0; i < NODE_COUNT; i++) {
        nodes.push({
          x: Math.random() * rect.width,
          y: Math.random() * rect.height,
          vx: (Math.random() - 0.5) * NODE_SPEED,
          vy: (Math.random() - 0.5) * NODE_SPEED,
          radius: Math.random() * 1.5 + 0.8,
        });
      }
    };

    const draw = () => {
      const rect = canvas.parentElement.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      time++;

      ctx.clearRect(0, 0, w, h);

      // Diagonal wave: each node's shine is based on position + time
      const getShine = (x, y) => {
        const wave = Math.sin(((x + y) / PULSE_WAVELENGTH) + time * PULSE_SPEED * Math.PI * 2);
        return SHINE_MIN + (SHINE_MAX - SHINE_MIN) * ((wave + 1) / 2);
      };

      // Update positions
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > w) node.vx *= -1;
        if (node.y < 0 || node.y > h) node.vy *= -1;

        node.x = Math.max(0, Math.min(w, node.x));
        node.y = Math.max(0, Math.min(h, node.y));
      }

      // Draw connections with shining
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < CONNECTION_DIST) {
            const proximity = 1 - dist / CONNECTION_DIST;
            const midShine = getShine(
              (nodes[i].x + nodes[j].x) / 2,
              (nodes[i].y + nodes[j].y) / 2
            );
            const opacity = proximity * 0.12 + proximity * midShine * 0.08;
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${LINE_COLOR_BASE[0]}, ${LINE_COLOR_BASE[1]}, ${LINE_COLOR_BASE[2]}, ${opacity})`;
            ctx.lineWidth = 0.5 + midShine * 0.3;
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes with shining glow
      for (const node of nodes) {
        const shine = getShine(node.x, node.y);

        // Outer glow (only when shining bright enough)
        if (shine > 0.4) {
          const glowIntensity = (shine - 0.4) / (SHINE_MAX - 0.4);
          ctx.save();
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.radius * GLOW_RADIUS_MULT, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(203, 251, 66, ${glowIntensity * 0.08})`;
          ctx.filter = `blur(${node.radius * 3}px)`;
          ctx.fill();
          ctx.restore();
        }

        // Core node
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(203, 251, 66, ${shine})`;
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    resize();
    createNodes();
    draw();

    const handleResize = () => {
      resize();
      createNodes();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className={styles.wrapper}>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  );
}
