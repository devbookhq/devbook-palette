import React from 'react';
import styled from 'styled-components';

import { ReactComponent as shiftKeyImg } from 'img/shift-key.svg';
import { ReactComponent as altKeyImg } from 'img/alt-key.svg';
import { ReactComponent as cmdKeyImg } from 'img/cmd-key.svg';
import { ReactComponent as enterKeyImg } from 'img/enter-key.svg';
import { ReactComponent as arrowUpKeyImg } from 'img/arrow-up-key.svg';
import { ReactComponent as arrowDownKeyImg } from 'img/arrow-down-key.svg';

const Container = styled.div`
  min-height: 24px;
  padding: 2px 6px;
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
  height: 11px;
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
  font-weight: 500;
  font-size: 12px;
  :not(:last-child) {
    margin-right: 7px;
  }
`;

const VisualConcatEl = styled.div`
  color: #fff;
  font-size: 18px;
  :not(:last-child) {
    margin-right: 4px;
  }
`;

export enum Key {
  Alt = 'KeyAlt',
  Shift = 'KeyShift',
  Command = 'KeyCommand',
  Enter = 'KeyEnter',
  ArrowUp = 'KeyArrowUp',
  ArrowDown = 'KeyArrowDown',
}

// TODO: Naming of enums, types, and interfaces here is not great.
// If someone can come up with better names please go ahead and change them.

/*
export enum Key {
  Alt,
  Shift,
  Command,
  Enter,
  ArrowUp,
  ArrowDown,
}
*/

export enum VisualConcat {
  Plus = 'VisualConcatPlus',
}

export type HotkeyElement = (string | Key | VisualConcat)
export type HotkeyType = HotkeyElement[];

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
    <VisualConcatEl key={vc}>
      {vc === VisualConcat.Plus && <>+</>}
    </VisualConcatEl>
  );
}

function Hotkey({ className, hotkey }: HotkeyProps) {
  return (
    <>
      {/* Special case when only a single HotkeyType is passed*/}
      {hotkey.length === 1 &&
        <>
          {/* TODO: If the hotkey isn't */}
          {Object.values(VisualConcat).includes(hotkey[0] as VisualConcat) &&
            renderVisualConcat(hotkey[0] as VisualConcat)
          }

          {Object.values(Key).includes(hotkey[0] as Key) &&
            <Container className={className}>
              {renderKey(hotkey[0] as Key)}
            </Container>
          }


          {!Object.values(VisualConcat).includes(hotkey[0] as VisualConcat)
            && !Object.values(Key).includes(hotkey[0] as Key)
            &&
            <Container className={className}>
              <TextKey>{hotkey[0] as string}</TextKey>
            </Container>
          }
        </>
      }

      {hotkey.length > 1 &&
        <Container className={className}>
          {hotkey.map(el => (
            <React.Fragment key={el}>
              {Object.values(Key).includes(el as Key)
                ? renderKey(el as Key)
                : <TextKey>{el as string}</TextKey>
              }
            </React.Fragment>
          ))}
        </Container>
      }
    </>
  );
}

export default Hotkey;
