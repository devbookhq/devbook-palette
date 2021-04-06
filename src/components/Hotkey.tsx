import styled from 'styled-components';

import HotkeyButton from './HotkeyButton';

const HotkeyWrapper = styled.div<{ isHighlighted?: boolean, reverseContent?: boolean }>`
  padding: 3px;
  margin-right: 3px;
  display: flex;
  flex-direction: ${props => props.reverseContent ? 'row-reverse' : 'row'};
  align-items: center;
  border-radius: 5px;
  user-select: none;
  background: ${props => props.isHighlighted ? '#535BD7' : 'transparent'};
  box-shadow: ${props => props.isHighlighted ? '0px 0px 8px 5px rgba(83, 91, 215, 0.15)' : 'none'};
  :hover {
    transition: background 170ms ease-in;
    cursor: pointer;
    background: ${props => props.isHighlighted ? '#535BD7' : '#434252'};
  }
`;

const StyledHotkey = styled(HotkeyButton) <{ isHighlighted?: boolean }>`
  background: ${props => props.isHighlighted ? '#535BD7' : 'auto'};
  color: ${props => props.isHighlighted ? '#fff' : 'auto'};
`;

const HotkeyText = styled.div<{ isHighlighted?: boolean }>`
  margin-left: 5px;
  font-size: 12px;
  color: #616171;
  transition: color 170ms ease-in;
  color: ${props => props.isHighlighted ? '#fff' : 'auto'};
`;


interface HotkeyProps {
  children: any;
  onClick: () => void;
  hotkey: string[];
  isHighlighted?: boolean;
  isHighlightedText?: boolean;
  reverseContent?: boolean;
}

function Hotkey({ children, onClick, hotkey, isHighlighted, isHighlightedText, reverseContent }: HotkeyProps) {
  return (
    <>
      <HotkeyWrapper
        onClick={onClick}
        isHighlighted={isHighlighted}
        reverseContent={reverseContent}
      >
        <StyledHotkey
          hotkey={hotkey}
          isHighlighted={isHighlighted}
        />
        <HotkeyText
          isHighlighted={isHighlightedText}
        >
          {children}
        </HotkeyText>
      </HotkeyWrapper>
    </>
  );
}

export default Hotkey;
