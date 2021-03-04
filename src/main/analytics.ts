import * as electron from 'electron';
import Analytics from 'analytics-node';
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

  ShowSearchHistory = 'Show search history',
  HideSearchHistory = 'Hide search history',
  SelectHistoryQuery = 'Selected query from search history',

  UpdateClicked = 'Update clicked',
  UpdateCancelClicked = 'Update cancel clicked',
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

export function identifyUser(searchWindow?: electron.BrowserWindow) {
  if (userID) {
    client.identify({
      anonymousId: anonymousID,
      userId: userID,
      traits: {
        isSignedUp: true,
        platform,
        anonymousID: anonymousID,
        appVersion,
        currentSearchWindowWidth: searchWindow?.getSize()[0],
        currentSearchWindowHeight: searchWindow?.getSize()[1],
      },
    });
  } else {
    client.identify({
      anonymousId: anonymousID,
      traits: {
        anonymousID: anonymousID,
        platform,
        appVersion,
        currentSearchWindowWidth: searchWindow?.getSize()[0],
        currentSearchWindowHeight: searchWindow?.getSize()[1],
      },
    });
  }
}

export function changeAnalyticsUser(searchWindow?: electron.BrowserWindow, user?: { userID: string, email: string }) {
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
        currentSearchWindowWidth: searchWindow?.getSize()[0],
        currentSearchWindowHeight: searchWindow?.getSize()[1],
      },
    });
  } else {
    isSignedIn = false;
    userID = undefined;
  }
}

export function trackShowApp(searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.ShowedApp,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

export function trackOnboardingStarted(searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.OnboardingStarted,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

export function trackOnboardingFinished(searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.OnboardingFinished,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });

  client.identify({
    anonymousId: anonymousID,
    traits: {
      finishedOnboardingAt: new Date(),
    },
  });
}

export function trackConnectGitHubStarted(searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.ConnectingGitHubStarted,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

export function trackConnectGitHubFinished(searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.ConnectingGitHubFinished,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

export function trackShortcut(shortcutInfo: { action: string, hotkey: string }, searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.ShortcutUsed,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      ...shortcutInfo,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

function trackSearch(searchInfo: any, searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.Search,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      ...searchInfo,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

export const trackSearchDebounced = debounce(trackSearch, 3000);

export function trackModalOpened(modalInfo: any, searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.ModalOpened,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      ...modalInfo,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

export function trackSignInModalOpened(searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.SignInModalOpened,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

export function trackSignInModalClosed(searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.SignInModalClosed,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

export function trackSignInButtonClicked(searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.SignInButtonClicked,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

export function trackSignInAgainButtonClicked(searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.SignInAgainButtonClicked,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

export function trackSignInFinished(searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.SignInFinished,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

export function trackSignInFailed(error: string, searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.SignInFailed,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      error,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

export function trackContinueIntoAppButtonClicked(searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.ContinueIntoAppButtonClicked,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

export function trackSignOutButtonClicked(searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.SignOutButtonClicked,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

export function trackEnablePinMode(searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.EnablePinMode,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

export function trackDisablePinMode(searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.DisablePinMode,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

export function trackShowSearchHistory(searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.ShowSearchHistory,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

export function trackHideSearchHistory(searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.HideSearchHistory,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

export function trackSelectHistoryQuery(searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.SelectHistoryQuery,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}

export async function trackUpdateClicked(location: 'tray' | 'banner' | 'preferences', searchWindow?: electron.BrowserWindow) {
  return new Promise<void>((resolve, reject) => {
    client.track({
      event: AnalyticsEvent.UpdateClicked,
      anonymousId: anonymousID,
      userId: userID,
      properties: {
        isSignedIn,
        platform,
        appVersion,
        location,
        searchWindowWidth: searchWindow?.getSize()[0],
        searchWindowHeight: searchWindow?.getSize()[1],
      },
    }).flush((error, data) => {
      if (error !== null) {
        return reject(error);
      } else {
        return resolve();
      }
    });
  });
}
export function trackUpdateCancelClicked(location: 'banner', searchWindow?: electron.BrowserWindow) {
  client.track({
    event: AnalyticsEvent.UpdateCancelClicked,
    anonymousId: anonymousID,
    userId: userID,
    properties: {
      isSignedIn,
      platform,
      appVersion,
      location,
      searchWindowWidth: searchWindow?.getSize()[0],
      searchWindowHeight: searchWindow?.getSize()[1],
    },
  });
}
