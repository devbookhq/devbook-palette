import React, {
  useLayoutEffect,
  useState,
  useRef,
  memo,
} from 'react';
import styled from 'styled-components';
import Highlight, { defaultProps } from 'prism-react-renderer';
import dracula from 'prism-react-renderer/themes/dracula';

import { CodeResult } from 'search/gitHub';

const hotkeysWidth = 150;
const hotkeysMarginRight = 10;
const headerPadding = 10;

const Container = styled.div`
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
  font-weight: 500;

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
  font-weight: 500;
  font-size: 13px;
`;

const FilePath = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  direction: rtl; // This so we can see the name of the file.
  text-align: left;

  color: #676767;
  font-weight: 500;
  font-size: 13px;
`;

const CodeWrapper = styled.div`
  width: 100%;
  height: 100%;
  background: #2B2D2F;

  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
`;

const CodeSnippet = styled.div`
  :not(:last-child) {
    border-bottom: 1px solid #404244;
  }
`;

const Pre = styled.pre`
  height: 100%;
  margin: 0;
  padding: 8px;

  text-align: left;
  overflow: auto;
  font-size: 14px;
  line-height: 22px;
`;

const Line = styled.div`
  display: table-row;
`;

const LineNo = styled.span`
  display: table-cell;
  text-align: right;
  padding-right: 1em;
  user-select: none;
  opacity: 0.5;
`;

const LineContent = styled.span`
  display: table-cell;
`;

export interface GitHubCodeResultProps {
  codeResult: CodeResult;
}

const GitHubCodeResult = memo(({ codeResult }: GitHubCodeResultProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useLayoutEffect(() => {
    function resizeListener(e: any) {
      if (!containerRef?.current) return;
      setContainerWidth(containerRef.current.offsetWidth);
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
      {/*
      <Hotkeys>
        <Hotkey>
          Open in browser
        </Hotkey>
        <Hotkey>
          Copy code snippet
        </Hotkey>
      </Hotkeys>
      */}

      <Result
        // 'headerPadding * 2' because padding is applied to both left and right.
        // The reason we set width to 100% when props.width is zero is so the Result div isn't shrinked on the initial render.
        // width={(containerWidth - hotkeysWidth + hotkeysMarginRight) - headerPadding * 2}
        width={containerWidth}
      >
        <Header>
          <RepoName>
            {codeResult.full_name}
          </RepoName>
          <FilePath>
            {codeResult.file_path}
          </FilePath>
        </Header>

        <CodeWrapper>
          <CodeSnippet>
            {codeResult.text_matches.map((m, idx) => (
              <React.Fragment key={idx}>
                {/* This makes sure we show only code hits. */}
                {m.property === 'content' && (
                  <Highlight
                    {...defaultProps}
                    code={m.fragment}
                    theme={dracula}
                    language="typescript" // TODO: Detect the fragment's language.
                  >
                    {({
                      className,
                      style,
                      tokens,
                      getLineProps,
                      getTokenProps
                    }) => (
                      <Pre className={className} style={style}>
                        {tokens.map((line, i) => (
                          <Line {...getLineProps({ line, key: i })}>
                            <LineNo>{i + 1}</LineNo>
                            <LineContent>
                              {line.map((token, key) => (
                                <span {...getTokenProps({ token, key })} />
                              ))}
                            </LineContent>
                          </Line>
                        ))}
                      </Pre>
                    )}
                  </Highlight>
                )}
              </React.Fragment>
            ))}
          </CodeSnippet>
        </CodeWrapper>
     </Result>
    </Container>
  );
});

export default GitHubCodeResult;

