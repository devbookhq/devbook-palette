import React, {
  useEffect,
  useRef,
  memo,
} from 'react';
import styled from 'styled-components';

import { CodeResult } from 'search/gitHub';
import GitHubCode from './GitHubCode';

const Container = styled.div<{ isFocused?: boolean }>`
  width: 100%;
  max-width: 100%;
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

      <GitHubCode
        filePreviews={codeResult.filePreviews}
      />

    </Container>
  );
});

export default GitHubCodeItem;
