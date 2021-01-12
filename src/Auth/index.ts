import { Magic } from 'magic-sdk';
import electron, { aliasAnalyticsUser, openLink } from '../mainProcess';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const querystring = electron.remote.require('querystring') as typeof import('querystring');

const magic = new Magic('pk_test_2AE829E9A03C1FA0');

export async function signIn(email: string = 'tomas@usedevbook.com') {
  if (await magic.user.isLoggedIn()) {
    await magic.user.logout();
  }

  // const url = 'https://api.usedevbook.com/user/signin';
  const url = 'http://localhost:3002/';

  const sessionID = uuidv4();

  const params = querystring.encode({
    email,
  });

  openLink(`${url}/auth/signin/${sessionID}?${params}`);

  const result = await axios.get(`${url}/auth/credentials/${sessionID}`, {
    params: {
      email,
    },
  });

  const { credentials } = result.data;

  await magic.auth.loginWithCredential(credentials);

  const userMetadata = await magic.user.getMetadata();

  console.log('public address', userMetadata.publicAddress);

  // await aliasAnalyticsUser(userMetadata.publicAddress);
}
