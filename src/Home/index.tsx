import React, {
  useRef,
  useEffect,
  useCallback,
  useReducer,
  useMemo,
  useContext,
} from 'react';
import styled from 'styled-components';
import { useHotkeys } from 'react-hotkeys-hook';
import { Resizable } from 're-resizable';

import { IPCMessage } from 'mainCommunication/ipc';
import { AuthContext, AuthState, refreshAuth } from 'Auth';
import electron, {
  isDev,
  hideMainWindow,
  openLink,
  trackModalOpened,
  trackSearch,
  trackShortcut,
  saveSearchQuery,
  getSavedSearchQuery,
  saveSearchFilter,
  getSavedSearchFilter,
  saveDocSearchResultsDefaultWidth,
  getDocSearchResultsDefaultWidth,
  saveDocSources,
  getCachedDocSources,
  trackSignInModalOpened,
  trackSignInModalClosed,
} from 'mainCommunication';
import useDebounce from 'hooks/useDebounce';
import useIPCRenderer from 'hooks/useIPCRenderer';
import Button from 'components/Button';
import Loader from 'components/Loader';
import SignInModal from 'Auth/SignInModal';

import SearchHeaderPanel, { ResultsFilter } from './SearchHeaderPanel';
import {
  StackOverflowSearchHotkeysPanel,
  StackOverflowModalHotkeysPanel,
  DocsSearchHotkeysPanel,
} from './HotkeysPanel';
import FocusState from './SearchItemFocusState';
import { ExtensionsContext } from 'Extensions';
import {
  StackOverflowModal,
  StackOverflowItem,
  StackOverflowResult,
} from './StackOverflow';
import {
  DocsFilterModal,
  DocSearchResultItem,
  DocPage,
  DocResult,
  DocSource,
} from './Docs';


const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const SearchResultsWrapper = styled.div`
  padding: 10px 15px;
  width: 100%;

  overflow: hidden;
  overflow-y: overlay;
`;

const InfoMessage = styled.div`
  margin: 100px auto 0;

  color: #5A5A6F;
  font-size: 16px;
  font-weight: 600;
`;

const SignInButton = styled(Button)`
  margin-top: 30px;
  padding: 10px 20px;

  font-size: 15px;
  font-weight: 500;

  border-radius: 5px;
`;

const SignInAgainButton = styled(Button)`
  margin-top: 30px;
  padding: 10px 20px;

  color: #535BD7;
  font-size: 15px;
  font-weight: 500;

  border-radius: 5px;
  background: transparent;
  border: 1px solid #535BD7;

  :hover {
    background: transparent;
    color: #646CEA;
    border: 1px solid #646CEA;
    cursor: pointer;
  }
`;

const EnableDocSourcesButton = styled(Button)`
  margin: 15px 0;
  padding: 10px 20px;

  font-size: 15px;
  font-weight: 500;

  border-radius: 5px;
`;


const DocsWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: flex-start;
  overflow: hidden;
`;

const DocsResultsWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const EnabledDocsText = styled.span`
  width: 100%;
  padding: 5px 10px;

  font-size: 14px;
  color: #6787ff;
  font-weight: 500;

  background: #262736;
  border-right: 2px solid #3b3a4a;
  border-bottom: 2px solid #3b3a4a;

  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

const DocSearchResults = styled.div`
  width: 100%;
  height: 100%;

  padding: 10px 0 20px;
  margin: 0;

  display: flex;
  flex-direction: column;

  overflow: hidden;
  overflow-y: overlay;

  border-right: 2px solid #3B3A4A;
  background: #262736;
`;

const DocsLoader = styled(Loader)`
  margin-top: 50px;
`;

type SearchResultItem = StackOverflowResult | DocResult;
type SearchResultItems = StackOverflowResult[] | DocResult[];
type SearchResults = {
  [key in ResultsFilter]: {
    items: SearchResultItems;
    isLoading: boolean;
    scrollTopPosition: number;
    focusedIdx: {
      idx: number;
      focusState: FocusState;
    };
  }
}

enum ReducerActionType {
  SetSearchQuery,
  SetSearchFilter,

  CacheScrollTopPosition,
  ClearResults,

  StartSearching,
  SearchingSuccess,
  SearchingFail,

  FocusResultItem,

  // StackOverflow modal.
  OpenModal,
  CloseModal,

  SetDocSearchResultsDefaultWidth,
  CacheDocSearchResultsWidth,

  SearchInDocPage,
  CancelSearchInDocPage,

  OpenDocsFilterModal,
  CloseDocsFilterModal,

  OpenSignInModal,
  CloseSignInModal,

  FetchDocSourcesSuccess,
  FetchDocSourcesFail,

  IncludeDocSourceInSearch,
  RemoveDocSourceFromSearch,

  SetIsLoadingCachedData,
}

interface SetSearchQuery {
  type: ReducerActionType.SetSearchQuery;
  payload: {
    query: string;
  };
}

interface SetSearchFilter {
  type: ReducerActionType.SetSearchFilter;
  payload: {
    filter: ResultsFilter;
  };
}

interface CacheScrollTopPosition {
  type: ReducerActionType.CacheScrollTopPosition;
  payload: {
    filter: ResultsFilter;
    scrollTopPosition: number;
  };
}

interface ClearResults {
  type: ReducerActionType.ClearResults;
}

