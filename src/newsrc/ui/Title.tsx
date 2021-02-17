import styled from 'styled-components';

import * as Typography from 'newsrc/ui/typography';
import * as Colors from 'newsrc/ui/colors';

export const TitleSmall = styled.span`
  color: ${Colors.Ink.normal};
  font-size: ${Typography.Title.small.fontSize};
  font-weight: ${Typography.Title.small.fontWeight};
`;

export const TitleNormal = styled.span`
  color: ${Colors.Ink.normal};
  font-size: ${Typography.Title.normal.fontSize};
  font-weight: ${Typography.Title.normal.fontWeight};
`;

