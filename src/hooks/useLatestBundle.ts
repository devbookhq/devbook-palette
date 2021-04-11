import {
  useRef,
  useEffect,
} from 'react';
import axios from 'axios';
import ElectronService from 'services/electron.service';

type Response = { bundle?: string, error?: any };
type CBType = (response: Response) => void;

function useLatestBundle(callback: CBType, version: string, interval: number, deps: any[] = []) {
  const savedCb = useRef<CBType | null>(null);

  useEffect(() => {
    savedCb.current = callback;
  }, [callback, ...deps]);

  useEffect(() => {
    async function tick() {
      // Don't do bundle checks during a local development. Because the client is running locally on localhost.
      if (ElectronService.isDev) return;

      try {
        const url = `${process.env.REACT_APP_CLIENT_URL}/__latest-bundle?version=${encodeURIComponent(version)}`;
        const response = await axios.get(url);
        const { latest } = response.data;
        if (latest) {
          savedCb.current?.({ bundle: latest });
        } else {
          throw new Error(`No latest bundle field in the response - ${JSON.stringify(response.data)}`);
        }
      } catch (error) {
        savedCb.current?.({ error });
      }
    }

    const id = setInterval(tick, interval);
    return () => clearInterval(id);
  }, [interval, ...deps]);
}

export default useLatestBundle;

