import { useEffect, useState, useRef } from 'react';

export function useIntersectionObserver(options) {
  const [entry, setEntry] = useState(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      setEntry(entry);
      if (entry.isIntersecting) {
        setIsIntersecting(true);
      }
    }, options);

    const element = ref.current;

    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, [options]);

  return [ref, isIntersecting, entry];
}
