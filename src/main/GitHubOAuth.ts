import crypto from 'crypto';
import { shell } from 'electron';
import { EventEmitter } from 'events';
import axios from 'axios';

import isDev from './utils/isDev';
import timeout from '../utils/timeout';

const BASE_URL = isDev ? 'https://dev.usedevbook.com' : 'https://api.usedevbook.com';

function generateSessionID() {
  return encodeURIComponent(crypto.randomBytes(64).toString('base64'));
};

function openLink(url: string) {
  return shell.openExternal(url);
}

class GitHubOAuth {
  public emitter = new EventEmitter();

  private getAccessTokenCancelHandle?: () => void;

  private async getAccessToken(sessionID: string) {
    this.getAccessTokenCancelHandle?.();

    let resolveHandle: (reason?: any) => void;
    let isCancelled = false;

    const cancelableGetAccessToken = new Promise<void>(async (resolve, reject) => {
      resolveHandle = resolve;

      let accessToken: string | undefined = undefined;

      const requestLimit = 15 * 60;

      for (let i = 0; i < requestLimit; i++) {
        if (isCancelled) {
          break;
        }

        if (accessToken) {
          break;
        }

        try {
          const result = await axios.get(`${BASE_URL}/github/oauth/accessToken/${sessionID}`);
          accessToken = result.data.accessToken;
          break;

        } catch (error) {
          if (error.response?.status !== 503) {
            console.error(error.message);
            this.emitter.emit('error', { error: 'Could not connect GitHub' });
            return;
          }
        }
        await timeout(1500);
      }

      if (isCancelled) {
        try {
          return axios.delete(`${BASE_URL}/github/oauth/accessToken/${sessionID}`);
        } catch (error) {
          console.error(error.message);
        }
      }

      if (accessToken) {
        this.emitter.emit('access-token', { accessToken });
      } else {
        this.emitter.emit('error', { error: 'GitHub OAuth timeout' });
      }
      return resolve();
    });

    this.getAccessTokenCancelHandle = () => {
      isCancelled = true;
      resolveHandle();
    };

    return cancelableGetAccessToken;
  }

  public async requestOAuth() {
    const sessionID = generateSessionID();

    const link = isDev ? `${BASE_URL}/github/oauth/authorize/${sessionID}` : `${BASE_URL}/github/oauth/authorize/${sessionID}`;
    await openLink(link);

    await this.getAccessToken(sessionID);
  }
}

export default GitHubOAuth;
