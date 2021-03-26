import { useLayoutEffect } from 'react';

function useLockBodyScroll() {
  useLayoutEffect(() => {
    const originalValue = window.getComputedStyle(document.body).overflow;

    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalValue;
    }
  }, []);
}

export default useLockBodyScroll;
