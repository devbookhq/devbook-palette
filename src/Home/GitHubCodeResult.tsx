import React from 'react';
import styled from 'styled-components';

import { CodeResult } from 'search/gitHub';

const Container = styled.div`
  width: 100%;
  height: 200px;
  margin-bottom: 10px;
  display: flex;
`;

const Hotkeys = styled.div`
  margin-right: 10px;
  min-width: 150px;
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

const Result = styled.div`
  width: 100%;
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
  background: #212122;

  border-top-left-radius: 5px;
  border-top-right-radius: 5px;
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
  return (
    <Container>
      <Hotkeys>
        <Hotkey>
          Open in browser
        </Hotkey>
        <Hotkey>
          Copy code snippet
        </Hotkey>
      </Hotkeys>

      <Result>
        <Header>
          <FilePath>
            {codeResult.filePath}
          </FilePath>
          <RepoName>
            {codeResult.repoFullName}
          </RepoName>
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


