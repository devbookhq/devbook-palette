import styled from 'styled-components';

import * as Typography from 'newsrc/ui/typography';
import * as Colors from 'newsrc/ui/colors';

export const LightText = styled.p<{isLarge?: boolean}>`
  margin: 0;
  padding: 0;

  color: ${Colors.Ink.normal};
  font-size: ${props => props.isLarge
    ? Typography.Body.light.large.fontSize
    : Typography.Body.light.normal.fontSize};

  font-weight: ${props => props.isLarge
    ? Typography.Body.light.large.fontWeight
    : Typography.Body.light.normal.fontWeight};

  line-height: ${props => props.isLarge
    ? Typography.Body.light.large.lineHeight
    : Typography.Body.light.normal.lineHeight};
`;

export const RegularText = styled.p<{isLarge?: boolean}>`
  margin: 0;
  padding: 0;

  color: ${Colors.Ink.normal};
  font-size: ${props => props.isLarge
    ? Typography.Body.regular.large.fontSize
    : Typography.Body.regular.normal.fontSize};

  font-weight: ${props => props.isLarge
    ? Typography.Body.regular.large.fontWeight
    : Typography.Body.regular.normal.fontWeight};

  line-height: ${props => props.isLarge
    ? Typography.Body.regular.large.lineHeight
    : Typography.Body.regular.normal.lineHeight};
`;

