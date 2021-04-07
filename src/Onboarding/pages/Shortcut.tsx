import { useState } from 'react';
import styled from 'styled-components';

import ElectronService from 'services/electron.service';
import { Platform } from 'services/electron.service/platform';

import { ReactComponent as CheckIcon } from 'img/check.svg';
import { GlobalShortcut } from 'services/globalShortcut';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  user-select: none;
`;

const Titles = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.span`
  color: white;
  font-size: 21px;
  font-weight: 500;
`;

const Subtitle = styled.span`
  margin-top: 10px;
  color: white;
  font-size: 16px;
  font-weight: 400;
`;

const Steps = styled.div`
  margin-top: 20px;
  display: flex;
  flex-direction: column;
`;

const StepWrapper = styled.div`
  margin-bottom: 50px;
  display: flex;
  flex-direction: column;
`;

const Step = styled.div`
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  color: white;
  font-family: 'Roboto Mono';
  font-size: 16px;
  font-weight: 500;
`;

const Shortcut = styled.div`
  margin: 0 5px;
  color: #4FA1ED;
  font-family: 'Roboto Mono';
  font-size: 16px;
  font-weight: 500;
`;

const Select = styled.select`
  padding: 5px 10px;
  border: 1px solid #5C4FED;
  border-radius: 3px;
  background: #1A1D25;
  color: white;
  font-family: 'Roboto Mono';
  font-size: 16px;
  font-weight: 500;
  :hover {
    cursor: pointer;
  }
`;

const CheckIconDone = styled(CheckIcon)`
  margin-right: 10px;
  height: 19px;
  width: auto;
  * {
    stroke: #4FED7B;
  }
`;

const CheckIconNotDone = styled(CheckIcon)`
  margin-right: 10px;
  height: 19px;
  width: auto;
  * {
    stroke: #919396;
  }
`;

interface TrayPageProps {
  didHitShortcut: boolean;
  onDidChangeShortcut: (shortcut: GlobalShortcut) => void;
}

function TrayPage(props: TrayPageProps) {
  const [selectedShortcut, setSelectedShortcut] = useState<GlobalShortcut>(GlobalShortcut.AltSpace);

  function handleShortcutChange(shortcut: GlobalShortcut) {
    setSelectedShortcut(shortcut);
    props.onDidChangeShortcut(shortcut);
  }

  function getShortcutText() {
    if (ElectronService.platform === Platform.MacOS) {
      if (selectedShortcut === GlobalShortcut.AltSpace) return 'Option+Space';
      else if (selectedShortcut === GlobalShortcut.CommandAltSpace) return 'Command+Option+Space';
      else if (selectedShortcut === GlobalShortcut.ControlAltSpace) return 'Control+Option+Space';
      else if (selectedShortcut === GlobalShortcut.ShiftAltSpace) return 'Shift+Option+Space';
      else return selectedShortcut;
    }
    return selectedShortcut;
  }

  return (
    <Container>
      <Titles>
        <Title>How it works</Title>
        <Subtitle>
          You can access Devbook from anywhere by hitting a shortcut on your keyboard. Try it now!
        </Subtitle>
      </Titles>

      <Steps>
        <StepWrapper>
          <Step>
            <CheckIconDone />
            1. Choose a global shortcut
          </Step>
          <Select value={selectedShortcut} onChange={e => handleShortcutChange(e.target.value as unknown as GlobalShortcut)}>
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
          </Select>
        </StepWrapper>

        <StepWrapper>
          <Step>
            {props.didHitShortcut && <CheckIconDone />}
            {!props.didHitShortcut && <CheckIconNotDone />}
            2. Hit <Shortcut>{getShortcutText()}</Shortcut> to show Devbook
          </Step>
        </StepWrapper>
      </Steps>
    </Container>
  );
}

export default TrayPage;
