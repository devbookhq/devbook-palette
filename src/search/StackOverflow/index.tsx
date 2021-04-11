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
import useHotkey from 'hooks/useHotkey';

interface StackOverflowProps {
  results: StackOverflowResult[];
}

function StackOverflow({ results }: StackOverflowProps) {
  const uiStore = useUIStore();

  const [selectedIdx, setSelectedIdx] = useState(0);
  const searchResultsWrapperRef = useRef<HTMLDivElement>(null);

  const toggleModal = useCallback(() => {
    uiStore.toggleModal();
  }, []);

  const resultsUpHandler = useCallback(() => {
    setSelectedIdx(c => c > 0 ? c - 1 : c);
    searchResultsWrapperRef?.current?.scrollIntoView({ block: 'start' });
  }, [searchResultsWrapperRef]);

  const resultsDownHandler = useCallback(() => {
    setSelectedIdx(c => c < results.length - 1 ? c + 1 : c);
    searchResultsWrapperRef?.current?.scrollIntoView({ block: 'start' });
  }, [results, searchResultsWrapperRef]);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.StackOverflowResultsUp, resultsUpHandler);
  }, [
    resultsUpHandler,
  ]);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.StackOverflowResultsDown, resultsDownHandler);
  }, [
    resultsDownHandler,
  ]);

  useHotkey(uiStore.hotkeys[HotkeyAction.StackOverflowOpenModal], toggleModal);

  const openModalForResult = useCallback((i: number) => {
    setSelectedIdx(i);
    toggleModal();
  }, [toggleModal]);

  return (
    <>
      {results.length !== 0 &&
        <>
          {uiStore.isModalOpened &&
            <StackOverflowModal
              toggleModal={toggleModal}
              result={results[selectedIdx]}
            />
          }
          <StackOverflowResults
            containerRef={searchResultsWrapperRef}
            results={results}
            openModalForResult={openModalForResult}
            selectedIdx={selectedIdx}
          />
        </>
      }
    </>
  );
}

export default observer(StackOverflow);
