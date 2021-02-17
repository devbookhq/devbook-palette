import React from 'react';
import styled from 'styled-components';

import * as Colors from 'newsrc/ui/colors';
import commandModIcon from 'newsrc/img/modifiers/command.svg';

import ModifierIcon from './ModifierIcon';

const Container = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const ShortcutContainer = styled.div`
  padding: 0 2px;
  height: 18px;
  min-width: 18px;
  display: flex;
  align-items: center;
  justify-content: center;

  color: ${Colors.Ink.normal};
  /* TODO: Add to typography */
  font-size: 12px;
  font-weight: 500;

  border-radius: 3px;
  background: ${Colors.Lavender.dark};
`;

// This enum has to have string values,
// otherwise the function isModifier() won't be able
// to check whether a string value is in the enum.
export enum Modifier {
  Command = 'Command', // macOS only.
  Control = 'Control',
  CommandOrControl = 'CommandOrControl', // Either Command or Control, depending on the OS.
  Alt = 'Alt',
  Option = 'Option', // macOS only.
  Shift = 'Shift',
}

interface ShortcutProps {
  accelerator: (string | Modifier)[];
}

function isModifier(val: string) {
  return Object.values(Modifier).includes(val as Modifier)
}

function Shortcut({ accelerator }: ShortcutProps) {
  function getIconForModifier(mod: Modifier) {
    if (mod === Modifier.Command) return <ModifierIcon icon={commandModIcon}/>;
  }

  return (
    <Container>
      {accelerator.map((val) => (
        <ShortcutContainer key={val}>
          {isModifier(val)
            ? getIconForModifier(val as Modifier)
            : val
          }
        </ShortcutContainer>
      ))}
    </Container>
  );
}

export default Shortcut;

