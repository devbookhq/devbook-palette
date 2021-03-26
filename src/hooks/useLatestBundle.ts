import {
  useRef,
  useEffect,
} from 'react';
import axios from 'axios';

type Response = { bundle?: string, error?: any };
type CBType = (response: Response) => void;

function useLatestBundle(callback: CBType, version: string, interval: number) {
  const savedCb = useRef<CBType | null>(null);

  useEffect(() => {
    console.log('');
    savedCb.current = callback;
  }, [callback]);

  useEffect(() => {
    async function tick() {
      try {
        const url = `https://client.usedevbook.com/__latest-bundle?version=${encodeURIComponent(version)}`;
        const response = await axios.get(url);
        const { bundle } = response.data;
        if (bundle) {
          savedCb.current?.({ bundle });
        } else {
          throw new Error(`No 'bundle' field in the response - ${JSON.stringify(response.data)}`);
        }
      } catch (error) {
        savedCb.current?.({ error });
      }
    }

    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [interval]);
}

export default useLatestBundle;

