import ElectronService from './electron.service';

export enum AnalyticsEvent {
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

  EnablePinMode = 'Enable pin mode',
  DisablePinMode = 'Disable pin mode',

  ShowSearchHistory = 'Show search history',
  HideSearchHistory = 'Hide search history',
  SelectHistoryQuery = 'Selected query from search history',

  UpdateClicked = 'Update clicked',
  UpdateCancelClicked = 'Update cancel clicked',

  CopyCodeSnippetStackOverflow = 'Copy code snippet from Stack Overflow answer',
  CopyCodeSnippetDocs = 'Copy code snippet from docs',

  OpenDocsFilter = 'Open documentation filter',

  SearchModeChanged = 'Search mode changed',

  DismissBundleUpdate = 'Dismiss bundle update',
  PerformBundleUpdate = 'Perform bundle update'
}

type AnalyticsProperties = {

};

type AnalyticsMap = {
  // [event in AnalyticsEvent]: AnalyticsProperties[event]
}

class AnalyticsService {
  private constructor() { }
  private static readonly writeKey = ElectronService.isDev ? 'g0PqvygVRpBCVkPF78LCP9gidnwPKo7s' : 'BBXIANCzegnEoaL8k1YWN6HPqb3z0yaf';
  private static readonly flushAt = ElectronService.isDev ? 1 : 5;
  private static readonly analytics = new ElectronService.analytics(AnalyticsService.writeKey, { flushAt: AnalyticsService.flushAt });

  // static track<T extends AnalyticsEvent>(event: T, properties: AnalyticsMap[T], identity: { userID?: string, anonymousID?: string }) {
  //   AnalyticsService.analytics.track({
  //     event,
  //     anonymousId: identity.anonymousID,
  //     userId: identity.userID,
  //     // TODO: What about search window width and height?
  //     // searchWindowWidth: searchWindow?.getSize()[0],
  //     // searchWindowHeight: searchWindow?.getSize()[1],
  //     properties,
  //   });
  // }
}

export default ElectronService;
