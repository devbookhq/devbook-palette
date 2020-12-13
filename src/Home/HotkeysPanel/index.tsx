import React from 'react';
import styled from 'styled-components';

import Hotkey, { HotkeyType } from './Hotkey';

const Container = styled.div`
  width: 100%;
  padding: 4px 15px;
  z-index: 1;

  display: flex;
  align-items: center;
  justify-content: space-between;

  background: #2E303D;
  box-shadow: 0px -4px 30px 5px #1C1B26;
`;

const Section = styled.div`
  display: flex;
  align-items: center;
`;

const HotkeyWrapper = styled.div<{ isClickable?: boolean }>`
  margin-right: 15px;
  padding: 5px;
  display: flex;
  align-items: center;

  border-radius: 5px;
  ${props => props.isClickable && `
    user-select: none;
    :hover {
      transition: background 170ms ease-in;
      cursor: pointer;
      background: #434252;
    }
  `};
`;

const HotkeyText = styled.span`
  margin-right: 8px;

  color: #fff;
  font-size: 14px;
  font-weight: 500;
`;

const SeparatedHotkey = styled(Hotkey)`
  :not(:last-child) {
    margin-right: 4px;
  }
`;

export interface HotkeyWithText {
  text: string;
  hotkey: HotkeyType;
  isSeparated?: boolean; // Separates hotkey's symbols that are listed in the 'hotkey' property.
  onClick?: (e: any) => void;
}

interface HotkeysPanelProps {
  hotkeysLeft: HotkeyWithText[];
  hotkeysRight: HotkeyWithText[];
}

function HotkeysPanel({ hotkeysLeft, hotkeysRight }: HotkeysPanelProps) {
  function renderHotkey(h: HotkeyWithText) {
    return (
      <HotkeyWrapper
        key={h.text}
        isClickable={!!h.onClick}
        onClick={h.onClick ? (() => (h as any).onClick()) : undefined}
      >
        <HotkeyText>{h.text}</HotkeyText>
        {!h.isSeparated &&
          <Hotkey
            hotkey={h.hotkey}
          />
        }
        {h.isSeparated &&
          <>
            {h.hotkey.map((el, idx) => (
              <SeparatedHotkey
                key={idx}
                hotkey={[el]}
              />
            ))}
          </>
        }
      </HotkeyWrapper>
    );
 }

  return (
    <Container>
      <Section>
        {hotkeysLeft.map(h => renderHotkey(h))}
      </Section>

      <Section>
        {hotkeysRight.map(h => (
        <HotkeyWrapper
          key={h.text}
          isClickable={!!h.onClick}
          onClick={h.onClick ? (h as any).onClick : undefined}
        >
          <HotkeyText>{h.text}</HotkeyText>
          {!h.isSeparated &&
            <Hotkey
              hotkey={h.hotkey}
            />
          }
          {h.isSeparated &&
            <>
              {h.hotkey.map((el, idx) => (
                <SeparatedHotkey
                  key={idx}
                  hotkey={[el]}
                />
              ))}
            </>
          }
        </HotkeyWrapper>
        ))}
      </Section>
    </Container>
  );
}

export default HotkeysPanel;

