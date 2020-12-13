import Analytics from 'analytics-node';
import { v4 as uuidv4 } from 'uuid';
import { app } from 'electron';
import ElectronStore from 'electron-store';

import debounce from './utils/debounce';

const client = new Analytics('BBXIANCzegnEoaL8k1YWN6HPqb3z0yaf', { flushAt: 5 });
const store = new ElectronStore();

const userID = store.get('userID', uuidv4());
store.set('userID', userID);

const appVersion = app.getVersion();

client.identify({
  userId: userID,
  traits: {
    name: userID,
    appVersion,
  },
});

export function trackShowApp() {
  client.track({
    event: 'Showed app',
    userId: userID,
    properties: {
      appVersion,
    },
  });
}

export function trackOnboardingStarted() {
  client.track({
    event: 'Onboarding started',
    userId: userID,
    properties: {
      appVersion,
    },
  });
}

export function trackOnboardingFinished() {
  client.track({
    event: 'Onboarding finished',
    userId: userID,
    properties: {
      appVersion,
    },
  });
}

export function trackConnectGitHubStarted() {
  client.track({
    event: 'Connecting GitHub started',
    userId: userID,
    properties: {
      appVersion,
    },
  });
}

export function trackConnectGitHubFinished() {
  client.track({
    event: 'Connecting GitHub finished',
    userId: userID,
    properties: {
      appVersion,
    },
  });
}

function trackSearch(searchInfo: any) {
  client.track({
    event: 'Search',
    userId: userID,
    properties: {
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
      appVersion,
      ...modalInfo,
    },
  });
}
