import React, {
  useState,
  useEffect,
} from 'react';
import styled from 'styled-components';

import { DocSource } from 'search/docs';
import Modal from 'components/Modal';
import { ReactComponent as searchImg } from 'img/search.svg';

const StyledModal = styled(Modal)`
  height: 100%;
  margin: 60px 0 69px;
  min-width: 550px;

  display: flex;
  flex-direction: column;

  overflow: hidden;
  background: #1C1B26;
  border-radius: 5px;
  border: 1px solid #3B3A4A;
`;

const SearchWrapper = styled.div`
  padding: 10px;
  width: 100%;
  background: #25252E;

  display: flex;
  align-items: center;
  border-bottom: 1px solid #3B3A4A;
`;

const SearchImg = styled(searchImg)`
  margin-right: 8px;
  height: auto;
  width: 18px;

  path {
    stroke: #5A5A6F;
  }
`;

const SearchInput = styled.input`
  width: 100%;

  color: #fff;
  font-size: 15px;
  font-weight: 400;
  font-family: 'Poppins';

  background: #25252E;
  border: none;
  outline: none;

  ::placeholder {
    color: #5A5A6F;
  }
`;

const Content = styled.div`
  padding: 10px 0 50px;

  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const DocsListHeader = styled.div`
  width: 100%;
  padding: 0 10px;
  margin-bottom: 10px;

  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const HeaderText = styled.span`
  color: #5A5A6F;
  font-size: 14px;
  font-weight: 500;
`;

const DocsListsWrapper = styled.div`
  height: 100%;
  width: 100%;

  display: flex;
  flex-direction: column;

  overflow: overlay;
`;

const DocsListIncluded = styled.div`
  width: 100%;
  margin-bottom: 20px;

  display: flex;
  flex-direction: column;
`;

const DocsListNotIncluded = styled.div`
  width: 100%;

  display: flex;
  flex-direction: column;
`;

const DocRow = styled.div`
  width: 100%;
  padding: 5px 10px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-bottom: 1px solid #262736;

  :hover {
    background: #2C2F5A;
    cursor: pointer;
  }
`;

const DocName = styled.span`
  color: #fff;
  font-size: 14px;
  font-weight: 500;
`;

const DocToggle = styled.input`
`;


interface DocsFilterModalProps {
  docSources: DocSource[];
  onDocSourceClick: (ds: DocSource) => void;
  onCloseRequest?: () => void;
}

function DocsFilterModal({
  docSources,
  onDocSourceClick,
  onCloseRequest,
}: DocsFilterModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  // const [sortedSources, setSortedSources] = useState<DocSource[]>([]);
  const [includedSources, setIncludedSources] = useState<DocSource[]>([]);
  const [notIncludedSources, setNotIncludedSources] = useState<DocSource[]>([]);

  function escapeRegex(s: string) {
    return s.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
  }

  useEffect(() => {
    // Split doc sources into two arrays - included doc sources and not included ones.
    const sorted = docSources
      .sort((a, b) => (a.isIncludedInSearch === b.isIncludedInSearch) ? 0 : a.isIncludedInSearch ? -1 : 1);
    const firstNotIncluded = sorted.findIndex(ds => !ds.isIncludedInSearch);
    if (firstNotIncluded === -1) {
      setNotIncludedSources(sorted.sort((a, b) => a.name.localeCompare(b.name)));
    } else {
      let includedSlice = sorted.slice(0, firstNotIncluded);
      includedSlice = includedSlice
        .sort((a, b) => a.name.localeCompare(b.name));
      setIncludedSources(includedSlice);

      let notIncludedSlice = sorted.slice(firstNotIncluded);
      notIncludedSlice = notIncludedSlice
        .sort((a, b) => a.name.localeCompare(b.name));
      setNotIncludedSources(notIncludedSlice);
    }
  }, []);

  function handleDocRowClick(docSource: DocSource, includedSlice: boolean) {
    if (includedSlice) {
      setIncludedSources(c =>
        c.map(ds => ds.slug === docSource.slug ? {...ds, isIncludedInSearch: !ds.isIncludedInSearch} : ds)
      );
    } else {
      setNotIncludedSources(c =>
        c.map(ds => ds.slug === docSource.slug ? {...ds, isIncludedInSearch: !ds.isIncludedInSearch} : ds)
      );
    }
    onDocSourceClick(docSource);
  }

  return (
    <StyledModal
      onCloseRequest={onCloseRequest}
    >
      <SearchWrapper>
        <SearchImg/>
        <SearchInput
          autoFocus
          placeholder="Python, JavaScript, Docker, etc"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </SearchWrapper>
      <Content>
        <DocsListHeader>
          <HeaderText>
            NAME
          </HeaderText>
          <HeaderText>
            INCLUDE IN SEARCH
          </HeaderText>
        </DocsListHeader>

        <DocsListsWrapper>
          {includedSources.length > 0 &&
            <DocsListIncluded>
              {includedSources
               .filter(ds => ds.name.toLowerCase().match(new RegExp(escapeRegex(searchQuery))))
               .map((ds, idx) => (
                <DocRow
                  key={idx}
                  onClick={() => handleDocRowClick(ds, true)}
                >
                  <DocName>{ds.name}</DocName>
                  <DocToggle
                    type="checkbox"
                    checked={ds.isIncludedInSearch}
                    onChange={() => {}}
                  />
                </DocRow>
              ))}
            </DocsListIncluded>
          }

          {notIncludedSources.length > 0 &&
            <DocsListNotIncluded>
              {notIncludedSources
               .filter(ds => ds.name.toLowerCase().match(new RegExp(escapeRegex(searchQuery))))
               .map((ds, idx) => (
                <DocRow
                  key={idx}
                  onClick={() => handleDocRowClick(ds, false)}
                >
                  <DocName>{ds.name}</DocName>
                  <DocToggle
                    type="checkbox"
                    checked={ds.isIncludedInSearch}
                    onChange={() => {}}
                  />
                </DocRow>
              ))}
            </DocsListNotIncluded>
          }
        </DocsListsWrapper>
      </Content>
    </StyledModal>
  );
}

export default DocsFilterModal;

