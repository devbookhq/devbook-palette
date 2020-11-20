import io from 'socket.io';
import { EventEmitter } from 'events';
import { notEmpty } from './utils';

class VSCodeManager {
  private static PORT = 8019;
  private server: io.Server;
  private vscodeServer: io.Namespace
  public emitter = new EventEmitter();

  private problems: { [socketID: string]: any } = {};

  private terminalsData: { [terminaID: number]: string[] } = {};

  public constructor() {
    this.server = io();
    this.vscodeServer = this.server.of('/vscode');

    this.vscodeServer.on('connect', (socket) => {
      socket.on('problems', (data) => {
        this.problems[socket.id] = data.problems;
        this.reportProblems();
      });

      socket.on('terminal-data', ({ id, data }: { id: number, data: string }) => {
        console.log('terminal data', id);
        this.terminalsData[id] = (this.terminalsData[id] || []).concat(data);
        this.reportTerminalData();
      });

      socket.on('disconnect', () => {
        delete this.problems[socket.id];
        this.reportProblems();
      });
    });

    this.server.listen(VSCodeManager.PORT);

    console.debug(`VSCodeManager listening on port ${VSCodeManager.PORT}`);
  }

  private reportTerminalData() {
    const aggregatedTerminalData = Object
      .entries(this.terminalsData)
      .map(([terminalID, data]) => {
        return {
          terminalID,
          data,
        };
      });

    this.emitter.emit('terminal-data', aggregatedTerminalData);
  }

  private reportProblems() {
    const aggregatedProblems = Object
      .values(this.problems)
      .flat()
      .map(([uri, uriDiagnostics]: [uri: any, uriDiagnostics: any]) => {
        if (uriDiagnostics.length) {
          return uriDiagnostics
            .map((uriDiagnostic: any) => {
              return {
                diagnostic: uriDiagnostic,
                uri,
              };
            });
        }
      })
      .filter(notEmpty)
      .flat()
      .filter(p => p.diagnostic.severity === 'Error');

    this.emitter.emit('problems', aggregatedProblems);
  }
}

export default VSCodeManager;
