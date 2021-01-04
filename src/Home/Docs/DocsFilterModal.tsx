import React, {
  useRef,
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';

import Modal from 'components/Modal';
import { ReactComponent as searchImg } from 'img/search.svg';

const marginTop = 110;

const StyledModal = styled(Modal)`
  /*
  position: relative;
  bottom: 50px;
  width: 100%;
  height: calc(100vh - ${marginTop}px);
  margin-top: ${marginTop}px;
  */
  min-width: 550px;

  display: flex;
  flex-direction: column;

  overflow-y: auto;
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
  padding: 5px 15px;

  width: 100%;
  display: flex;
  flex-direction: column;
`;

const DocsListHeader = styled.div`
  width: 100%;
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

const DocsList = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const DocRow = styled.div`
  width: 100%;
  margin-bottom: 10px;
  padding-bottom: 5px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  border-bottom: 1px solid #262736;
`;

const DocName = styled.span`
  color: #fff;
  font-size: 14px;
  font-weight: 500;
`;

function DocsFilterModal() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <StyledModal>
      <SearchWrapper>
        <SearchImg/>
        <SearchInput
          ref={inputRef}
          autoFocus
          placeholder="Search in available documentations"
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

        <DocsList>
          <DocRow>
            <DocName>JavaScript</DocName>
          </DocRow>
          <DocRow>
            <DocName>JavaScript</DocName>
          </DocRow>
          <DocRow>
            <DocName>JavaScript</DocName>
          </DocRow>
        </DocsList>
      </Content>
    </StyledModal>
  );
}

export default DocsFilterModal;