interface StartSearching {
  type: ReducerActionType.StartSearching;
  payload: {
    filter: ResultsFilter;
  };
}

interface SearchingSuccess {
  type: ReducerActionType.SearchingSuccess;
  payload: {
    filter: ResultsFilter;
    items: SearchResultItems;
  };
}

interface SearchingFail {
  type: ReducerActionType.SearchingFail;
  payload: {
    filter: ResultsFilter;
    errorMessage: string;
  };
}

interface FocusResultItem {
  type: ReducerActionType.FocusResultItem;
  payload: {
    filter: ResultsFilter;
    idx: number;
    focusState: FocusState;
  };
}

interface OpenModal {
  type: ReducerActionType.OpenModal;
  payload: {
    item: SearchResultItem;
  };
}

interface CloseModal {
  type: ReducerActionType.CloseModal;
}

interface SetDocSearchResultsDefaultWidth {
  type: ReducerActionType.SetDocSearchResultsDefaultWidth;
  payload: {
    width: number;
  };
}

interface CacheDocSearchResultsWidth {
  type: ReducerActionType.CacheDocSearchResultsWidth;
  payload: {
    width: number;
  };
}

interface SearchInDocPage {
  type: ReducerActionType.SearchInDocPage;
}

interface CancelSearchInDocPage {
  type: ReducerActionType.CancelSearchInDocPage;
}

interface OpenDocsFilterModal {
  type: ReducerActionType.OpenDocsFilterModal;
}

interface CloseDocsFilterModal {
  type: ReducerActionType.CloseDocsFilterModal;
}

interface OpenSignInModal {
  type: ReducerActionType.OpenSignInModal;
}

interface CloseSignInModal {
  type: ReducerActionType.CloseSignInModal;
}

interface FetchDocSourcesSuccess {
  type: ReducerActionType.FetchDocSourcesSuccess;
  payload: { docSources: DocSource[] };
}

interface FetchDocSourcesFail {
  type: ReducerActionType.FetchDocSourcesFail;
  payload: { errorMessage: string };
}

interface IncludeDocSourceInSearch {
  type: ReducerActionType.IncludeDocSourceInSearch;
  payload: { docSource: DocSource };
}

interface RemoveDocSourceFromSearch {
  type: ReducerActionType.RemoveDocSourceFromSearch;
  payload: { docSource: DocSource };
}

interface SetIsLoadingCachedData {
  type: ReducerActionType.SetIsLoadingCachedData;
  payload: { isLoadingCachedData: boolean };
}

type ReducerAction = SetSearchQuery
  | SetSearchFilter
  | CacheScrollTopPosition
  | ClearResults
  | StartSearching
  | SearchingSuccess
  | SearchingFail
  | FocusResultItem
  | OpenModal
  | CloseModal
  | SetDocSearchResultsDefaultWidth
  | CacheDocSearchResultsWidth
  | SearchInDocPage
  | CancelSearchInDocPage
  | OpenDocsFilterModal
  | CloseDocsFilterModal
  | OpenSignInModal
  | CloseSignInModal
  | FetchDocSourcesSuccess
  | FetchDocSourcesFail
  | IncludeDocSourceInSearch
  | RemoveDocSourceFromSearch
  | SetIsLoadingCachedData;

interface State {
  search: {
    query: string;
    lastSearchedQuery: string;
    filter: ResultsFilter;
  };
  results: SearchResults;
  modalItem: SearchResultItem | undefined;
  errorMessage: string;
  layout: {
    docSearchResultsDefaultWidth: number;
  }
  isSearchingInDocPage: boolean;
  isDocsFilterModalOpened: boolean;
  docSources: DocSource[];
  isLoadingCachedData: boolean;
  isSignInModalOpened: boolean;
}

const initialState: State = {
  search: {
    query: '',
    lastSearchedQuery: '',
    // TODO: Since we load the last saved search query we should also load
    // the last saved results filter.
    filter: ResultsFilter.StackOverflow,
  },
  results: {
    [ResultsFilter.StackOverflow]: {
      items: [],
      isLoading: true,
      scrollTopPosition: 0,
      focusedIdx: {
        idx: 0,
        focusState: FocusState.NoScroll,
      },
    },
    [ResultsFilter.Docs]: {
      items: [],
      isLoading: true,
      scrollTopPosition: 0,
      focusedIdx: {
        idx: 0,
        focusState: FocusState.NoScroll,
      },
    },
  },
  modalItem: undefined,
  errorMessage: '',
  layout: {
    docSearchResultsDefaultWidth: 200,
  },
  isSearchingInDocPage: false,
  isDocsFilterModalOpened: false,
  docSources: [],
  isLoadingCachedData: true,
  isSignInModalOpened: false,
}

