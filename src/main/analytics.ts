import Analytics, { } from 'analytics-node';
import { v4 as uuidv4 } from 'uuid';
import { app } from 'electron';
import ElectronStore from 'electron-store';

import isDev from './utils/isDev';
import debounce from '../utils/debounce';

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

  ConnectingGitHubStarted = 'Connecting GitHub started',
  ConnectingGitHubFinished = 'Connecting GitHub finished',

  EnablePinMode = 'Enable pin mode',
  DisablePinMode = 'Disable pin mode',
}

const SEGMENT_WRITE_KEY = isDev ? 'g0PqvygVRpBCVkPF78LCP9gidnwPKo7s' : 'BBXIANCzegnEoaL8k1YWN6HPqb3z0yaf';
const SEGMENT_FLUSH = isDev ? 1 : 5;

const client = new Analytics(SEGMENT_WRITE_KEY, { flushAt: SEGMENT_FLUSH });
const store = new ElectronStore();

let isSignedIn = false;
let userID: string | undefined = undefined;
let anonymousID = store.get('userID', uuidv4());
store.set('userID', anonymousID);

const appVersion = app.getVersion();
const platform = process.platform;

client.identify({
  anonymousId: anonymousID,
  traits: {
    anonymousID: anonymousID,
    platform,
    appVersion,
  },
});

export function changeAnalyticsUser(user?: { userID: string, email: string }) {
  if (user) {
    isSignedIn = true;
    userID = user.userID;

    client.identify({
      anonymousId: anonymousID,
      userId: userID,
      traits: {
        isSignedUp: true,
        platform,
        appVersion,
        email: user.email,
      },
    });
  } else {
    isSignedIn = false;
    userID = undefined;
  }
}

export function trackShowApp() {
  client.track({
    event: AnalyticsEvent.ShowedApp,
    anonymousId: anonymousID,
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
    anonymousId: anonymousID,
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
    anonymousId: anonymousID,
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
    event: AnalyticsEvent.ConnectingGitHubStarted,
    anonymousId: anonymousID,
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
    event: AnalyticsEvent.ConnectingGitHubFinished,
    anonymousId: anonymousID,
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
    anonymousId: anonymousID,
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
    anonymousId: anonymousID,
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
    anonymousId: anonymousID,
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
    anonymousId: anonymousID,
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
    anonymousId: anonymousID,
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
    anonymousId: anonymousID,
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
    anonymousId: anonymousID,
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
    anonymousId: anonymousID,
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
    anonymousId: anonymousID,
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
    anonymousId: anonymousID,
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
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
    },
  });
}

export function trackEnablePinMode() {
  client.track({
    event: AnalyticsEvent.EnablePinMode,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
    },
  })
}

export function trackDisablePinMode() {
  client.track({
    event: AnalyticsEvent.DisablePinMode,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
    },
  })
}

