import React from 'react';
import styled from 'styled-components';

import { ReactComponent as shiftKeyImg } from 'img/shift-key.svg';
import { ReactComponent as altKeyImg } from 'img/alt-key.svg';
import { ReactComponent as cmdKeyImg } from 'img/cmd-key.svg';
import { ReactComponent as enterKeyImg } from 'img/enter-key.svg';
import { ReactComponent as arrowUpKeyImg } from 'img/arrow-up-key.svg';
import { ReactComponent as arrowDownKeyImg } from 'img/arrow-down-key.svg';

const Container = styled.div`
  height: 18px;
  padding: 3px 7px;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  color: white;
  border-radius: 5px;
  background: #262736;
`;

const ArrowUpKey = styled(arrowUpKeyImg)`
  width: auto;
  height: 8px;
  :not(:last-child) {
    margin-right: 5px;
  }

  path {
    stroke: white;
  }
`;

const ArrowDownKey = styled(arrowDownKeyImg)`
  width: auto;
  height: 8px;
  :not(:last-child) {
    margin-right: 5px;
  }

  path {
    stroke: white;
  }
`;

const EnterKeyImg = styled(enterKeyImg)`
  width: auto;
  height: 12px;
  :not(:last-child) {
    margin-right: 5px;
  }

  path {
    stroke: white;
  }
`;

const CommandKeyImg = styled(cmdKeyImg)`
  width: auto;
  height: 12px;
  :not(:last-child) {
    margin-right: 5px;
  }

  path {
    stroke: white;
  }
`;

const ShiftKeyImg = styled(shiftKeyImg)`
  width: auto;
  height: 11px;
  :not(:last-child) {
    margin-right: 7px;
  }

  path {
    fill: white;
  }
`;

const AltKeyImg = styled(altKeyImg)`
  width: auto;
  height: 11px;
  :not(:last-child) {
    margin-right: 7px;
  }

  path {
    fill: white;
  }
`;

const TextKey = styled.div`
  position: relative;
  bottom: 1px;

  font-weight: 600;
  font-size: 14px;

  :not(:last-child) {
    margin-right: 7px;
  }
`;

export enum Key {
  Alt = 'Alt',
  Shift = 'Shift',
  Command = 'Command',
  Enter = 'Enter',
  ArrowUp = 'ArrowUp',
  ArrowDown = 'ArrowDown',
}

export type HotkeyType = (string | Key)[];

interface HotkeyProps {
  hotkey: HotkeyType;
}

function renderKey(key: Key) {
  return (
    <>
      {key === Key.Alt && <AltKeyImg />}
      {key === Key.Shift && <ShiftKeyImg />}
      {key === Key.Command && <CommandKeyImg />}
      {key === Key.Enter && <EnterKeyImg />}
      {key === Key.ArrowUp && <ArrowUpKey />}
      {key === Key.ArrowDown && <ArrowDownKey />}
    </>
  );
}

function Hotkey({ hotkey }: HotkeyProps) {
  return (
    <Container>
      {hotkey.map(el => (
        <React.Fragment key={el}>
          {Object.keys(Key).includes(el)
            ? renderKey(el as Key)
            : <TextKey>{el as string}</TextKey>
          }
        </React.Fragment>
      ))}
    </Container>
  );
}

export default Hotkey;

