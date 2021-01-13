import express from 'express';
import crypto from 'crypto';
import { shell } from 'electron';
import { EventEmitter } from 'events';
import axios from 'axios';
import querystring from 'querystring';
import path from 'path';
import { app } from 'electron';
import isDev from './utils/isDev';

function getRandomToken() {
  return crypto.randomBytes(48).toString('hex');
}

function openLink(url: string) {
  return shell.openExternal(url);
}

class GitHubOAuth {
  private static PORT = 8020;
  private static GITHUB_CONFIG = {
    client_id: 'edcfabd8a71a394620a0',
    redirect_uri: `http://localhost:${GitHubOAuth.PORT}`,
    login: '',
    scope: '',
    allow_signup: 'true',
  };
  private static redirectHTMLPath = path.join(app.getAppPath(), isDev ? '' : '..', 'resources', 'OAuthRedirect');

  private stateTokens: { [state: string]: boolean } = {};
  private app = express();

  public emitter = new EventEmitter();

  public constructor(private showApp: any, private hideApp: any) {
    this.app.use('/redirect', express.static(GitHubOAuth.redirectHTMLPath));

    this.app.all('/', async (req, res) => {
      const code = req.query['code'] as string;
      const state = req.query['state'] as string;

      if (!this.stateTokens[state]) {
        return res.status(404).send();
      }

      try {
        const accessToken = await GitHubOAuth.getAccessToken(code);
        this.emitter.emit('access-token', { accessToken });
        res.redirect('/redirect');
      } catch (error) {
        console.error(error.message);
        this.emitter.emit('error', { message: error.message });
        res.status(500).send();
      } finally {
        delete this.stateTokens[state];
        this.showApp();
      }
    });

    this.app.listen(GitHubOAuth.PORT);
  }

  private static async getAccessToken(code: string) {
    const result = await axios.post('https://api.usedevbook.app/getOAuthAccessToken', {
      code,
    });
    return result.data.accessToken;
  }

  public async requestOAuth() {
    const state = getRandomToken();
    this.stateTokens[state] = true;

    const queryParams = querystring.stringify({
      ...GitHubOAuth.GITHUB_CONFIG,
      state,
    });
    const url = `https://github.com/login/oauth/authorize?${queryParams}`;

    openLink(url);
    this.hideApp();
  }
}

export default GitHubOAuth;
