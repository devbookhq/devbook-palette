import electron from 'mainProcess';

export default function isDev(): Promise<boolean> {
  return electron.ipcRenderer.invoke('is-dev');
}
