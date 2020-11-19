import io from 'socket.io';
import { EventEmitter } from 'events';

class VSCodeManager {
  private static PORT = 8019;
  private server: io.Server;
  private vscodeServer: io.Namespace
  public emitter = new EventEmitter();

  public constructor() {
    this.server = io();
    this.vscodeServer = this.server.of('/vscode');

    this.vscodeServer.on('connect', (socket) => {
      socket.on('problems', (problems) => {
        this.emitter.emit('problems', problems);
      });
    });

    this.server.listen(VSCodeManager.PORT);
    console.debug(`VSCodeManager listening on port ${VSCodeManager.PORT}`);
  }
}

export default VSCodeManager;
