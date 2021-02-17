import styled from 'styled-components';

import * as Typography from 'newsrc/ui/typography';
import * as Colors from 'newsrc/ui/colors';

export const LightNormal = styled.p`
  margin: 0;
  padding: 0;

  color: ${Colors.Ink.normal};
  font-size: ${Typography.Body.light.normal.fontSize};
  font-weight: ${Typography.Body.light.normal.fontWeight};
  line-height: ${Typography.Body.light.normal.lineHeight};
`;

export const LightLarge = styled.p`
  margin: 0;
  padding: 0;

  color: ${Colors.Ink.normal};
  font-size: ${Typography.Body.light.large.fontSize};
  font-weight: ${Typography.Body.light.large.fontWeight};
  line-height: ${Typography.Body.light.large.lineHeight};
`;


export const RegularNormal = styled.p`
  margin: 0;
  padding: 0;

  color: ${Colors.Ink.normal};
  font-size: ${Typography.Body.regular.normal.fontSize};
  font-weight: ${Typography.Body.regular.normal.fontWeight};
  line-height: ${Typography.Body.regular.normal.lineHeight};
`;

export const RegularLarge = styled.p`
  margin: 0;
  padding: 0;

  color: ${Colors.Ink.normal};
  font-size: ${Typography.Body.regular.large.fontSize};
  font-weight: ${Typography.Body.regular.large.fontWeight};
  line-height: ${Typography.Body.regular.large.lineHeight};
`;
