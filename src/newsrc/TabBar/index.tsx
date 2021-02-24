import React from 'react';
import styled from 'styled-components';

import * as Colors from 'newsrc/ui/colors';

const Container = styled.div`
  width: 100%;
  height: 32px;
  background: ${Colors.Charcoal.light};
`;

function TabBar() {
  return (
    <Container/>
  );
}

export default TabBar;


