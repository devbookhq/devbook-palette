import {
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';

import Select from 'components/Select';
import Base from './Base';
import IPCService, { IPCSendChannel } from 'services/ipc.service';
import ElectronService from 'services/electron.service';
import { Platform } from 'services/electron.service/platform';
import { SearchMode } from 'services/search.service/searchMode';
import SyncService, { StorageKey } from 'services/sync.service';
import { GlobalShortcut } from 'services/globalShortcut';

const InfoMessage = styled.div`
  margin: auto;

  color: #5A5A6F;
  font-size: 16px;
  font-weight: 600;
`;

const Items = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Item = styled.div`
  margin-bottom: 20px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Text = styled.div`
  margin-right: 5px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Title = styled.span`
  color: #fff;
  font-size: 15px;
  font-weight: 500;
`;

const Description = styled.div` 
  color: #959CB1;
  font-size: 15px;
  font-weight: 400;
`;

const StyledSelect = styled(Select)`
  min-width: 250px;
`;

const searchModeLabels: { [mode in SearchMode]: string } = {
  [SearchMode.Automatic]: 'As I type',
  [SearchMode.OnEnterPress]: 'On Enter press',
};

function GeneralPreferences() {
  const [selectedShortcut, setSelectedShortcut] = useState<GlobalShortcut>();
  const [selectedMode, setSelectedMode] = useState<SearchMode>();

  function handleShortcutChange(shortcut: GlobalShortcut) {
    IPCService.send(IPCSendChannel.UserDidChangeShortcut, { shortcut });
    setSelectedShortcut(shortcut);
  }

  function handleModeChange(mode: SearchMode) {
    IPCService.send(IPCSendChannel.UserDidChangeSearchMode, { mode });
    setSelectedMode(mode);
  }

  useEffect(() => {
    async function getShortcut() {
      const shortcut = await SyncService.get(StorageKey.GlobalShortcut);
      // const shortcut = await IPCService.invoke(IPCInvokeChannel.GetGlobalShortcut, undefined);
      setSelectedShortcut(shortcut);
    }

    async function getMode() {
      const mode = await SyncService.get(StorageKey.SearchMode);
      // const mode = await IPCService.invoke(IPCInvokeChannel.GetSearchMode, undefined);
      setSelectedMode(mode);
    }

    getMode();
    getShortcut();
  }, []);

  return (
    <Base title="Preferences">
      <Items>
        {(!selectedShortcut || !selectedMode) && <InfoMessage>Loading...</InfoMessage>}
        {selectedShortcut && selectedMode &&
          <>
            <Item>
              <Text>
                <Title>Global shortcut</Title>
                <Description>A shortcut that you press to display Devbook.</Description>
              </Text>
              <StyledSelect value={selectedShortcut} onChange={e => handleShortcutChange(e.target.value as unknown as GlobalShortcut)}>
                <option value={GlobalShortcut.ControlSpace}>Control+Space</option>
                <option value={GlobalShortcut.ShiftSpace}>Shift+Space</option>
                {ElectronService.platform === Platform.MacOS &&
                  <>
                    <option value={GlobalShortcut.AltSpace}>Option+Space</option>
                    <option value={GlobalShortcut.CommandSpace}>Command+Space</option>
                    <option value={GlobalShortcut.CommandShiftSpace}>Command+Shift+Space</option>
                    <option value={GlobalShortcut.CommandAltSpace}>Command+Option+Space</option>
                    <option value={GlobalShortcut.CommandAltSpace}>Control+Option+Space</option>
                    <option value={GlobalShortcut.ShiftAltSpace}>Shift+Option+Space</option>
                  </>
                }
                {ElectronService.platform !== Platform.MacOS &&
                  <>
                    <option value={GlobalShortcut.AltSpace}>Alt+Space</option>
                    <option value={GlobalShortcut.ControlShiftSpace}>Control+Shift+Space</option>
                    <option value={GlobalShortcut.ControlAltSpace}>Control+Alt+Space</option>
                    <option value={GlobalShortcut.ShiftAltSpace}>Shift+Alt+Space</option>
                  </>
                }
              </StyledSelect>
            </Item>
            <Item>
              <Text>
                <Title>Search Mode</Title>
                <Description>When should Devbook start searching.</Description>
              </Text>
              <StyledSelect value={selectedMode} onChange={e => handleModeChange(e.target.value as SearchMode)}>
                {(Object.values(SearchMode) as SearchMode[]).map((mode) =>
                  <option key={mode} value={mode}>{searchModeLabels[mode]}</option>
                )}
              </StyledSelect>
            </Item>
          </>
        }
      </Items>
    </Base>
  );
}

export default GeneralPreferences;
