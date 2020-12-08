import React from 'react';
import styled from 'styled-components';

import Hotkey, { HotkeyType, ModifierKey } from './Hotkey';

const Container = styled.div`
  width: 100%;
  padding: 12px 15px;
  z-index: 1;

  display: flex;
  align-items: center;

  background: #2E303D;
  box-shadow: 0px -4px 30px 5px #1C1B26;
`;

const HotkeyWrapper = styled.div`
  margin-right: 10px;
  display: flex;
  align-items: center;
`;

const HotkeyText = styled.span`
  margin-right: 5px;

  color: #fff;
  font-size: 12px;
  font-weight: 500;
`;

export interface HotkeyWithText {
  text: string;
  hotkey: HotkeyType;
}

interface HotkeysPanelProps {
  hotkeys: HotkeyWithText[];
}

function HotkeysPanel({ hotkeys }: HotkeysPanelProps) {
  return (
    <Container>
      {hotkeys.map(h => (
        <HotkeyWrapper
          key={h.text}
        >
          <HotkeyText>{h.text}</HotkeyText>
          <Hotkey
            hotkey={h.hotkey}
          />
        </HotkeyWrapper>
      ))}
    </Container>
  );
}

export default HotkeysPanel;

