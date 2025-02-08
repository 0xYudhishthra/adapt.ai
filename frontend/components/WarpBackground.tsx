"use client"

import React, { useRef, useEffect } from "react";

interface Star {
  x: number;
  y: number;
  z: number;
}

const WarpBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  let animationFrameId: number;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stars: Star[] = [];
    const numStars = 300;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initStars();
    };

    const initStars = () => {
      stars = [];
      for (let i = 0; i < numStars; i++) {
        stars.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          z: Math.random() * canvas.width,
        });
      }
    };

    const draw = () => {
      const { width, height } = canvas;
      const cx = width / 2;
      const cy = height / 2;

      // Clear canvas
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, width, height);

      // Draw stars
      stars.forEach((star) => {
        const speed = 10;
        star.z -= speed;
        if (star.z < 1) {
          // Reset star when it reaches "close" enough
          star.x = Math.random() * width;
          star.y = Math.random() * height;
          star.z = width;
        }

        // Perspective projection
        const sx = ((star.x - cx) / star.z) * width + cx;
        const sy = ((star.y - cy) / star.z) * width + cy;

        // Radius decreases with distance
        const radius = (1 - star.z / width) * 3;

        ctx.beginPath();
        ctx.arc(sx, sy, radius, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();
    draw();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: -1,
        width: "100%",
        height: "100%",
      }}
    />
  );
};

export default WarpBackground;