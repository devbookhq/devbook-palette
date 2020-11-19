import { useEffect } from 'react';
import electron from 'mainProcess';

function useIPCRenderer(eventName: string, handler: (paramObj: any, ...args: any) => void) {
  useEffect(() => {
    electron.ipcRenderer.on(eventName, handler);
    return () => {
      electron.ipcRenderer.removeListener(eventName, handler);
    };
  }, [eventName, handler]);
}

export default useIPCRenderer;