function stateReducer(state: State, reducerAction: ReducerAction): State {
  if (isDev) {
    console.log(ReducerActionType[reducerAction.type], (reducerAction as any).payload || {}, state);
  }

  switch (reducerAction.type) {
    case ReducerActionType.SetSearchQuery: {
      const { query } = reducerAction.payload;
      return {
        ...state,
        search: {
          ...state.search,
          query,
        },
      };
    }
    case ReducerActionType.ClearResults: {
      const emptyResults = initialState.results;
      // Initial state has the 'isLoading' field set to 'true'
      // for each result filter. We want to set it to 'false'.
      Object.keys(emptyResults).forEach(k => {
        (emptyResults[k as ResultsFilter] as any).isLoading = false;
      });

      return {
        ...state,
        search: {
          ...state.search,
          query: '',
          lastSearchedQuery: '',
        },
        results: {
          ...emptyResults,
        },
      };
    }
    case ReducerActionType.CacheScrollTopPosition: {
      const { filter, scrollTopPosition } = reducerAction.payload;
      return {
        ...state,
        results: {
          ...state.results,
          [filter]: {
            ...state.results[filter],
            scrollTopPosition,
          },
        },
      };
    }
    case ReducerActionType.SetSearchFilter: {
      const { filter } = reducerAction.payload;
      return {
        ...state,
        search: {
          ...state.search,
          filter,
        },
        // TODO: https://github.com/DevbookHQ/devbook/issues/7
        /*
        results: {
          ...state.results,
          [filter]: {
            ...state.results[filter],
            focusedIdx: {
              ...state.results[filter].focusedIdx,
              // We want to disable automatic scrolling to the focused
              // element. When a user is changing filters we should
              // respect the cached scroll position instead. This position
              // might be different then the position of a focused element.
              state: FocusState.NoScroll,
            },
          },
        },
        */
      };
    }
    case ReducerActionType.StartSearching: {
      const { filter } = reducerAction.payload;
      return {
        ...state,
        results: {
          ...state.results,
          [filter]: {
            ...state.results[filter],
            items: [],
            isLoading: true,
          },
        },
      };
    }
    case ReducerActionType.SearchingSuccess: {
      const { filter, items } = reducerAction.payload;
      return {
        ...state,
        search: {
          ...state.search,
          lastSearchedQuery: state.search.query,
        },
        results: {
          ...state.results,
          [filter]: {
            ...state.results[filter],
            isLoading: false,
            items,
            focusedIdx: {
              ...state.results[filter].focusedIdx,
              idx: 0,
              state: FocusState.NoScroll,
            },
          },
        },
      };
    }
    case ReducerActionType.SearchingFail: {
      const { filter, errorMessage } = reducerAction.payload;
      return {
        ...state,
        errorMessage,
        results: {
          ...state.results,
          [filter]: {
            ...state.results[filter],
            isLoading: false,
            items: [],
          },
        },
      };
    }
    case ReducerActionType.FocusResultItem: {
      const { filter, idx, focusState } = reducerAction.payload;
      return {
        ...state,
        results: {
          ...state.results,
          [filter]: {
            ...state.results[filter],
            focusedIdx: {
              ...state.results[filter].focusedIdx,
              idx,
              focusState,
            },
          },
        },
      };
    }
    case ReducerActionType.OpenModal: {
      const { item } = reducerAction.payload;
      return {
        ...state,
        modalItem: item,
      };
    }
    case ReducerActionType.CloseModal: {
      return {
        ...state,
        modalItem: undefined,
      };
    }
    case ReducerActionType.SetDocSearchResultsDefaultWidth: {
      const { width } = reducerAction.payload;
      return {
        ...state,
        layout: {
          ...state.layout,
          docSearchResultsDefaultWidth: width,
        },
      };
    }
    case ReducerActionType.CacheDocSearchResultsWidth: {
      // TODO: Should this be a reducer action?
      // It feels wrong to not do anything with the state
      // and just return it as it is.
      const { width } = reducerAction.payload;
      saveDocSearchResultsDefaultWidth(width);
      return { ...state };
    }
    case ReducerActionType.SearchInDocPage: {
      return {
        ...state,
        isSearchingInDocPage: true,
      };
    }
    case ReducerActionType.CancelSearchInDocPage: {
      return {
        ...state,
        isSearchingInDocPage: false,
      };
    }
    case ReducerActionType.OpenDocsFilterModal: {
      return {
        ...state,
        isDocsFilterModalOpened: true,
      };
    }
    case ReducerActionType.CloseDocsFilterModal: {
      return {
        ...state,
        isDocsFilterModalOpened: false,
      };
    }
    case ReducerActionType.OpenSignInModal: {
      return {
        ...state,
        isSignInModalOpened: true,
      };
    }
    case ReducerActionType.CloseSignInModal: {
      return {
        ...state,
        isSignInModalOpened: false,
      };
    }
    case ReducerActionType.FetchDocSourcesSuccess: {
      const { docSources } = reducerAction.payload;
      return {
        ...state,
        docSources,
      };
    }
    case ReducerActionType.FetchDocSourcesFail: {
      const { errorMessage } = reducerAction.payload;
      return {
        ...state,
        errorMessage,
      };
    }
    case ReducerActionType.IncludeDocSourceInSearch: {
      const { docSource } = reducerAction.payload;
      return {
        ...state,
        docSources: state.docSources.map(ds => ds.slug === docSource.slug ? { ...ds, isIncludedInSearch: true } : ds),
      };
    }
    case ReducerActionType.RemoveDocSourceFromSearch: {
      const { docSource } = reducerAction.payload;
      return {
        ...state,
        docSources: state.docSources.map(ds => ds.slug === docSource.slug ? { ...ds, isIncludedInSearch: false } : ds),
      };
    }
    case ReducerActionType.SetIsLoadingCachedData: {
      const { isLoadingCachedData } = reducerAction.payload;
      return {
        ...state,
        isLoadingCachedData,
      };
    }
    default:
      return state;
  }
}

