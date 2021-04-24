import {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import { observer } from 'mobx-react-lite';

import { StackOverflowResult } from 'services/search.service';
import StackOverflowResults from './StackOverflowResults';
import StackOverflowModal from './StackOverflowModal';
import { HotkeyAction, useUIStore } from 'ui/ui.store';
import { ResultSelection } from 'Search/resultSelection';
import { FocusState } from 'Search/focusState';
import ElectronService from 'services/electron.service';

interface StackOverflowProps {
  results: StackOverflowResult[];
}

function StackOverflow({ results }: StackOverflowProps) {
  const uiStore = useUIStore();

  const [selection, setSelection] = useState<ResultSelection>({ idx: 0, focusState: FocusState.WithScroll });
  const searchResultsWrapperRef = useRef<HTMLDivElement>(null);
  const modalResultWrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelection({
      idx: 0,
      focusState: FocusState.WithScroll,
    });
  }, [results]);

  const toggleModal = useCallback(() => {
    uiStore.toggleStackOverflowModal();
  }, [uiStore]);

  const openSelectedResultInBrowser = useCallback(() => {
    ElectronService.openLink(results[selection.idx].question.link);
  }, [selection, results]);

  const resultsUpHandler = useCallback(() => {
    setSelection(s => {
      const idx = s.idx > 0 ? s.idx - 1 : s.idx;
      return {
        idx,
        focusState: FocusState.WithScroll,
      }
    });
    searchResultsWrapperRef?.current?.scrollIntoView({ block: 'start' });
  }, [searchResultsWrapperRef]);

  const resultsDownHandler = useCallback(() => {
    setSelection(s => {
      const idx = s.idx < results.length - 1 ? s.idx + 1 : s.idx;
      return {
        idx,
        focusState: FocusState.WithScroll,
      };
    });
    searchResultsWrapperRef?.current?.scrollIntoView({ block: 'start' });
  }, [results, searchResultsWrapperRef]);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.StackOverflowResultsUp, resultsUpHandler);
  }, [resultsUpHandler, uiStore]);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.StackOverflowResultsDown, resultsDownHandler);
  }, [resultsDownHandler, uiStore]);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.StackOverflowOpenModal, toggleModal);
  }, [toggleModal, uiStore]);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.StackOverflowCloseModal, toggleModal);
  }, [toggleModal, uiStore]);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.StackOverflowOpenInBrowser, openSelectedResultInBrowser);
  }, [openSelectedResultInBrowser, uiStore]);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.StackOverflowModalOpenInBrowser, openSelectedResultInBrowser);
  }, [openSelectedResultInBrowser, uiStore]);

  const openModalForResult = useCallback((idx: number) => {
    setSelection({
      idx,
      focusState: FocusState.NoScroll,
    });
    toggleModal();
  }, [toggleModal]);

  const selectResult = useCallback((idx: number) => {
    setSelection({
      idx,
      focusState: FocusState.NoScroll,
    });
  }, []);

  const scrollUp = useCallback(() => {
    searchResultsWrapperRef?.current?.scrollBy({
      top: -25,
      behavior: 'auto',
    });
  }, [searchResultsWrapperRef]);

  const scrollDown = useCallback(() => {
    searchResultsWrapperRef?.current?.scrollBy({
      top: 25,
      behavior: 'auto'
    });
  }, [searchResultsWrapperRef]);

  const modalScrollUp = useCallback(() => {
    modalResultWrapperRef?.current?.scrollBy({
      top: -25,
      behavior: 'auto',
    });
  }, [modalResultWrapperRef]);

  const modalScrollDown = useCallback(() => {
    modalResultWrapperRef?.current?.scrollBy({
      top: 25,
      behavior: 'auto'
    });
  }, [modalResultWrapperRef]);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.StackOverflowScrollDown, scrollDown);
  }, [scrollDown, uiStore]);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.StackOverflowScrollUp, scrollUp);
  }, [scrollUp, uiStore]);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.StackOverflowModalScrollDown, modalScrollDown);
  }, [modalScrollDown, uiStore]);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.StackOverflowModalScrollUp, modalScrollUp);
  }, [modalScrollUp, uiStore]);

  return (
    <>
      {uiStore.isStackOverflowModalOpened &&
        <StackOverflowModal
          toggleModal={toggleModal}
          result={results[selection.idx]}
          containerRef={modalResultWrapperRef}
        />
      }
      <StackOverflowResults
        containerRef={searchResultsWrapperRef}
        results={results}
        selection={selection}
        openModalForResult={openModalForResult}
        selectResult={selectResult}
      />
    </>
  );
}

export default observer(StackOverflow);
