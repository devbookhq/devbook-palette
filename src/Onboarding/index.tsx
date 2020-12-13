import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  userDidChangeShortcut,
  finishOnboarding,
} from 'mainProcess';
import useIPCRenderer from 'hooks/useIPCRenderer';
import Button from 'components/Button';

import IntroductionPage from './pages/Introduction';
import ShortcutPage from './pages/Shortcut';

const Container = styled.div`
  margin-top: 7px;
  padding-bottom: 20px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #1C1B26;
`;

const PageContent = styled.div`
  flex: 1;
  margin: 10px 50px 0;
`;

const Navigation = styled.div`
  padding: 0 50px;
  width: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const BackButton = styled(Button)`
  background: transparent;
  color: #FFF;
  font-size: 16px;
  :hover {
    background: transparent;
  }
`;

const NextButtonDisabled = styled(Button)`
  margin-left: auto;
  font-size: 16px;
  background: #343654;
  cursor: not-allowed;

  :hover {
    background: #343654;
    cursor: not-allowed;
  }
`;

const NextButton = styled(Button)`
  margin-left: auto;
  font-size: 16px;
`;

function Onboarding() {
  const [pageIndex, setPageIndex] = useState(0);
  const [didShowMainWindow, setDidShowMainWindow] = useState(false);

  useIPCRenderer('did-show-main-window', () => {
    setDidShowMainWindow(true);
  });

  useEffect(() => {
    // TODO: 'Alt+Space' - the initial value for a selected shortcut - is defined in the ShortcutPage.
    // We should unify who handles the full state. Probably this component.

    // Tell the main proces to register the default shortcut before user chooses any shortcut.
    userDidChangeShortcut('Alt+Space');
  }, []);

  function handleDidChangeShortcut(shortcut: string) {
    userDidChangeShortcut(shortcut);
  }

  function handleFinishButtonClick() {
    finishOnboarding();
  }

  return (
    <Container>
      <PageContent>
        {pageIndex === 0 && (
          <IntroductionPage />
        )}
        {pageIndex === 1 && (
          <ShortcutPage
            didHitShortcut={didShowMainWindow}
            onDidChangeShortcut={handleDidChangeShortcut}
          />
        )}
      </PageContent>

      <Navigation>
        {pageIndex > 0 && (
          <BackButton
            onClick={() => setPageIndex(c => c -= 1)}
          >Back
          </BackButton>
        )}

        {pageIndex < 1 && (
          <NextButton
            onClick={() => setPageIndex(c => c += 1)}
          >Next
          </NextButton>
        )}

        {pageIndex === 1 && didShowMainWindow && (
          <NextButton
            onClick={handleFinishButtonClick}
          >Finish
          </NextButton>
        )}
        {pageIndex === 1 && !didShowMainWindow && (
          <NextButtonDisabled
            onClick={() => { }}
          >Finish
          </NextButtonDisabled>
        )}
      </Navigation>
    </Container>
  );
}

export default Onboarding;
