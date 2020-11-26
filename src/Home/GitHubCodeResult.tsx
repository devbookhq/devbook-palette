import React from 'react';
import styled from 'styled-components';

import { CodeResult } from 'search/gitHub';

const Container = styled.div`
  width: 100%;
  height: 200px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  border-radius: 5px;
  border: 1px solid #404244;
`;

const Header = styled.div`
  width: 100%;
  padding: 10px;
  display: flex;
  align-items: flex-end;
  background: #3A3D3E;
`;

const FilePath = styled.span`
  margin-right: 10px;
  color: white;
  font-weight: 500;
  font-size: 12px;
  font-family: 'Source Code Pro';
`;

const RepoName = styled.span`
  color: #B0B1B2;
  font-weight: 400;
  font-size: 12px;
  font-family: 'Source Code Pro';
`;

const Content = styled.div`
  flex: 1;
  padding: 10px;
  background: #2B2D2F;
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
  return (
    <Container>
      <Header>
        <FilePath>
          {codeResult.filePath}
        </FilePath>
        <RepoName>
          {codeResult.repoFullName}
        </RepoName>
      </Header>

      <Content>
        <CodeSnippet>
        </CodeSnippet>
      </Content>
    </Container>
  );
}

export default GitHubCodeResult;


