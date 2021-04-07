import styled from 'styled-components'
import { observer } from 'mobx-react-lite';
import { useRef } from 'react';

import { SearchSource } from 'services/search.service';
import { useUIStore } from 'ui/ui.store';
import { useSearchStore } from 'Search/search.store';
import StackOverflowResults from './StackOverflowResults';
import StackOverflowModal from './StackOverflowModal';
import InfoMessage from 'components/InfoMessage';
import InfoText from 'components/InfoMessage/InfoText';
import HotkeyText from 'components/HotkeyText';

const InfoTextLeft = styled(InfoText)`
  margin: 0 8px 0 0;
`;
const InfoTextRight = styled(InfoText)`
  margin: 0 0 0 8px;
`;

function StackOverflowSearch() {
  const searchStore = useSearchStore();
  const uiStore = useUIStore();

  const searchResultsWrapperRef = useRef<HTMLDivElement>(null);

  return (
    <>
      {searchStore.results.stackOverflow.length !== 0 &&
        <>
          {/* {uiStore.isModalOpened &&
            <StackOverflowModal
              result={searchStore.getSelectedResult(SearchSource.StackOverflow)}
            />
          } */}
          <StackOverflowResults
            ref={searchResultsWrapperRef}
            results={searchStore.results.stackOverflow}
            selectedIdx={searchStore.selectedResults.stackOverflow}
          />
        </>
      }
      {searchStore.results.stackOverflow.length === 0 &&
        <>
          {searchStore.isQueryDirty &&
            <InfoMessage>
              <InfoTextLeft>
                Type your search query and press
              </InfoTextLeft>
              <HotkeyText hotkey={['Enter']} />
              <InfoTextRight>
                to search
              </InfoTextRight>
            </InfoMessage>
          }
          {!searchStore.isQueryDirty &&
            <InfoMessage>
              <InfoTextLeft>
                Nothing found. Try a different query and then press
              </InfoTextLeft>
              <HotkeyText hotkey={['Enter']} />
              <InfoTextRight>
                .
              </InfoTextRight>
            </InfoMessage>
          }
        </>
      }
    </>
  );
}

export default observer(StackOverflowSearch);
