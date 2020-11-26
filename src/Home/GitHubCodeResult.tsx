import React, {
  useLayoutEffect,
  useState,
  useRef,
} from 'react';
import styled from 'styled-components';

import { CodeResult } from 'search/gitHub';

const hotkeysWidth = 150;
const hotkeysMarginRight = 10;
const headerPadding = 10;

const Container = styled.div`
  height: 200px;
  margin-bottom: 10px;
  display: flex;
`;

const Hotkeys = styled.div`
  margin-right: ${hotkeysMarginRight}px;
  min-width: ${hotkeysWidth}px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const Hotkey = styled.div`
  padding: 5px;
  width: 100%;

  color: white;
  font-size: 13px;
  font-weight: 400;

  background: #2B2D2F;
  border-radius: 5px;

  :not(:last-child) {
    margin-bottom: 10px;
  }
`;

const Result = styled.div<{ width: number }>`
  width: ${props => props.width > 0 ? props.width + 'px' : '100%'};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 5px;
  border: 1px solid #404244;
`;

const Header = styled.div`
  max-width: 100%;
  padding: ${headerPadding}px;
  display: flex;
  flex-direction: column;
  background: #212122;

  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
`;

const RepoName = styled.div`
  margin-bottom: 5px;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  color: #B0B1B2;
  font-weight: 400;
  font-size: 13px;
  font-family: 'Source Code Pro';
`;

const FilePath = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  direction: rtl; // This so we can see the name of the file.

  color: white;
  font-weight: 500;
  font-size: 13px;
  font-family: 'Source Code Pro';
`;

const CodeWrapper = styled.div`
  width: 100%;
  height: 100%;
  padding: 10px;
  background: #2B2D2F;

  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
`;

const CodeSnippet = styled.div`
  :not(:last-child) {
    border-bottom: 1px solid #404244;
  }
`;

export interface GitHubCodeResultProps {
  codeResult: CodeResult;
}

function GitHubCodeResult({ codeResult }: GitHubCodeResultProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    function resizeListener(e: any) {
      if (!containerRef?.current) return;
      const style = window.getComputedStyle(containerRef.current);
      /*
      const widthMargin = parseInt(style.paddingLeft)
        + parseInt(style.paddingRight)
        + parseInt(style.borderTopWidth)
        + parseInt(style.borderBottomWidth)
        + parseInt(style.marginTop)
        + parseInt(style.marginBottom);
     */

      // const noMarginHeight = uiContainerRef.current.offsetHeight - heightMargin;
      const widthWithoutMargin = containerRef.current.offsetWidth;
      setContainerWidth(widthWithoutMargin);
    }

    window.addEventListener('resize', resizeListener);

    // This is a hack to get a correct height of the container.
    // The other solution is to get the height of the container
    // on the initial render but that solution returned an incorrect
    // value. I'm not sure why.
    // The value is correct once you resize the window though.
    window.resizeTo(window.outerWidth, window.outerHeight + 1);
    window.resizeTo(window.outerWidth, window.outerHeight - 1);

    return () => window.removeEventListener('resize', resizeListener);
  }, [containerRef, setContainerWidth]);

  return (
    <Container ref={containerRef}>
      <Hotkeys>
        <Hotkey>
          Open in browser
        </Hotkey>
        <Hotkey>
          Copy code snippet
        </Hotkey>
      </Hotkeys>

      <Result
        // 'headerPadding * 2' because padding is applied to both left and right.
        // The reason we set width to 100% when props.width is zero is so the Result div isn't shrinked on the initial render.
        width={(containerWidth - hotkeysWidth + hotkeysMarginRight) - headerPadding * 2}
      >
        <Header>
          <RepoName>
            {codeResult.repoFullName}
          </RepoName>
          <FilePath>
            {codeResult.filePath}
          </FilePath>
        </Header>

        <CodeWrapper>
          <CodeSnippet>
          </CodeSnippet>
        </CodeWrapper>
     </Result>
    </Container>
  );
}

export default GitHubCodeResult;

