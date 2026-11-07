"use client";
import { motion } from "motion/react";
import { ReactNode } from "react";

export function ScrollReveal({ 
  children, 
  direction = "up", 
  delay = 0 
}: { 
  children: ReactNode; 
  direction?: "up" | "down" | "left" | "right"; 
  delay?: number; 
}) {
  const directions = {
    up: { y: 50, x: 0 },
    down: { y: -50, x: 0 },
    left: { x: -50, y: 0 },
    right: { x: 50, y: 0 },
  };

  return (
    <motion.div
      initial={{ opacity: 0, ...directions[direction] }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}