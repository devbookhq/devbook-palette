import {
  useRef,
  useEffect,
} from 'react';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';

import useOnClickOutside from 'hooks/useOnClickOutside';
import ElectronService from 'services/electron.service';
import Modal from 'components/Modal';
import FilterInput from './FilterInput';
import { HotkeyAction, useUIStore } from 'ui/ui.store';
import FilterResults from './FilterResults';

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

const Content = styled.div`
  padding: 10px 0 50px;

  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const HeaderText = styled.span`
  margin: 8px 0;
  width: 100%;
  text-align: center;

  color: #fff;
  font-size: 16px;
  font-weight: 500;
`;

const FeedbackButton = styled.button`
  margin: 10px 0;
  color: #5A5A6F;
  font-size: 14px;
  font-weight: 600;
  background: none;
  outline: none;
  border: none;
  text-decoration: underline;

  :hover {
    cursor: pointer;
    text-decoration: underline;
  }
`;

function handleFeedbackButtonClick() {
  const url = 'https://docs.google.com/forms/d/e/1FAIpQLSddf3HliA9uU0SZS-EGofU_gvnDcQX_BykzCxri9nsdoQusBw/viewform?usp=sf_link';
  ElectronService.openLink(url);
}

interface DocsFilterModalProps {
  onCloseRequest: () => void;
}

function DocsFilterModal({ onCloseRequest }: DocsFilterModalProps) {
  const uiStore = useUIStore();

  const inputRef = useRef<HTMLInputElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  useOnClickOutside(modalRef, onCloseRequest);

  useEffect(() => {
    if (!inputRef.current) return;
    // Focus modal's input and select text inside of it
    inputRef.current.focus();
    inputRef.current.setSelectionRange(0, 999999);
  }, []);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.DocsCloseModalFilter, onCloseRequest);
  }, [
    onCloseRequest,
    uiStore,
  ]);

  return (
    <StyledModal
      onCloseRequest={onCloseRequest}
      ref={modalRef}
    >
      <FilterInput
        inputRef={inputRef}
      />
      <Content>
        <HeaderText>
          Select active documentation
        </HeaderText>
        <FeedbackButton
          onClick={handleFeedbackButtonClick}
        >
          Missing some docs?
        </FeedbackButton>
        <FilterResults
          onCloseRequest={onCloseRequest}
        />
      </Content>
    </StyledModal>
  );
}

export default observer(DocsFilterModal);
