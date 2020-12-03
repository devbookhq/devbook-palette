import React from 'react';
import styled from 'styled-components';

import { CodeResult, FilePreview } from 'search/gitHub';
import Modal from 'components/Modal';

import GitHubCode from './GitHubCode';

const marginTop = 60;

const StyledModal = styled(Modal)`
  width: 100%;
  height: calc(100vh - ${marginTop}px);
  margin-top: ${marginTop}px;

  overflow-y: auto;
  background: #212122;
  border-radius: 20px 20px 0 0;
`;

function transformFragmentPreviewsToFilePreview(filePreviews: FilePreview[], fileContent: string): FilePreview {
  // Add starting lines so we can scroll there
  const indices = filePreviews
    .flatMap(preview => preview.indices.map(indices => indices.map(i => i + preview.startingOffset)));

  return {
    indices,
    fragment: fileContent,
    startLine: 1,
    startingOffset: 0,
  };
}

interface GitHubCodeModalProps {
  codeResult: CodeResult;
  onCloseRequest: () => void;
}

function GitHubCodeModal({
  codeResult,
  onCloseRequest,
}: GitHubCodeModalProps) {
  const wholeFilePreviews = [transformFragmentPreviewsToFilePreview(codeResult.filePreviews, codeResult.fileContent)];
  return (
    <StyledModal
      onCloseRequest={onCloseRequest}
    >
      <GitHubCode
        filePreviews={wholeFilePreviews}
      />

    </StyledModal>
  );
}

export default GitHubCodeModal;
