import { useCallback, memo } from 'react';
import { DocSource } from 'services/search.service/docSource';
import styled from 'styled-components';

const DocRow = styled.div<{ isFocused?: boolean }>`
  width: 100%;
  padding: 5px 10px;

  display: flex;
  align-items: center;
  justify-content: flex-start;

  border-bottom: 1px solid #262736;
  background: ${props => props.isFocused ? '#2C2F5A' : 'transparent'};

  :hover {
    background: #2C2F5A;
    cursor: pointer;
  }
`;

const DocsetIcon = styled.img`
  margin-right: 8px;
  min-height: 26px;
  min-width: 26px;
  height: 26px;
  width: 26px;
`;

const DocName = styled.span`
  color: #fff;
  font-size: 14px;
  font-weight: 500;
`;

interface FilterItemProps {
  isSelected: boolean;
  itemRef?: React.RefObject<HTMLDivElement>;
  selectSource: (source: DocSource) => void;
  sourceFilter: DocSource;
}

function FilterItem({ itemRef, isSelected, selectSource, sourceFilter }: FilterItemProps) {
  const handleOnClick = useCallback(() => {
    selectSource(sourceFilter);
  }, [sourceFilter, selectSource]);

  return (
    <DocRow
      ref={itemRef}
      isFocused={isSelected}
      onClick={handleOnClick}
    >
      <DocsetIcon src={sourceFilter.iconURL} />
      <DocName>{sourceFilter.name}</DocName>
    </DocRow>
  );
}

export default memo(FilterItem);
