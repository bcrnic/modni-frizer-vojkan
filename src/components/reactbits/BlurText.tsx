// Adapted from React Bits (https://reactbits.dev) by David Haz.
// Licensed under MIT + Commons Clause, see ./LICENSE.md. Changes for this site:
// - uses framer-motion (already a dependency) instead of the "motion" package;
// - renders any tag (`as`), so the hero keeps its <h1>;
// - accepts `segments`: plain strings are split into words, nodes animate as one unit
//   (used to keep "Novom Sadu" together with its shine effect);
// - shows the text immediately when the visitor prefers reduced motion.
import { motion, useReducedMotion, type Transition, type Easing } from "framer-motion";
import { useEffect, useMemo, useRef, useState, type ElementType, type ReactNode } from "react";

type Segment = string | { node: ReactNode; key: string };

type BlurTextProps = {
  text?: string;
  segments?: Segment[];
  as?: ElementType;
  delay?: number;
  className?: string;
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  easing?: Easing | Easing[];
  onAnimationComplete?: () => void;
  stepDuration?: number;
};

const buildKeyframes = (
  from: Record<string, string | number>,
  steps: Array<Record<string, string | number>>
): Record<string, Array<string | number>> => {
  const keys = new Set<string>([...Object.keys(from), ...steps.flatMap((s) => Object.keys(s))]);
  const keyframes: Record<string, Array<string | number>> = {};
  keys.forEach((k) => {
    keyframes[k] = [from[k], ...steps.map((s) => s[k])];
  });
  return keyframes;
};

const BlurText = ({
  text = "",
  segments,
  as: Tag = "p",
  delay = 200,
  className = "",
  direction = "top",
  threshold = 0.1,
  rootMargin = "0px",
  easing = (t: number) => t,
  onAnimationComplete,
  stepDuration = 0.35,
}: BlurTextProps) => {
  const reduceMotion = useReducedMotion();
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLElement>(null);

  // Flatten into animation units: words of plain strings, whole nodes otherwise.
  const units = useMemo(() => {
    const list: { key: string; content: ReactNode }[] = [];
    (segments ?? [text]).forEach((segment, s) => {
      if (typeof segment === "string") {
        segment
          .split(" ")
          .filter(Boolean)
          .forEach((word, w) => list.push({ key: `${s}-${w}`, content: word }));
      } else {
        list.push({ key: segment.key, content: segment.node });
      }
    });
    return list;
  }, [segments, text]);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(node);
        }
      },
      { threshold, rootMargin }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const from = useMemo(
    () => ({ filter: "blur(10px)", opacity: 0, y: direction === "top" ? -50 : 50 }),
    [direction]
  );
  const to = useMemo(
    () => [
      { filter: "blur(5px)", opacity: 0.5, y: direction === "top" ? 5 : -5 },
      { filter: "blur(0px)", opacity: 1, y: 0 },
    ],
    [direction]
  );
  const keyframes = useMemo(() => buildKeyframes(from, to), [from, to]);
  const stepCount = to.length + 1;
  const times = Array.from({ length: stepCount }, (_, i) => i / (stepCount - 1));

  return (
    <Tag ref={ref} className={`flex flex-wrap ${className}`}>
      {units.map((unit, index) => {
        const last = index === units.length - 1;
        const spacer = last ? null : " ";
        if (reduceMotion) {
          return (
            <span key={unit.key} className="inline-block">
              {unit.content}
              {spacer}
            </span>
          );
        }
        const transition: Transition = {
          duration: stepDuration * (stepCount - 1),
          times,
          delay: (index * delay) / 1000,
          ease: easing,
        };
        return (
          <motion.span
            key={unit.key}
            initial={from}
            animate={inView ? keyframes : from}
            transition={transition}
            onAnimationComplete={last ? onAnimationComplete : undefined}
            style={{ display: "inline-block", willChange: "transform, filter, opacity" }}
          >
            {unit.content}
            {spacer}
          </motion.span>
        );
      })}
    </Tag>
  );
};

export default BlurText;
