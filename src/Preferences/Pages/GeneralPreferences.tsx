import React, {
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';

import Select from 'components/Select';
import electron, {
  userDidChangeShortcut,
  getGlobalShortcut,
} from 'mainProcess';
import Base from './Base';

const InfoMessage = styled.div`
  margin: auto;

  color: #5A5A6F;
  font-size: 16px;
  font-weight: 600;
`;

const Items = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Item = styled.div`
  width: 100%;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
`;

const Text = styled.div`
  margin-right: 5px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const Title = styled.span`
  color: #fff;
  font-size: 15px;
  font-weight: 500;
`;

const Description = styled.div`
  color: #959CB1;
  font-size: 15px;
  font-weight: 400;
`;

const StyledSelect = styled(Select)`
  min-width: 250px;
`;

function GeneralPreferences() {
  const [selectedShortcut, setSelectedShortcut] = useState('');

  function handleShortcutChange(shortcut: string) {
    userDidChangeShortcut(shortcut);
    setSelectedShortcut(shortcut);
  }

  useEffect(() => {
    async function getShortcut() {
      const shortcut = await getGlobalShortcut();
      setSelectedShortcut(shortcut);
    }
    getShortcut();
  }, []);

  return (
    <Base title="Preferences">
      <Items>
        {!selectedShortcut && <InfoMessage>Loading...</InfoMessage>}
        {selectedShortcut &&
          <Item>
            <Text>
              <Title>Global shortcut</Title>
              <Description>A shortcut that you press to display Devbook.</Description>
            </Text>
            <StyledSelect value={selectedShortcut} onChange={e => handleShortcutChange(e.target.value)}>
              <option value="Alt+Space">Alt+Space</option>
              <option value="Control+Space">Control+Space</option>
              <option value="Shift+Space">Shift+Space</option>
              {electron.remote.process.platform === 'darwin' &&
                <>
                  <option value="Command+Space">Command+Space</option>
                  <option value="Command+Shift+Space">Command+Shift+Space</option>
                  <option value="Command+Alt+Space">Command+Alt+Space</option>
                </>
              }
              {electron.remote.process.platform !== 'darwin' &&
                <>
                  <option value="Control+Shift+Space">Control+Shift+Space</option>
                  <option value="Control+Alt+Space">Control+Alt+Space</option>
                </>
              }
            </StyledSelect>
          </Item>
        }
      </Items>
    </Base>
  );
}

export default GeneralPreferences;
