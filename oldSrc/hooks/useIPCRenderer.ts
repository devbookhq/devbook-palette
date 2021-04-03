import { useEffect } from 'react';
import electron from 'mainCommunication';

function useIPCRenderer(eventName: string, handler: (paramObj: any, ...args: any) => void, deps: any[] = []) {
  useEffect(() => {
    electron.ipcRenderer.on(eventName, handler);
    return () => {
      electron.ipcRenderer.removeListener(eventName, handler);
    };
  }, [eventName, handler, deps]);
}

export default useIPCRenderer;
