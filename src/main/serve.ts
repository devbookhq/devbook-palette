import fs from 'fs';
import path from 'path';

import { promisify } from 'util';
import * as electron from 'electron';

const stat = promisify(fs.stat);

// See https://cs.chromium.org/chromium/src/net/base/net_error_list.h
const FILE_NOT_FOUND = -6;

async function getPath(path_: string): Promise<string | undefined> {
  try {
    const result = await stat(path_);

    if (result.isFile()) {
      return path_;
    }

    if (result.isDirectory()) {
      return getPath(path.join(path_, 'index.html'));
    }
  } catch (error) {
    console.error(error.message);
  }
};

function serve(options: any) {
  options = Object.assign({
    isCorsEnabled: true,
    scheme: 'devbook',
  }, options);

  if (!options.directory) {
    throw new Error('The `directory` option is required');
  }

  options.directory = path.resolve(electron.app.getAppPath(), options.directory);

  const httpHandler = async (request: electron.ProtocolRequest, callback: (response: electron.ProtocolResponse) => void) => {
    const indexPath = path.join(decodeURIComponent(new URL(request.url).pathname));
    console.log(indexPath);
    callback({ url: indexPath });
    // const filePath = path.join(options.directory, decodeURIComponent(new URL(request.url).pathname));
    // const resolvedPath = await getPath(filePath);
    // const fileExtension = path.extname(filePath);

    // if (resolvedPath || !fileExtension || fileExtension === '.html' || fileExtension === '.asar') {
    //   callback({
    //     path: resolvedPath || indexPath
    //   });
    // } else {
    //   callback({ error: FILE_NOT_FOUND });
    // }
  };

  const fileHandler = async (request: electron.ProtocolRequest, callback: (response: electron.ProtocolResponse) => void) => {
    const indexPath = path.join(options.directory, 'index.html');
    const filePath = path.join(options.directory, decodeURIComponent(new URL(request.url).pathname));
    const resolvedPath = await getPath(filePath);
    const fileExtension = path.extname(filePath);

    if (resolvedPath || !fileExtension || fileExtension === '.html' || fileExtension === '.asar') {
      callback({
        path: resolvedPath || indexPath
      });
    } else {
      callback({ error: FILE_NOT_FOUND });
    }
  };

  electron.protocol.registerSchemesAsPrivileged([
    {
      scheme: options.scheme,
      privileges: {
        standard: true,
        bypassCSP: true,
        secure: true,
        allowServiceWorkers: true,
        supportFetchAPI: true,
        corsEnabled: options.isCorsEnabled,
      },
    },
  ]);

  electron.app.on('ready', () => {
    const session = options.partition ?
      electron.session.fromPartition(options.partition) :
      electron.session.defaultSession;

    electron.app.setAsDefaultProtocolClient('devbook');

    // session.protocol.registerFileProtocol(options.scheme, fileHandler);
    session.protocol.registerHttpProtocol(options.scheme, httpHandler);
  });

  return (window_: electron.BrowserWindow) => window_.loadURL(`${options.scheme}://-`);
};

export default serve({ directory: 'build', scheme: 'devbook' });
