import Analytics from 'analytics-node';
import { v4 as uuidv4 } from 'uuid';
import { app } from 'electron';
import ElectronStore from 'electron-store';

import debounce from './utils/debounce';

const client = new Analytics('BBXIANCzegnEoaL8k1YWN6HPqb3z0yaf', { flushAt: 5 });
const store = new ElectronStore();

let userID = store.get('userID', uuidv4());
store.set('userID', userID);

const appVersion = app.getVersion();
const platform = process.platform;

client.identify({
  userId: userID,
  traits: {
    platform,
    appVersion,
  },
});

export function changeAnalyticsUser(newUserID?: string) {
  const deviceUserID = store.get('userID', uuidv4());
  store.set('userID', userID);

  if (newUserID) {
    client.alias({
      previousId: deviceUserID,
      userId: newUserID,
    });

    userID = newUserID;
  } else {
    userID = deviceUserID;
  }
}

export function trackShowApp() {
  client.track({
    event: 'Showed app',
    userId: userID,
    properties: {
      platform,
      appVersion,
    },
  });
}

export function trackOnboardingStarted() {
  client.track({
    event: 'Onboarding started',
    userId: userID,
    properties: {
      platform,
      appVersion,
    },
  });
}

export function trackOnboardingFinished() {
  client.track({
    event: 'Onboarding finished',
    userId: userID,
    properties: {
      platform,
      appVersion,
    },
  });
}

export function trackConnectGitHubStarted() {
  client.track({
    event: 'Connecting GitHub started',
    userId: userID,
    properties: {
      platform,
      appVersion,
    },
  });
}

export function trackConnectGitHubFinished() {
  client.track({
    event: 'Connecting GitHub finished',
    userId: userID,
    properties: {
      platform,
      appVersion,
    },
  });
}

export function trackShortcut(shortcutInfo: { action: string, hotkey: string }) {
  client.track({
    event: 'Shortcut used',
    userId: userID,
    properties: {
      platform,
      appVersion,
      ...shortcutInfo,
    },
  });
}

function trackSearch(searchInfo: any) {
  client.track({
    event: 'Search',
    userId: userID,
    properties: {
      platform,
      appVersion,
      ...searchInfo,
    },
  });
}

export const trackSearchDebounced = debounce(trackSearch, 3000);

export function trackModalOpened(modalInfo: any) {
  client.track({
    event: 'Modal opened',
    userId: userID,
    properties: {
      platform,
      appVersion,
      ...modalInfo,
    },
  });
}

export function trackSignInModalOpened() {

}

export function trackSignInModalClosed() {

}

export function trackSignInButtonClicked() {

}

export function trackSignInAgainButtonClicked() {

}

export function trackSignInFinished() {

}

export function trackSignOutButtonClicked() {

}


