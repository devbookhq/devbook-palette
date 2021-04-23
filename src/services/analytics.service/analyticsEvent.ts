import { UpdateLocation } from 'services/appWindow';
import { DocSource } from 'services/search.service/docSource';
import { SearchSource } from 'services/search.service/searchSource';

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

  DismissBundleUpdate = 'Dismiss bundle update',
  PerformBundleUpdate = 'Perform bundle update'
}

export type AnalyticsPayload = {
  [AnalyticsEvent.ShortcutUsed]: { action: string };
  [AnalyticsEvent.Search]: { query: string, activeFilter: SearchSource, activeDocSource?: DocSource };
  [AnalyticsEvent.ModalOpened]: void;
  [AnalyticsEvent.SignInModalOpened]: void;
  [AnalyticsEvent.SignInModalClosed]: void;
  [AnalyticsEvent.SignInButtonClicked]: void;
  [AnalyticsEvent.SignInAgainButtonClicked]: void;
  [AnalyticsEvent.SignInFinished]: void;
  [AnalyticsEvent.SignInFailed]: { error: string };
  [AnalyticsEvent.ContinueIntoAppButtonClicked]: void;
  [AnalyticsEvent.SignOutButtonClicked]: void;
  [AnalyticsEvent.EnablePinMode]: void;
  [AnalyticsEvent.DisablePinMode]: void;
  [AnalyticsEvent.ShowSearchHistory]: void;
  [AnalyticsEvent.HideSearchHistory]: void;
  [AnalyticsEvent.SelectHistoryQuery]: void;
  [AnalyticsEvent.UpdateClicked]: { location: UpdateLocation };
  [AnalyticsEvent.UpdateCancelClicked]: { location: UpdateLocation };
  [AnalyticsEvent.CopyCodeSnippetStackOverflow]: void;
  [AnalyticsEvent.CopyCodeSnippetDocs]: void;
  [AnalyticsEvent.PerformBundleUpdate]: void;
  [AnalyticsEvent.DismissBundleUpdate]: void;
  [AnalyticsEvent.OnboardingStarted]: void;
  [AnalyticsEvent.OnboardingFinished]: void;
  [AnalyticsEvent.ShowedApp]: void;
  [AnalyticsEvent.OpenDocsFilter]: void;
}