function Home() {
  const authInfo = useContext(AuthContext);

  // Extensions
  const extensionManager = useContext(ExtensionsContext);

  const stackoverflowExtension = extensionManager?.extensions.stackoverflow;
  const docsExtension = extensionManager?.extensions.docs;

  // Types of the search results and docSources are for now in the Docs and StackOverflow subcomponents, 
  // because with the change to the unified search the types will be changed and unified as well,
  // therefore we don't want to devise a system for handling extension specific search result types now.
  const searchStackOverflow = useCallback(async (query: string) => {
    if (stackoverflowExtension?.isReady) {
      return (await stackoverflowExtension.search({ query })).results as unknown as StackOverflowResult[];
    }
    return [];
  }, [extensionManager]);

  const fetchDocSources = useCallback(async () => {
    if (docsExtension?.isReady) {
      return (await docsExtension.getSources()) as unknown as DocSource[];
    }
    return [];
  }, [extensionManager]);

  const searchDocumentations = useCallback(async (query: string, sources: DocSource[]) => {
    if (docsExtension?.isReady) {
      return (await docsExtension.search({ query, sources })) as unknown as DocResult[];
    }
    return [];
  }, [extensionManager]);


  const isUserLoading =
    authInfo.state === AuthState.LookingForStoredUser ||
    authInfo.state === AuthState.SigningOutUser ||
    authInfo.state === AuthState.SigningInUser;

  const isUserSignedInWithOrWithoutMetadata = authInfo.state === AuthState.UserAndMetadataLoaded;

  const docPageSearchInputRef = useRef<HTMLInputElement>(null);
  const [state, dispatch] = useReducer(stateReducer, initialState);

  const debouncedQuery = useDebounce(state.search.query.trim(), 400);
  const debouncedLastSearchedQuery = useDebounce(state.search.lastSearchedQuery.trim(), 400);

  const activeFilter = useMemo(() => state.search.filter, [state.search.filter]);

  const activeFocusedIdx = useMemo(() => {
    return state.results[activeFilter].focusedIdx;
  }, [state.results, activeFilter]);

  const activeFocusedItem = useMemo(() => {
    return state.results[activeFilter].items[activeFocusedIdx.idx];
  }, [state.results, activeFilter, activeFocusedIdx]);

  const hasActiveFilterEmptyResults = useMemo(() => {
    return state.results[activeFilter].items.length === 0;
  }, [state.results, activeFilter]);

  const isActiveFilterLoading = useMemo(() => {
    return state.results[activeFilter].isLoading;
  }, [state.results, activeFilter]);

  const isAnyDocSourceIncluded = useMemo(() => {
    return state.docSources.findIndex(ds => ds.isIncludedInSearch) !== -1;
  }, [state.docSources]);

  // Dispatch helpers
  const setSearchQuery = useCallback((query: string) => {
    dispatch({
      type: ReducerActionType.SetSearchQuery,
      payload: { query },
    });
  }, []);

  const cacheScrollTopPosition = useCallback((filter: ResultsFilter, scrollTopPosition: number) => {
    dispatch({
      type: ReducerActionType.CacheScrollTopPosition,
      payload: { filter, scrollTopPosition },
    });
  }, []);

  const clearResults = useCallback(() => {
    dispatch({
      type: ReducerActionType.ClearResults,
    });
  }, []);

  const startSearching = useCallback((filter: ResultsFilter) => {
    dispatch({
      type: ReducerActionType.StartSearching,
      payload: { filter },
    });
  }, []);

  const searchingSuccess = useCallback((filter: ResultsFilter, items: SearchResultItems) => {
    dispatch({
      type: ReducerActionType.SearchingSuccess,
      payload: { filter, items },
    });
  }, []);

  const searchingFail = useCallback((filter: ResultsFilter, errorMessage: string) => {
    dispatch({
      type: ReducerActionType.SearchingFail,
      payload: { filter, errorMessage },
    });
  }, []);

  const focusResultItem = useCallback((filter: ResultsFilter, idx: number, focusState: FocusState) => {
    dispatch({
      type: ReducerActionType.FocusResultItem,
      payload: { filter, idx, focusState },
    });
  }, []);

  const setSearchFilter = useCallback((filter: ResultsFilter) => {
    // TODO: Save the scroll bar's position and load it later.
    // https://github.com/DevbookHQ/devbook/issues/7
    /*
    if (searchResultsWrapperEl?.current) {
      // Cache the scroll bar position for the current active filter.
      const currentScrollTop = searchResultsWrapperEl.current.scrollTop;
      console.log('CURRENT', currentScrollTop);
      cacheScrollTopPosition(state.search.filter, currentScrollTop);

      // Set the scroll bar position for the filter that a user wants
      // to set as an active.
      const newScrollTop = state.results[filter].scrollTopPosition;
      searchResultsWrapperEl.current.scrollTo(0, newScrollTop);
    }
    */

    dispatch({
      type: ReducerActionType.SetSearchFilter,
      payload: { filter },
    });

    // Temporary solution that sets scrollbar's position to the currently
    // focused item for the given filter.
    const idx = state.results[filter].focusedIdx.idx;
    focusResultItem(filter, idx, FocusState.WithScroll);

    cancelSearchInDocPage();
  }, [state.results, focusResultItem]);

  const openModal = useCallback((item: SearchResultItem) => {
    let url = '';
    // TODO: This isn't a very good differentiation.
    // Can we do it better in a more TypeScript way?
    if ((item as StackOverflowResult).question) {
      // Item is StackOverflowResult.
      url = (item as StackOverflowResult).question.link;
    }
    trackModalOpened({
      activeFilter: activeFilter.toString(),
      url,
    });
    dispatch({
      type: ReducerActionType.OpenModal,
      payload: { item },
    });
  }, [activeFilter]);

  const closeModal = useCallback(() => {
    dispatch({
      type: ReducerActionType.CloseModal,
    });
  }, []);

  const setDocSearchResultsDefaultWidth = useCallback((width: number) => {
    dispatch({
      type: ReducerActionType.SetDocSearchResultsDefaultWidth,
      payload: { width },
    });
  }, []);

  const cacheDocSearchResultsWidth = useCallback((width: number) => {
    dispatch({
      type: ReducerActionType.CacheDocSearchResultsWidth,
      payload: { width },
    });
  }, []);

  const searchInDocPage = useCallback(() => {
    dispatch({
      type: ReducerActionType.SearchInDocPage,
    });
  }, []);

  const cancelSearchInDocPage = useCallback(() => {
    dispatch({
      type: ReducerActionType.CancelSearchInDocPage,
    });
  }, []);

  const openDocsFilterModal = useCallback(() => {
    dispatch({
      type: ReducerActionType.OpenDocsFilterModal,
    });
  }, []);

  const closeDocsFilterModal = useCallback(() => {
    dispatch({
      type: ReducerActionType.CloseDocsFilterModal,
    });
  }, []);

  const openSignInModal = useCallback(() => {
    trackSignInModalOpened();
    dispatch({
      type: ReducerActionType.OpenSignInModal,
    });
  }, []);

  const closeSignInModal = useCallback(() => {
    trackSignInModalClosed();
    dispatch({
      type: ReducerActionType.CloseSignInModal,
    });
  }, []);

  const fetchDocSourcesSuccess = useCallback((docSources: DocSource[]) => {
    dispatch({
      type: ReducerActionType.FetchDocSourcesSuccess,
      payload: { docSources },
    });
  }, []);

  const fetchDocSourcesFail = useCallback((errorMessage: string) => {
    dispatch({
      type: ReducerActionType.FetchDocSourcesFail,
      payload: { errorMessage },
    });
  }, []);

  const includeDocSourceInSearch = useCallback((docSource: DocSource) => {
    dispatch({
      type: ReducerActionType.IncludeDocSourceInSearch,
      payload: { docSource },
    });
  }, []);

  const removeDocSourceFromSearch = useCallback((docSource: DocSource) => {
    dispatch({
      type: ReducerActionType.RemoveDocSourceFromSearch,
      payload: { docSource },
    });
  }, []);

  const setIsLoadingCachedData = useCallback((isLoadingCachedData: boolean) => {
    dispatch({
      type: ReducerActionType.SetIsLoadingCachedData,
      payload: { isLoadingCachedData },
    });
  }, []);
  /////////

  const openFocusedSOItemInBrowser = useCallback(() => {
    const idx = state.results[ResultsFilter.StackOverflow].focusedIdx.idx;
    const item = state.results[ResultsFilter.StackOverflow].items[idx] as StackOverflowResult;
    if (item) openLink(item.question.link);
  }, [state.results]);

  async function searchSO(query: string) {
    try {
      startSearching(ResultsFilter.StackOverflow);
      const results = await searchStackOverflow(query);
      searchingSuccess(ResultsFilter.StackOverflow, results);
    } catch (error) {
      searchingFail(ResultsFilter.StackOverflow, error.message);
    }
  }

  async function searchDocs(query: string, docSources: DocSource[]) {
    // User has all doc sources unincluded.
    if (docSources.findIndex(ds => ds.isIncludedInSearch) === -1) {
      searchingSuccess(ResultsFilter.Docs, []);
      return;
    }

    try {
      startSearching(ResultsFilter.Docs);
      const results = await searchDocumentations(query, docSources.filter(ds => ds.isIncludedInSearch));
      searchingSuccess(ResultsFilter.Docs, results);
    } catch (error) {
      searchingFail(ResultsFilter.Docs, error.message);
    }
  }

  async function searchAll(query: string, docSources: DocSource[]) {
    await searchSO(query);
    await searchDocs(query, docSources);
  }

  function handleSearchInputChange(value: string) {
    // User explicitely deleted the query. We should remove all results.
    if (!value) {
      clearResults();
      return;
    }
    setSearchQuery(value);
  }

  function handleDocSearchResultsResizeStop(e: any, dir: any, elRef: HTMLElement) {
    cacheDocSearchResultsWidth(elRef.clientWidth);
  }

  function handleDocSourceClick(docSource: DocSource) {
    if (docSource.isIncludedInSearch) removeDocSourceFromSearch(docSource);
    else includeDocSourceInSearch(docSource);
  }

  /* HOTKEYS */
  // 'cmd+1/alt+1' hotkey - change search filter to SO questions.
  useHotkeys(electron.remote.process.platform === 'darwin' ? 'Cmd+1' : 'alt+1', () => {
    if (state.modalItem) return;
    setSearchFilter(ResultsFilter.StackOverflow);
    trackShortcut({ action: 'Change filter to SO' });
  }, { filter: () => true }, [state.modalItem, setSearchFilter]);

  // 'cmd+2/alt+2' hotkey - change search filter to Docs search.
  useHotkeys(electron.remote.process.platform === 'darwin' ? 'Cmd+2' : 'alt+2', () => {
    if (state.modalItem) return;
    setSearchFilter(ResultsFilter.Docs);
    trackShortcut({ action: 'Change filter to Docs' });
  }, { filter: () => true }, [state.modalItem, setSearchFilter]);

  // 'shift + up arrow' - navigate docs search results.
  useHotkeys('shift+up', () => {
    const idx = state.results[activeFilter].focusedIdx.idx;
    if (idx > 0) {
      focusResultItem(activeFilter, idx - 1, FocusState.WithScroll);
    }
  }, { filter: () => true }, [state.results, activeFilter, state.modalItem]);

  // 'shift + down arrow' - navigate docs search results.
  useHotkeys('shift+down', () => {
    const idx = state.results[activeFilter].focusedIdx.idx;
    if (idx < state.results[activeFilter].items.length - 1) {
      focusResultItem(activeFilter, idx + 1, FocusState.WithScroll);
    }
  }, { filter: () => true }, [state.results, activeFilter, state.modalItem]);

  // 'up arrow' hotkey - navigation.
  useHotkeys('up', () => {
    if (state.modalItem || state.isDocsFilterModalOpened) return;
    // The docs search filter uses 'cmd + arrow' for the search navigation.
    if (activeFilter === ResultsFilter.Docs) return;

    const idx = state.results[activeFilter].focusedIdx.idx;
    if (idx > 0) {
      focusResultItem(activeFilter, idx - 1, FocusState.WithScroll);
    }
  }, { filter: () => true }, [state.results, activeFilter, state.modalItem]);

  // 'down arrow' hotkey - navigation.
  useHotkeys('down', () => {
    if (state.modalItem || state.isDocsFilterModalOpened) return;
    // The docs search filter uses 'cmd + arrow' for the search navigation.
    if (activeFilter === ResultsFilter.Docs) return;

    const idx = state.results[activeFilter].focusedIdx.idx;
    if (idx < state.results[activeFilter].items.length - 1) {
      focusResultItem(activeFilter, idx + 1, FocusState.WithScroll);
    }
  }, { filter: () => true }, [state.results, activeFilter, state.modalItem]);

  // 'enter' hotkey - open the focused result in a modal.
  useHotkeys('enter', () => {
    if (activeFilter === ResultsFilter.Docs) return;
    openModal(state.results[activeFilter].items[activeFocusedIdx.idx]);
    trackShortcut({ action: 'Open modal' });
  }, [state.results, activeFilter, activeFocusedIdx]);

  // 'esc' hotkey - close modal or hide main window.
  useHotkeys('esc', () => {
    if (state.modalItem) {
      closeModal();
      trackShortcut({ action: 'Close modal' });
      return;
    }

    if (state.isSearchingInDocPage) {
      cancelSearchInDocPage();
      trackShortcut({ action: 'Cancel search in doc page' });
      return;
    }

    if (state.isDocsFilterModalOpened) {
      closeDocsFilterModal();
      trackShortcut({ action: 'Close docs filter modal' });
      return;
    }

    if (state.isSignInModalOpened) {
      closeSignInModal();
      return;
    }

    hideMainWindow();
    trackShortcut({ action: 'Hide main window' });
  }, [
    state.modalItem,
    state.isSearchingInDocPage,
    state.isDocsFilterModalOpened,
    state.isSignInModalOpened,
  ]);

  // 'cmd+o' hotkey - open the focused result in a browser.
  useHotkeys(electron.remote.process.platform === 'darwin' ? 'Cmd+o' : 'alt+o', () => {
    switch (activeFilter) {
      case ResultsFilter.StackOverflow:
        openFocusedSOItemInBrowser();
        trackShortcut({ action: 'Open SO item in browser' });
        break;
    }
  }, [activeFilter, openFocusedSOItemInBrowser]);

  // 'cmd+f' hotkey - search in a doc page.
  useHotkeys(electron.remote.process.platform === 'darwin' ? 'Cmd+f' : 'ctrl+f', () => {
    if (activeFilter !== ResultsFilter.Docs) return;
    if (state.isDocsFilterModalOpened) return;

    searchInDocPage();
    docPageSearchInputRef?.current?.focus();
    trackShortcut({ action: 'Search in doc page' });
  }, [activeFilter, searchInDocPage, state.isDocsFilterModalOpened]);

  // 'cmd+shift+f' hotkey - open docs filter modal.
  useHotkeys(electron.remote.process.platform === 'darwin' ? 'Cmd+shift+f' : 'ctrl+shift+f', () => {
    // A search filter different from Docs is active.
    if (activeFilter !== ResultsFilter.Docs) return;
    // Docs search filter is active but user isn't signed in.
    if (activeFilter === ResultsFilter.Docs && !isUserSignedInWithOrWithoutMetadata) return;

    if (state.isDocsFilterModalOpened) closeDocsFilterModal();
    else openDocsFilterModal();
    trackShortcut({ action: 'Filter docs' });
  }, [
    activeFilter,
    state.isDocsFilterModalOpened,
    isUserSignedInWithOrWithoutMetadata,
  ]);
  /* //////////////////// */

  useIPCRenderer(IPCMessage.OpenSignInModal, () => {
    openSignInModal();
  });

  // Run only on the initial render.
  // Get the cached search query and search filter.
  useEffect(() => {
    async function loadCachedData() {
      const width = await getDocSearchResultsDefaultWidth();
      setDocSearchResultsDefaultWidth(width);

      const filter = await getSavedSearchFilter();
      setSearchFilter(filter);

      const lastQuery = await getSavedSearchQuery();
      if (!lastQuery) {
        // We do this so the 'isLoading' field is set to false
        // for each search filter.
        searchingSuccess(ResultsFilter.StackOverflow, []);
        searchingSuccess(ResultsFilter.Docs, []);
      } else {
        setSearchQuery(lastQuery);
      }

      try {
        // We merge the cached doc sources and the fetched ones
        // so we always have the most up to date doc sources
        // and at the same time we respect user's selection.
        const cachedDocSources = await getCachedDocSources();
        const allDocSources = await fetchDocSources();
        const mergedDocSources = allDocSources.map(ds => {
          const cached = cachedDocSources.find(cds => cds.slug === ds.slug);
          if (cached) return { ...ds, isIncludedInSearch: cached.isIncludedInSearch };
          return ds;
        });
        fetchDocSourcesSuccess(mergedDocSources);
      } catch (err) {
        fetchDocSourcesFail(err);
      }

      setIsLoadingCachedData(false);
    }
    loadCachedData();
    // We want to run this only during the first render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    extensionManager.extensions['stackoverflow']?.isReady,
    extensionManager.extensions['docs']?.isReady,
  ]);

  // Log error messages.
  useEffect(() => {
    if (!state.errorMessage) return;
    console.error(state.errorMessage);
  }, [state.errorMessage]);

  // Search when the debounced query changes.
  useEffect(() => {
    if (!debouncedQuery || debouncedQuery === debouncedLastSearchedQuery) return;

    searchAll(
      debouncedQuery,
      state.docSources,
    );
    trackSearch({
      activeFilter: activeFilter.toString(),
    });
    // TODO WARNING - Don't include 'searchAll' in the deps array
    // otherwise an infinite cycle will start. Why?
    // Answer - `searchAll` function is defined in the body of the component
    // and with each rerender it is defined again, thus having a new identity and triggering deps change.
  }, [
    debouncedQuery,
    debouncedLastSearchedQuery,
    activeFilter,
    state.docSources,
  ]);

  // Cache the debounced query.
  useEffect(() => {
    if (debouncedQuery !== debouncedLastSearchedQuery) {
      saveSearchQuery(debouncedQuery);
    }
  }, [debouncedQuery, debouncedLastSearchedQuery]);

  // Cache the currently active filter.
  useEffect(() => {
    if (state.isLoadingCachedData) return;
    saveSearchFilter(activeFilter);
  }, [activeFilter, state.isLoadingCachedData]);

  // Cache the doc sources.
  useEffect(() => {
    if (state.docSources.length === 0) return;
    saveDocSources(state.docSources);

    if (debouncedQuery) {
      searchDocs(debouncedQuery, state.docSources);
    }
    // NOTE: We don't want to run this useEffect every time
    // the search query changes. We just want to refresh
    // the docs results when user changes what doc sources
    // they want to have active.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.docSources]);

  useEffect(() => {
    refreshAuth();
  }, []);

  return (
    <>
      {state.modalItem && activeFilter === ResultsFilter.StackOverflow &&
        <StackOverflowModal
          soResult={state.modalItem as StackOverflowResult}
          onCloseRequest={closeModal}
        />
      }

      {state.isDocsFilterModalOpened && activeFilter === ResultsFilter.Docs &&
        <DocsFilterModal
          docSources={state.docSources}
          onDocSourceClick={handleDocSourceClick}
          onCloseRequest={closeDocsFilterModal}
        />
      }

      {state.isSignInModalOpened &&
        <SignInModal
          onCloseRequest={closeSignInModal}
        />
      }

      <Container>
        <SearchHeaderPanel
          value={state.search.query}
          placeholder="Search StackOverflow or docs"
          onDebouncedChange={handleSearchInputChange}
          activeFilter={activeFilter}
          onFilterSelect={f => setSearchFilter(f)}
          isLoading={isActiveFilterLoading}
          isModalOpened={!!state.modalItem}
          isSignInModalOpened={state.isSignInModalOpened}
          isDocsFilterModalOpened={state.isDocsFilterModalOpened}
        />

        {!state.search.query
          && !isActiveFilterLoading
          &&
          <>
            {/*
              We can show the text right away for SO because
              we don't have to wait until a user account is loaded.
            */}

            {activeFilter === ResultsFilter.Docs
              && (authInfo.state === AuthState.UserAndMetadataLoaded)
              &&
              <InfoMessage>Type your search query</InfoMessage>
            }

            {activeFilter !== ResultsFilter.Docs
              &&
              <InfoMessage>Type your search query</InfoMessage>
            }
          </>
        }

        {state.search.query
          && hasActiveFilterEmptyResults
          && !isActiveFilterLoading
          // Don't show "Nothing found" when user is searching docs but disabled
          // all doc sources.
          && !(activeFilter === ResultsFilter.Docs && (!isAnyDocSourceIncluded || !isUserSignedInWithOrWithoutMetadata))
          &&
          <InfoMessage>Nothing found</InfoMessage>
        }

        {activeFilter === ResultsFilter.Docs
          && authInfo.state === AuthState.LookingForStoredUser
          &&
          <DocsLoader />
        }

        {activeFilter === ResultsFilter.Docs
          && authInfo.state === AuthState.SigningInUser
          &&
          <>
            <DocsLoader />
            <InfoMessage>
              You're being signed in. Please check your email.
              </InfoMessage>
            <SignInAgainButton
              onClick={openSignInModal}
            >
              Sign in with a different email
              </SignInAgainButton>
          </>
        }

        {activeFilter === ResultsFilter.Docs
          && !isUserLoading
          && !isUserSignedInWithOrWithoutMetadata
          &&
          <>
            <InfoMessage>You need to sign in to search documentations</InfoMessage>
            <SignInButton
              onClick={openSignInModal}
            >
              Sign in to Devbook
            </SignInButton>
          </>
        }

        {state.search.query
          && activeFilter === ResultsFilter.Docs
          && isUserSignedInWithOrWithoutMetadata
          && !isAnyDocSourceIncluded
          && !isActiveFilterLoading
          &&
          <>
            <InfoMessage>No documentation is enabled</InfoMessage>
            <EnableDocSourcesButton
              onClick={openDocsFilterModal}
            >
              Enable documentations
            </EnableDocSourcesButton>
          </>
        }

        {state.search.query
          && !hasActiveFilterEmptyResults
          && !isActiveFilterLoading
          &&
          <>
            {activeFilter === ResultsFilter.StackOverflow &&
              <SearchResultsWrapper>
                {activeFilter === ResultsFilter.StackOverflow
                  && (state.results[ResultsFilter.StackOverflow].items as StackOverflowResult[]).map((sor, idx) => (
                    <StackOverflowItem
                      key={idx}
                      soResult={sor}
                      focusState={activeFocusedIdx.idx === idx ? activeFocusedIdx.focusState : FocusState.None}
                      onHeaderClick={() => focusResultItem(ResultsFilter.StackOverflow, idx, FocusState.NoScroll)}
                      onTitleClick={() => openModal(sor)}
                    />
                  ))}
              </SearchResultsWrapper>
            }

            {activeFilter === ResultsFilter.Docs
              && isAnyDocSourceIncluded
              && isUserSignedInWithOrWithoutMetadata
              &&
              <DocsWrapper>
                <Resizable
                  defaultSize={{
                    width: state.layout.docSearchResultsDefaultWidth,
                    height: "100%"
                  }}
                  maxWidth="50%"
                  minWidth="200"
                  enable={{ right: true }}
                  onResizeStop={(e, dir, ref) => handleDocSearchResultsResizeStop(e, dir, ref)}
                >
                  <DocsResultsWrapper>
                    <EnabledDocsText
                      onClick={openDocsFilterModal}
                    >
                      {state.docSources.filter(ds => ds.isIncludedInSearch).length === state.docSources.length
                        ? 'Searching in all documentations'
                        : `Searching in ${state.docSources.filter(ds => ds.isIncludedInSearch).length} out of ${state.docSources.length} documentations`
                      }
                    </EnabledDocsText>
                    <DocSearchResults>
                      {(state.results[ResultsFilter.Docs].items as DocResult[]).map((d, idx) => (
                        <DocSearchResultItem
                          key={idx}
                          docResult={d}
                          focusState={activeFocusedIdx.idx === idx ? activeFocusedIdx.focusState : FocusState.None}
                          onClick={() => focusResultItem(ResultsFilter.Docs, idx, FocusState.NoScroll)}
                        />
                      ))}
                    </DocSearchResults>
                  </DocsResultsWrapper>
                </Resizable>
                <DocPage
                  isDocsFilterModalOpened={state.isDocsFilterModalOpened}
                  isSearchingInDocPage={state.isSearchingInDocPage}
                  pageURL={(activeFocusedItem as DocResult).page.pageURL}
                  html={(activeFocusedItem as DocResult).page.html}
                  hasHTMLExtension={(activeFocusedItem as DocResult).page.hasHTMLExtension}
                  searchInputRef={docPageSearchInputRef}
                />
              </DocsWrapper>
            }

            {/* StackOverflow search results + StackOverflow modal hotkeys */}
            {!state.modalItem && activeFilter === ResultsFilter.StackOverflow &&
              <StackOverflowSearchHotkeysPanel
                onOpenClick={() => openModal(activeFocusedItem)}
                onOpenInBrowserClick={openFocusedSOItemInBrowser}
              />
            }
            {state.modalItem && activeFilter === ResultsFilter.StackOverflow &&
              <StackOverflowModalHotkeysPanel
                onOpenInBrowserClick={openFocusedSOItemInBrowser}
                onCloseClick={closeModal}
              />
            }
            {/*-------------------------------------------------------------*/}

            {/* Docs search results */}
            {!state.modalItem
              && activeFilter === ResultsFilter.Docs
              && isUserSignedInWithOrWithoutMetadata
              && isAnyDocSourceIncluded
              &&
              <DocsSearchHotkeysPanel
                isDocsFilterModalOpened={state.isDocsFilterModalOpened}
                isSearchingInDocPage={state.isSearchingInDocPage}
                onOpenFilterDocsClick={openDocsFilterModal}
                onCloseFilterDocsClick={closeDocsFilterModal}
                onSearchInDocPageClick={searchInDocPage}
                onCancelSearchInDocPageClick={cancelSearchInDocPage}
              />
            }
            {/*-------------------------------------------------------------*/}
          </>
        }
      </Container>
    </>
  );
}

export default Home;
