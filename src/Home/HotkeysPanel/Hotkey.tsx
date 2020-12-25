import React from 'react';
import styled from 'styled-components';

import { ReactComponent as shiftKeyImg } from 'img/shift-key.svg';
import { ReactComponent as altKeyImg } from 'img/alt-key.svg';
import { ReactComponent as cmdKeyImg } from 'img/cmd-key.svg';
import { ReactComponent as enterKeyImg } from 'img/enter-key.svg';
import { ReactComponent as arrowUpKeyImg } from 'img/arrow-up-key.svg';
import { ReactComponent as arrowDownKeyImg } from 'img/arrow-down-key.svg';

const Container = styled.div`
  min-height: 18px;
  padding: 3px 7px;
  display: flex;
  align-items: center;
  justify-content: flex-start;

  color: white;
  border-radius: 5px;
  background: #434252;
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
  height: 13px;
  :not(:last-child) {
    margin-right: 5px;
  }

  path {
    stroke: white;
  }
`;

const CommandKeyImg = styled(cmdKeyImg)`
  width: auto;
  height: 13px;
  :not(:last-child) {
    margin-right: 5px;
  }

  path {
    stroke: white;
  }
`;

const ShiftKeyImg = styled(shiftKeyImg)`
  width: auto;
  height: 12px;
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
  font-weight: 500;
  font-size: 15px;

  :not(:last-child) {
    margin-right: 7px;
  }
`;

const VisualConcatPlus = styled.div`
  width: auto;
  height: 12px;
  margin: 0 7px;
`;

export enum Key {
  Alt = 'KeyAlt',
  Shift = 'KeyShift',
  Command = 'KeyCommand',
  Enter = 'KeyEnter',
  ArrowUp = 'KeyArrowUp',
  ArrowDown = 'KeyArrowDown',
}

export enum VisualConcat {
  Plus,
}

export type HotkeyType = (string | Key | VisualConcat)[];

interface HotkeyProps {
  className?: string;
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

function renderVisualConcat(vc: VisualConcat) {
  return (
    <>
      {vc === VisualConcat.Plus && <VisualConcatPlus/>}
    </>
  );
}

function renderHotkeyType(ht: HotkeyType) {
  /*
  if (Key[ht as Key]) {

  }
  */
}

function Hotkey({ className, hotkey }: HotkeyProps) {
  return (
    <Container
      className={className}
    >
      {hotkey.map(el => (
        <React.Fragment key={el}>
          {Object.values(Key).includes(el as Key)
            ? renderKey(el as Key)
            : <TextKey>{el as string}</TextKey>
          }
        </React.Fragment>
      ))}
    </Container>
  );
}

export default Hotkey;

