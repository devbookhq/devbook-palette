import React, {
  useEffect,
  useRef,
  memo,
  useMemo,
} from 'react';
import styled from 'styled-components';

import { CodeResult } from 'search/gitHub';
import Code from './Code';

const Container = styled.div<{ isFocused?: boolean }>`
  width: 100%;
  max-width: 100%;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  border-radius: 5px;
  border: 1px solid ${props => props.isFocused ? '#3A41AF' : '#2F2E3C'};
`;

const Header = styled.div`
  width: 100%;
  max-width: 100%;
  padding: 10px;
  display: flex;
  flex-direction: column;
  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
`;

const RepoName = styled.div`
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #5A5A6F;
  font-weight: 500;
  font-size: 13px;
`;

const FilePath = styled.div`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  direction: rtl; // This so we can see the name of the file.
  text-align: left;
  color: #9CACC5;
  font-weight: 500;
  font-size: 13px;
`;

const CodeWrapper = styled.div`
  width: 100%;
`;

const Delimiter = styled.div`
  width: 100%;
  height: 1px;
  background: #2F2E3C;
`;

export interface GitHubCodeItemProps {
  codeResult: CodeResult;
  isFocused?: boolean;
}

const CodeItem = memo(({
  codeResult,
  isFocused,
}: GitHubCodeItemProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused) containerRef?.current?.scrollIntoView(false);
  }, [isFocused]);

  const MemoizedCode = useMemo(() => {
    return codeResult.filePreviews.map((preview, i) =>
      <React.Fragment>
        {Code({ filePreview: preview })}
        {i + 1 !== codeResult.filePreviews.length && <Delimiter />}
      </React.Fragment>
    );
  }, [codeResult]);

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
        {MemoizedCode}
      </CodeWrapper>

    </Container>
  );
});

export default CodeItem;
