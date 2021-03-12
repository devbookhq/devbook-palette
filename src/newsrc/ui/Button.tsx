import styled from 'styled-components';

import * as Typography from 'newsrc/ui/typography';
import * as Colors from 'newsrc/ui/colors';

export const Button = styled.button`
  width: 100%;
  padding: 12px 8px;

  color: ${Colors.Ink.normal};
  font-size: ${Typography.Body.semibold.large.fontSize};
  font-weight: ${Typography.Body.semibold.large.fontWeight};

  background: ${Colors.Orange.normal};
  border: 1px solid transparent;
  border-radius: 4px;

  :focus {
    border-color: white;
  }

  :hover {
    background: ${Colors.Orange.light};
    cursor: pointer;
  }
`;

export const TextButton = styled.button`
  color: ${Colors.Orange.normal};
  font-size: ${Typography.Body.semibold.normal.fontSize};
  font-weight: ${Typography.Body.semibold.normal.fontWeight};

  background: none;
  border: none;

  :hover {
    color: ${Colors.Ink.normal};
    cursor: pointer;
    user-select: none;
  }
`;


