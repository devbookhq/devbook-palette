import React from 'react';
import styled from 'styled-components';

import * as Colors from 'newsrc/ui/colors';
import Tile from 'newsrc/Tile';


import { ExtensionsContext } from 'Extensions';

// TODO: CSS-wise, this should probably be a grid?
const Container = styled.div`
  flex: 1;
  display: flex;
  background: ${Colors.Charcoal.dark};
`;

const FirstTile = styled(Tile)`
  height: 648px;
  width: 440px;

  position: relative;
  left: 16px;
  top: 16px;
`;

const SecondTile = styled(Tile)`
  height: 432px;
  width: 400px;

  position: relative;
  left: 24px;
  top: 16px;
`;

function Board() {
  const [soResults, setSOResults] = React.useState<any[]>([]);


  const extensionManager = React.useContext(ExtensionsContext);
  const stackoverflowExtension = extensionManager?.extensions.stackoverflow;

  const searchStackOverflow = React.useCallback(async (query: string) => {
    if (stackoverflowExtension?.isReady) {
      return (await stackoverflowExtension.search({ query })).results as unknown as any[];
    }
    return [];
  }, [extensionManager]);

  React.useEffect(() => {
    async function search() {
      const r = await searchStackOverflow('golang append buffer');
      console.log('FOUND', r);
      setSOResults(r);
    }
    search();
  }, []);

  return (
    <Container>
      <FirstTile
        isFocused
        results={soResults}
      />
      <SecondTile
        results={soResults}
      />
    </Container>
  );
}

export default Board;

