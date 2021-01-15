import React, {
  useState,
  useRef,
} from 'react';
import styled from 'styled-components';

import { openLink } from 'mainProcess';
import useOnClickOutside from 'hooks/useOnClickOutside';
import {
  CodeResult,
  FilePreview,
} from 'search/gitHub';
import Modal from 'components/Modal';
import { ReactComponent as externalLinkImg } from 'img/external-link.svg';

import Code from './Code';

const marginTop = 110;
const headerHeight = 63;

const StyledModal = styled(Modal)`
  position: relative;
  bottom: 50px;
  width: 100%;
  height: calc(100vh - ${marginTop}px);
  margin-top: ${marginTop}px;

  background: #1C1B26;
  border-radius: 20px 20px 0 0;
`;

const StyledCode = styled(Code)`
  // '6px' is basically a padding so the last line is readable because HotkeysPanel has box-shadow.
  height: calc(100% - ${headerHeight}px - 6px);
`;

const Header = styled.div`
  header: ${headerHeight}px;
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

const FilePathWrapper = styled.div`
  display: flex;
  align-items: center;
`;

const FilePath = styled.span`
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  direction: rtl; // This so we can see the name of the file.
  text-align: left;

  color: #fff;
  font-weight: 600;
  font-size: 14px;
`;

const ExternalLinkButton = styled.button`
  position: relative;
  top: 2px;

  background: none;
  border: none;
  outline: none;

  :hover {
    path {
      stroke: #fff;
      cursor: pointer;
    }
  }
`;

const ExternalLinkImg = styled(externalLinkImg)`
  height: auto;
  width: 12px;

  path {
    stroke: #9CACC5;
  }

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
  const modalRef = useRef<HTMLDivElement>(null);
  const [filePreview] = useState<FilePreview>({
    indices: codeResult.absoluteIndices,
    fragment: codeResult.fileContent,
    startLine: 1,
  });
  useOnClickOutside(modalRef, onCloseRequest);

  async function handleOpenExternalLinkButton() {
    const firstPreview = codeResult.filePreviews[0];
    const gitHubFileURL = firstPreview ? `${codeResult.fileURL}#L${firstPreview.startLine + 3}` : codeResult.fileURL;
    return openLink(gitHubFileURL);
  }

  return (
    <StyledModal
      ref={modalRef}
      onCloseRequest={onCloseRequest}
    >
      <Header>
        <RepoName>
          {codeResult.repoFullName}
        </RepoName>

        <FilePathWrapper>
          <FilePath>
            {codeResult.filePath}
          </FilePath>
          <ExternalLinkButton onClick={handleOpenExternalLinkButton}>
            <ExternalLinkImg />
          </ExternalLinkButton>
        </FilePathWrapper>
      </Header>

      <StyledCode
        filePreview={filePreview}
        isInModal
      />
    </StyledModal>
  );
}

export default CodeModal;
