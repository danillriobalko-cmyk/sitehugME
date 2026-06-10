import { useCallback, useRef, useState } from 'react';

/**
 * Появление при прокрутке.
 *
 * Использует callback-ref, а не объектный ref: наблюдатель привязывается
 * в момент реального появления DOM-узла. Это важно для компонентов, которые
 * сначала возвращают null (например, Premiere грузит данные), а отрисовывают
 * содержимое позже — иначе наблюдатель так и не повесился бы, и блок навсегда
 * оставался бы с opacity: 0.
 */
export function useScrollReveal(threshold = 0.1) {
  const [isVisible, setIsVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const ref = useCallback(
    (node: HTMLElement | null) => {
      // Отвязываем прошлый наблюдатель (на случай переинициализации).
      if (observerRef.current) {
        observerRef.current.disconnect();
        observerRef.current = null;
      }
      if (!node) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.disconnect();
          }
        },
        { threshold }
      );
      observer.observe(node);
      observerRef.current = observer;
    },
    [threshold]
  );

  return { ref, isVisible };
}
