import React, {
  useEffect,
  useRef,
  memo,
} from 'react';
import styled from 'styled-components';
import Highlight, { defaultProps } from 'prism-react-renderer';
import dracula from 'prism-react-renderer/themes/dracula';

import { CodeResult } from 'search/gitHub';

const Container = styled.div<{ isFocused?: boolean }>`
  width: 100%;
  max-width: 100%;
  padding-bottom: 10px;
  margin-bottom: 10px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  border-radius: 5px;
  border: 1px solid ${props => props.isFocused ? '#5d9bd4' : '#404244'};
`;

const Header = styled.div`
  width: 100%;
  max-width: 100%;
  padding: 10px;

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

  color: #676767;
  font-weight: 500;
  font-size: 13px;
`;

const FilePath = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  direction: rtl; // This so we can see the name of the file.
  text-align: left;

  color: #B0B1B2;
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
  padding: 10px;

  text-align: left;
  overflow: auto;
  font-size: 13px;
  line-height: 17px;

  :last-child {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }
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

export interface GitHubCodeItemProps {
  codeResult: CodeResult;
  isFocused?: boolean;
}

const GitHubCodeItem = memo(({
  codeResult,
  isFocused,
}: GitHubCodeItemProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused) containerRef?.current?.scrollIntoView(false);
  }, [isFocused]);

  return (
    <Container
      ref={containerRef}
      isFocused={isFocused}
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
          {codeResult.filePreviews.map((el, idx) => (
            <React.Fragment key={idx}>
              <>
                <Highlight
                  {...defaultProps}
                  code={el.fragment}
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
                          <LineNo>{el.startLine + i + 1}</LineNo>
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
                {/* This makes sure we show only code hits. */}
                {/*
                {m.property === 'content' && (
                )}
                */}
              </>
            </React.Fragment>
          ))}
        </CodeSnippet>
      </CodeWrapper>
    </Container>
  );
});

export default GitHubCodeItem;

