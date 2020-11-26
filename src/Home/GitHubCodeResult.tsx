import React from 'react';
import styled from 'styled-components';

const Container = styled.div`
  width: 100%;
  height: 200px;
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

}

function GitHubCodeResult() {
  return (
    <Container>
      <Header>
        <FilePath>
          path/to/the/file/in/repo.ts
        </FilePath>
        <RepoName>
          repo-owner/repo-name
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


