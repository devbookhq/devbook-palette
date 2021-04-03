import { useEffect } from 'react';
import ElectronService from 'services/electron.service';

function useIPCRenderer(eventName: string, handler: (paramObj: any, ...args: any) => void, deps: any[] = []) {
  useEffect(() => {
    ElectronService.ipcRenderer.on(eventName, handler);
    return () => {
      ElectronService.ipcRenderer.removeListener(eventName, handler);
    };
  }, [eventName, handler, deps]);
}

export default useIPCRenderer;
