import io from 'socket.io';
import { EventEmitter } from 'events';
import { notEmpty } from './utils';

class VSCodeManager {
  private static PORT = 8019;
  private server: io.Server;
  private vscodeServer: io.Namespace
  private problems: { [socketID: string]: any } = {};
  public emitter = new EventEmitter();

  public constructor() {
    this.server = io();
    this.vscodeServer = this.server.of('/vscode');

    this.vscodeServer.on('connect', (socket) => {
      socket.on('problems', (data) => {
        this.problems[socket.id] = data.problems;
        this.reportProblems();
      });

      socket.on('disconnect', () => {
        delete this.problems[socket.id];
        this.reportProblems();
      });
    });

    this.server.listen(VSCodeManager.PORT);

    console.debug(`VSCodeManager listening on port ${VSCodeManager.PORT}`);
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
