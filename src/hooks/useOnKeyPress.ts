import { useEffect } from 'react';

type Modifier = 'Alt' | 'Control' | null;

function useOnKeyPress(modifier: Modifier, targetKeys: string | string[], handler: (event: any) => void, deps?: any[]) {
  useEffect(() => {
    function listener(event: any) {
      const { key }: { key: string } = event;
      if (key === targetKeys || Array.isArray(targetKeys) && targetKeys.includes(key)) {
        if (!modifier) {
          handler(event);
          return;
        }

        console.log('MODIFIER', modifier);
        console.log(event);
        if (modifier === 'Alt' && event.altKey) {
          handler(event);
          return;
        }

        if (modifier === 'Control' && event.ctrlKey) {
          handler(event);
          return;
        }
      }
    }

    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, deps ? [targetKeys, handler, modifier, ...deps] : [targetKeys, handler, modifier]);
}

export default useOnKeyPress;

