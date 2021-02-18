import React, {
  useEffect,
  useCallback,
  useState,
} from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';

import * as Colors from 'newsrc/ui/colors';
import Tile from 'newsrc/Tile';
import { Resizable } from 're-resizable';

import { useExtensionsStore } from 'newsrc/extensions/extensions.store';
import { ExtensionID } from 'newsrc/extensions/extensionID';

// TODO: CSS-wise, this should probably be a grid?
const Container = styled.div`
  width: 100%;
  height: 100%;
  padding: 8px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  // flex: 1;
  // display: flex;
  // flex-wrap: wrap;
  // overflow-y: auto;
  overflow: auto;
  background: ${Colors.Charcoal.dark};
`;

const FirstTile = styled(Tile)`
  // margin: 8px;
  // height: 100%;
  // width: 50%;
  flex: 1;
  height: 100%;
  width: 100%;
  /*
  height: 648px;
  width: 440px;
  */

  /*
  position: relative;
  left: 24px;
  top: 16px;
  */

  border-bottom: 1px solid purple;
  border-right: 1px solid green;
`;

const TileInsideResizable = styled(Tile)`
  width: 100%;
  height: 100%;
`;

const SecondTile = styled(Tile)`
  margin: 12px;
  height: 432px;
  width: 400px;

  position: relative;
  /*
  left: 24px;
  top: 16px;
  */
`;

const SplitHorizontal = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: flex-start;
  // Yellow
  background: rgba(255, 0, 0, 0.2);
`;

const SplitVertical = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  // Green
  background: rgba(0, 255, 0, 0.2);
`;

function Board() {
  const [soResults, setSOResults] = useState<any[]>([]);

  const extensionsStore = useExtensionsStore();
  const stackoverflowExtension = extensionsStore.getExtension(ExtensionID.StackOverflow);

  const searchStackOverflow = useCallback(async (query: string) => {
    if (stackoverflowExtension?.isReady) {
      return (await stackoverflowExtension.search({ query })).results as any[];
    }
    console.log('Extension is not ready');
    return [] as any;
  }, [stackoverflowExtension?.isReady]);

  useEffect(() => {
    async function search() {
      const r = await searchStackOverflow('golang append buffer');
      console.log('FOUND', r);
      setSOResults(r);
    }
    search();
  }, [searchStackOverflow]);

  useEffect(() => {
    for (let el of document.getElementsByClassName("vertical-resizable")) {
      (el as HTMLElement).style.height = '50%';
    }
  }, []);

  return (
    <Container>
      <SplitVertical>

        <SplitHorizontal>
          <Resizable
            defaultSize={{
              width: '50%',
              height: '100%',
            }}
            grid={[16, 16]}
            minHeight="64"
            minWidth="10%"
            enable={{ right: true }}
          >

            <FirstTile
              isFocused
              results={soResults}
            />
          </Resizable>
          <FirstTile
            results={soResults}
          />
        </SplitHorizontal>

        <Resizable
          className="vertical-resizable"
          defaultSize={{
            width: '100%',
            height: '50px',
          }}
          grid={[16, 16]}
          enable={{ top: true }}
          minHeight="10%"
        >
          <FirstTile
            results={soResults}
          />
        </Resizable>
      </SplitVertical>
    </Container>
  );
}

export default observer(Board);
