import { useEffect } from 'react';

type Modifier = 'Alt' | 'Control' | null;

function useOnKeyPress(modifier: Modifier, targetKey: string, handler: (event: any) => void) {
  useEffect(() => {
    function listener(event: any) {
      const { key }: { key: string } = event;
      if (key === targetKey) {
        if (!modifier) {
          handler(event);
          return;
        }

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
  }, [targetKey, handler, modifier]);
}

export default useOnKeyPress;
