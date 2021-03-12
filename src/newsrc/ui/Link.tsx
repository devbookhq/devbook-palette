import styled from 'styled-components';
import { Link as ReactRouterLink } from 'react-router-dom';

import * as Typography from 'newsrc/ui/typography';
import * as Colors from 'newsrc/ui/colors';

const LinkWrapper = styled.div<{ isDark?: boolean }>`
  a {
    color: ${props => props.isDark ? Colors.Lavender.dark : Colors.Orange.normal};

    :hover {
      color: ${props => props.isDark ? Colors.Lavender.normal : Colors.Ink.normal};
    }
  }
`;

const StyledRouterLink = styled(ReactRouterLink)`
  font-size: ${Typography.Body.semibold.normal.fontSize};
  font-weight: ${Typography.Body.semibold.normal.fontWeight};
  line-height: ${Typography.Body.semibold.normal.lineHeight};

  text-decoration: none;

  :hover {
    cursor: pointer;
    user-select: none;
  }
`;

interface RouterLinkProps {
  isDark?: boolean;
  to: string;
  children: React.ReactNode;
  className?: string;
}

export function RouterLink({
  isDark,
  to,
  children,
  className,
}: RouterLinkProps) {
  return (
    <LinkWrapper
      className={className}
      isDark={isDark}
    >
      <StyledRouterLink to={to}>
        {children}
      </StyledRouterLink>
    </LinkWrapper>
  );
}


