import useIPCRenderer from 'hooks/useIPCRenderer';
import { useEffect, useState } from 'react';
import { UpdateLocation } from 'services/appWindow';
import IPCService, { IPCInvokeChannel, IPCOnChannel, IPCSendChannel } from 'services/ipc.service';
import styled from 'styled-components';
import { ReactComponent as closeIcon } from 'img/close.svg';

import SearchControls from './SearchControls';
import SettingsPanel from './SettingsPanel';

const Container = styled.div`
  width: 100%;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #3B3A4A;
  background: #25252E;
`;

const UpdatePanel = styled.div`
  height: 38px;
  width: 100%;
  display: flex;
  justify-content: space-between;
  background: #7739DD;
`;

const Disclaimer = styled.div`
  font-size: 16px;
  font-weight: 500;
  margin: auto 15px;
  :hover {
    cursor: pointer;
  }
`;

const CancelButton = styled.div`
  margin: auto 15px;
  :hover {
    cursor: pointer;
    path {
      stroke: #FFFFFF;
    }
  }
`;

const CloseIcon = styled(closeIcon)`
  width: auto;
  height: 18px;
  display: block;
  path {
    stroke: #FFFFFF;
  }
`;

function SearchPanel() {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [isUpdatePanelOpened, setIsUpdatePanelOpened] = useState(true);

  useIPCRenderer(IPCOnChannel.UpdateAvailable, (_, { isReminder }: { isReminder?: boolean }) => {
    setIsUpdateAvailable(true);
    if (isReminder) {
      setIsUpdatePanelOpened(true);
    }
  });

  function handleUpdate() {
    IPCService.send(IPCSendChannel.RestartAndUpdate, { location: UpdateLocation.Banner });
  }

  function handleCloseUpdatePanel() {
    setIsUpdatePanelOpened(false);
    IPCService.send(IPCSendChannel.PostponeUpdate, undefined);
  }

  useEffect(() => {
    async function checkUpdateStatus() {
      const isNewUpdateAvailable = await IPCService.invoke(IPCInvokeChannel.UpdateStatus, undefined);
      if (isNewUpdateAvailable) {
        setIsUpdateAvailable(true);
      }
    }
    checkUpdateStatus();
  }, []);

  return (
    <Container>
      <SearchControls />
      <SettingsPanel />
      {isUpdateAvailable && isUpdatePanelOpened &&
        <UpdatePanel>
          <Disclaimer onClick={handleUpdate}>
            {'New version is available. Click here to update & restart.'}
          </Disclaimer>
          <CancelButton
            onClick={handleCloseUpdatePanel}
          >
            <CloseIcon />
          </CancelButton>
        </UpdatePanel>
      }
    </Container>
  );
}

export default SearchPanel;
