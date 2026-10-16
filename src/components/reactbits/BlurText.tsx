// Adapted from React Bits (https://reactbits.dev) by David Haz.
// Licensed under MIT + Commons Clause, see ./LICENSE.md. Changes for this site:
// - animated with plain CSS (see `.blur-text-word` in index.css) instead of a JS
//   animation library, so the hero heading starts animating as soon as it renders;
// - animates only opacity and transform, which the browser can run on the GPU
//   (an animated blur filter cannot be, and stuttered on slower phones);
// - renders any tag (`as`), so the hero keeps its <h1>;
// - accepts `segments`: plain strings are split into words, nodes animate as one unit
//   (used to keep "Novom Sadu" together with its shine effect);
// - shows the text immediately when the visitor prefers reduced motion (handled in CSS).
import { Fragment, useEffect, useMemo, useRef, useState, type CSSProperties, type ElementType, type ReactNode } from "react";

type Segment = string | { node: ReactNode; key: string };

type BlurTextProps = {
  text?: string;
  segments?: Segment[];
  as?: ElementType;
  /** Delay between words, in milliseconds. */
  delay?: number;
  className?: string;
  direction?: "top" | "bottom";
  threshold?: number;
  rootMargin?: string;
  /** Any CSS easing, e.g. "linear" or "cubic-bezier(.25,.1,.25,1)". */
  easing?: string;
  onAnimationComplete?: () => void;
  /** Duration of each of the two animation steps, in seconds. */
  stepDuration?: number;
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
  easing = "linear",
  onAnimationComplete,
  stepDuration = 0.35,
}: BlurTextProps) => {
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

  const offset = direction === "top" ? -50 : 50;

  return (
    <Tag ref={ref} className={`flex flex-wrap ${className}`} style={{ columnGap: "0.25em" }}>
      {units.map((unit, index) => {
        const last = index === units.length - 1;
        const style = {
          "--blur-text-from": `${offset}px`,
          "--blur-text-overshoot": `${-offset / 10}px`,
          animationDuration: `${stepDuration * 2}s`,
          animationDelay: `${(index * delay) / 1000}s`,
          animationTimingFunction: easing,
        } as CSSProperties;
        // The space between words sits outside the animated span: a space at the end
        // of an inline-block is dropped by the browser (iOS Safari showed the heading
        // as one long word). The visible gap comes from `column-gap` on the wrapper;
        // the real space keeps the text readable for search engines and screen readers.
        return (
          <Fragment key={unit.key}>
            <span
              className={`blur-text-word${inView ? " is-visible" : ""}`}
              style={style}
              onAnimationEnd={last ? onAnimationComplete : undefined}
            >
              {unit.content}
            </span>
            {last ? null : " "}
          </Fragment>
        );
      })}
    </Tag>
  );
};

export default BlurText;
