import Analytics from 'analytics-node';
import { v4 as uuidv4 } from 'uuid';
import { app } from 'electron';
import ElectronStore from 'electron-store';

import debounce from './utils/debounce';

const client = new Analytics('BBXIANCzegnEoaL8k1YWN6HPqb3z0yaf', { flushAt: 5 });
const store = new ElectronStore();

let isSignedIn = false;
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

export function changeAnalyticsUser(user?: { userID: string, email: string }) {
  const savedUserID = store.get('userID', uuidv4());
  store.set('userID', savedUserID);

  if (user) {
    client.alias({
      previousId: savedUserID,
      userId: user.userID,
    });

    client.identify({
      userId: user.userID,
      traits: {
        email: user.email,
      },
    });

    isSignedIn = false;
    userID = user.userID;
  } else {
    isSignedIn = false;
    userID = savedUserID;
  }
}

export function trackShowApp() {
  client.track({
    event: 'Showed app',
    userId: userID,
    properties: {
      isSignedIn,
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
      isSignedIn,
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
      isSignedIn,
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
      isSignedIn,
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
      isSignedIn,
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
      isSignedIn,
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
      isSignedIn,
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
      isSignedIn,
      platform,
      appVersion,
      ...modalInfo,
    },
  });
}

export function trackSignInModalOpened() {
  client.track({
    event: 'Sign in modal opened',
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
    },
  });
}

export function trackSignInModalClosed() {
  client.track({
    event: 'Sign in modal closed',
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
    },
  });
}

export function trackSignInButtonClicked() {
  client.track({
    event: 'Sign in button clicked',
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
    },
  });
}

export function trackSignInAgainButtonClicked() {
  client.track({
    event: 'Sign in again button clicked',
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
    },
  });
}

export function trackSignInFinished() {
  client.track({
    event: 'Sign in finished',
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
    },
  });
}

export function trackSignInFailed(error: string) {
  client.track({
    event: 'Continue into app button clicked',
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      error,
    },
  });
}

export function trackContinueIntoAppButtonClicked() {
  client.track({
    event: 'Continue into app button clicked',
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
    },
  });
}

export function trackSignOutButtonClicked() {
  client.track({
    event: 'Sign out button clicked',
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
    },
  });
}
