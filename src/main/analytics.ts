import Analytics from 'analytics-node';
import { v4 as uuidv4 } from 'uuid';
import { app } from 'electron';
import ElectronStore from 'electron-store';

import isDev from './utils/isDev';
import debounce from './utils/debounce';
import { StoreKey } from './StoreKey';

enum AnalyticsEvent {
  ShowedApp = 'Showed app',

  OnboardingStarted = 'Onboarding started',
  OnboardingFinished = 'Onboarding finished',

  ShortcutUsed = 'Shortcut used',

  Search = 'Search',

  ModalOpened = 'Modal opened',

  SignInModalOpened = 'Sign in modal opened',
  SignInModalClosed = 'Sign in modal closed',
  SignInButtonClicked = 'Sign in button clicked',
  SignInAgainButtonClicked = 'Sign in again button clicked',
  SignInFinished = 'Sign in finished',
  SignInFailed = 'Sign in failed',
  ContinueIntoAppButtonClicked = 'Continue into app button clicked',
  SignOutButtonClicked = 'Sign out button clicked',
}

const SEGMENT_WRITE_KEY = isDev ? 'g0PqvygVRpBCVkPF78LCP9gidnwPKo7s' : 'BBXIANCzegnEoaL8k1YWN6HPqb3z0yaf';
const SEGMENT_FLUSH = isDev ? 1 : 5;

const client = new Analytics(SEGMENT_WRITE_KEY, { flushAt: SEGMENT_FLUSH });
const store = new ElectronStore();

let isSignedIn = false;
let userID = store.get(StoreKey.UserID, uuidv4());
store.set(StoreKey.UserID, userID);

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
  const savedUserID = store.get(StoreKey.UserID, uuidv4());
  store.set(StoreKey.UserID, savedUserID);

  if (user) {
    client.identify({
      userId: savedUserID,
      traits: {
        platform,
        appVersion,
        email: user.email,
      },
    });

    client.alias({
      previousId: savedUserID,
      userId: user.userID,
    });

    isSignedIn = true;
    userID = user.userID;
  } else {
    isSignedIn = false;
    userID = savedUserID;
  }
}

export function trackShowApp() {
  client.track({
    event: AnalyticsEvent.ShowedApp,
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
    event: AnalyticsEvent.OnboardingStarted,
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
    event: AnalyticsEvent.OnboardingFinished,
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
    event: AnalyticsEvent.ShortcutUsed,
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
    event: AnalyticsEvent.Search,
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
    event: AnalyticsEvent.ModalOpened,
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
    event: AnalyticsEvent.SignInModalOpened,
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
    event: AnalyticsEvent.SignInModalClosed,
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
    event: AnalyticsEvent.SignInButtonClicked,
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
    event: AnalyticsEvent.SignInAgainButtonClicked,
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
    event: AnalyticsEvent.SignInFinished,
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
    event: AnalyticsEvent.SignInFailed,
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
    event: AnalyticsEvent.ContinueIntoAppButtonClicked,
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
    event: AnalyticsEvent.SignOutButtonClicked,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
    },
  });
}
