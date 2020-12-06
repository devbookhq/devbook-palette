import React from 'react';
import styled from 'styled-components';

import { CodeResult, FilePreview } from 'search/gitHub';
import Modal from 'components/Modal';
import Code from './Code';

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

  return (
    <StyledModal
      onCloseRequest={onCloseRequest}
    >
      <Header>
        <RepoName>
          {codeResult.repoFullName}
        </RepoName>
        <FilePath>
          {codeResult.filePath}
        </FilePath>
      </Header>

      <StyledCode
        isFocused={true}
        filePreview={filePreview}
      />

    </StyledModal>
  );
}

export default CodeModal;
