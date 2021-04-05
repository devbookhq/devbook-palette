import styled from 'styled-components';

import SearchControls from './SearchControls';
import SettingsPanel from './SettingsPannel';

const Container = styled.div`
  width: 100%;
  padding-top: 10px;
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid #3B3A4A;
  background: #25252E;
`;

function ControlPanel() {
  return (
    <Container>
      <SearchControls />
      <SettingsPanel />
    </Container>
  );
}

export default ControlPanel;
