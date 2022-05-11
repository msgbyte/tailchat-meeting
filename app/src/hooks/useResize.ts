import { useEffect } from 'react';
import { useUpdateRef } from './useUpdateRef';

/**
 * 浏览器窗口大小发生变化
 */
export function useResize(callback: () => void) {
  const callbackRef = useUpdateRef(callback);
  useEffect(() => {
    const fn = () => {
      callbackRef.current();
    };
    window.addEventListener('resize', fn);

    return () => {
      window.removeEventListener('resize', fn);
    };
  }, []);
}
