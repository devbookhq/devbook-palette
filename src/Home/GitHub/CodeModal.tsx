import React from 'react';
import styled from 'styled-components';

import { CodeResult, FilePreview } from 'search/gitHub';
import Modal from 'components/Modal';
import Code from './Code';
import { openLink } from 'mainProcess';
import { createTmpFile } from 'mainProcess';

const marginTop = 60;

const StyledModal = styled(Modal)`
  width: 100%;
  height: calc(100vh - ${marginTop}px);
  margin-top: ${marginTop}px;

  background: #1C1B26;
  border-radius: 20px 20px 0 0;
`;

const StyledCode = styled(Code)`
  height: calc(100% - ${marginTop}px);
`;

const Header = styled.div`
  width: 100%;
  max-width: 100%;
  padding: 10px;

  display: flex;
  overflow: hidden;
  flex-direction: column;

  border-radius: 5px 5px 0 0;
  background: #3A41AF;
  box-shadow: 0 -10px 20px rgba(0, 0, 0, 0.15);
`;

const RepoName = styled.div`
  margin-bottom: 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  color: #fff;
  font-weight: 500;
  font-size: 13px;
`;

const FilePath = styled.div`
  display: flex;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  direction: rtl; // This so we can see the name of the file.

  color: #fff;
  font-weight: 600;
  font-size: 14px;
  text-align: left;
  text-decoration: underline;

  :hover {
    cursor: pointer;
  }
`;

interface CodeModalProps {
  codeResult: CodeResult;
  onCloseRequest: () => void;
}

function CodeModal({
  codeResult,
  onCloseRequest,
}: CodeModalProps) {
  const filePreview: FilePreview = {
    indices: codeResult.absoluteIndices,
    fragment: codeResult.fileContent,
    startLine: 1,
  };

  async function openFileInVSCode() {
    const tmpPath = await createTmpFile({
      filePath: codeResult.filePath,
      fileContent: codeResult.fileContent,
    });
    if (tmpPath) {
      const vscodeFileURL = `vscode://file/${tmpPath}`;
      await openLink(vscodeFileURL);
    } else {
      console.log('Cannot create tmp file with code.')
    }
  }

  return (
    <StyledModal
      onCloseRequest={onCloseRequest}
    >
      <Header>
        <RepoName>
          {codeResult.repoFullName}
        </RepoName>
        <FilePath onClick={openFileInVSCode}>
          {codeResult.filePath}
        </FilePath>
      </Header>

      <StyledCode
        filePreview={filePreview}
        isFocused={true}
        isInModal={true}
      />

    </StyledModal>
  );
}

export default CodeModal;
