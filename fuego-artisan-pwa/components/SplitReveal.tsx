"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";

export default function SplitReveal({
  text,
  as: Tag = "span",
  className = "",
  delay = 0,
}: {
  text: string;
  as?: any;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const chars = el.querySelectorAll(".split-char");
    gsap.fromTo(
      chars,
      { opacity: 0, y: 24, rotateX: -40 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 0.6,
        ease: "back.out(1.7)",
        stagger: 0.02,
        delay,
      }
    );
  }, [delay]);

  return (
    <Tag ref={ref} className={className} style={{ perspective: 400 }}>
      {text.split("").map((char, i) => (
        <span key={i} className="split-char">
          {char === " " ? "\u00A0" : char}
        </span>
      ))}
    </Tag>
  );
}
