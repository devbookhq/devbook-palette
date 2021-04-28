import { useEffect, useState } from 'react';
import styled from 'styled-components';

import IPCService, { IPCSendChannel } from 'services/ipc.service'
import useIPCRenderer from 'hooks/useIPCRenderer';
import Button from 'components/Button';
import IntroductionPage from './pages/Introduction';
import ShortcutPage from './pages/Shortcut';
import { IPCOnChannel } from 'services/ipc.service';
import { GlobalShortcut } from 'services/globalShortcut';

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

  useIPCRenderer(IPCOnChannel.DidShowMainWindow, () => {
    setDidShowMainWindow(true);
  });

  useEffect(() => {
    // Tell the main proces to register the default shortcut before user chooses any shortcut.
    IPCService.send(IPCSendChannel.UserDidChangeShortcut, { shortcut: GlobalShortcut.AltSpace });
  }, []);

  function handleDidChangeShortcut(shortcut: GlobalShortcut) {
    IPCService.send(IPCSendChannel.UserDidChangeShortcut, { shortcut });
  }

  function handleFinishButtonClick() {
    IPCService.send(IPCSendChannel.FinishOnboarding, undefined);
  }


  useEffect(() => {
    function handleGlobalKeyPress(e: any) {
      if (e.key === 'Enter') {
        if (pageIndex < 1) {
          setPageIndex(c => c += 1);
        } else if (pageIndex === 1 && didShowMainWindow) {
          handleFinishButtonClick();
        }
      }
    }
    window.addEventListener('keypress', handleGlobalKeyPress);
    return () => {
      window.removeEventListener('keypress', handleGlobalKeyPress)
    }
  }, [pageIndex, didShowMainWindow]);

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
