import express from 'express';
import crypto from 'crypto';
import { shell } from 'electron';
import { EventEmitter } from 'events';
import axios from 'axios';

function getRandomToken() {
  return crypto.randomBytes(48).toString('hex');
}

function openLink(url: string) {
  return shell.openExternal(url);
}


class OAuth {
  private static PORT = 8020;
  private static CLIENT_ID = 'e9d91ad9a34c68cf2f7c';
  // TODO: Change the flow so we don't expose CLIENT_SECRET in the app
  private static CLIENT_SECRET = '74ed7cf4a8d7a69034ce7cda2e7e0b3dfac9ae8b';
  private static REDIRECT_URI = `http://localhost:${OAuth.PORT}/redirect`;
  private static LOGIN = '';
  private static SCOPE = '';
  private static ALLOW_SIGNUP = 'true';
  private app = express();

  public emitter = new EventEmitter();
  public stateTokens: { [state: string]: boolean } = {};

  public constructor() {
    this.app.all('/redirect', async (req, res) => {
      const code = req.params['code'];
      const state = req.params['state'];
      if (this.stateTokens[state]) {
        try {
          const accessToken = await this.getAccessToken(code, state);
          this.emitter.emit('access-token', {
            accessToken,
          });
        } catch (error) {
          this.emitter.emit('error', {

          });
        } finally {
          delete this.stateTokens[state];
          if (Object.keys(this.stateTokens).length === 0) {
            this.stop();
          }
        }
      }

    });
  }

  private start() {
    if (this.app.)
    this.app.listen(OAuth.PORT);
  }

  private stop() {
    this.start();
  }

  private async getAccessToken(code: string, state: string) {
    const result = await axios.post('https://github.com/login/oauth/access_token', {
      headers: {
        'Accept': 'application/json',
      },
      params: {
        code,
        state,
        client_id: OAuth.CLIENT_ID,
        client_secret: OAuth.CLIENT_SECRET,
        redirect_uri: OAuth.REDIRECT_URI,
      },
    });
    return result.data.access_token;
  }

  public async requestOAuth() {
    const state = getRandomToken();
    this.stateTokens[state] = true;

    const OAuthURL = `https://github.com/login/oauth/authorize?client_id=${OAuth.CLIENT_ID}&redirect_uri=${OAuth.REDIRECT_URI}&login=${OAuth.LOGIN}&scope=${OAuth.SCOPE}&state=${state}&allow_signup=${OAuth.ALLOW_SIGNUP}`;
    return openLink(OAuthURL);
  }
}

export default OAuth;
