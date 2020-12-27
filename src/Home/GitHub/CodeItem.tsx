import React, {
  useEffect,
  useRef,
  memo,
  useMemo,
} from 'react';
import styled from 'styled-components';

import { ReactComponent as externalLinkImg } from 'img/external-link.svg';
import { CodeResult } from 'search/gitHub';
import { openLink } from 'mainProcess';

import FocusState from '../SearchItemFocusState';
import Code from './Code';

const Container = styled.div<{ isFocused?: boolean }>`
  width: 100%;
  max-width: 100%;
  margin-bottom: 10px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  border-radius: 5px;
  border: 1px solid ${props => props.isFocused ? '#3A41AF' : '#262736'};

  :hover {
    border: 1px solid ${props => props.isFocused ? '3A41AF' : '#2C2F5A'};
    #code-header {
      background: ${props => props.isFocused ? '3A41AF' : '#2C2F5A'};
    }
  }
`;

const Header = styled.div<{ isFocused?: boolean }>`
  width: 100%;
  max-width: 100%;
  padding: 10px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;

  border-radius: 5px 5px 0 0;
  background: ${props => props.isFocused ? '#3A41AF' : '#262736'};

  :hover {
    cursor: ${props => props.isFocused ? 'default' : 'pointer'};
  }
`;

const RepoName = styled.span`
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
  text-decoration: underline;

  :hover {
    cursor: pointer;
  }
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

const Delimiter = styled.div`
  width: 100%;
  height: 1px;
  background: #2F2E3C;
`;

export interface CodeItemProps {
  codeResult: CodeResult;
  focusState: FocusState;
  onHeaderClick: (e: any) => void;
  onFilePathClick: (e: any) => void;
}

const CodeItem = memo(({
  codeResult,
  focusState,
  onHeaderClick,
  onFilePathClick,
}: CodeItemProps) => {
  const containerRef = useRef<HTMLDivElement>(null);

  function handleOpenExternalLinkButton() {
    openLink(codeResult.fileURL);
  }

  const memoizedCode = useMemo(() => {
    return codeResult.filePreviews.map((preview, i) =>
      <React.Fragment key={i}>
        <Code filePreview={preview} />
        {i + 1 !== codeResult.filePreviews.length && <Delimiter />}
      </React.Fragment>
    );
  }, [codeResult]);

  useEffect(() => {
    if (focusState === FocusState.WithScroll) containerRef?.current?.scrollIntoView();
  }, [focusState]);

  return (
    <Container
      ref={containerRef}
      isFocused={focusState !== FocusState.None}
    >
      <Header
        id="code-header"
        isFocused={focusState !== FocusState.None}
        onClick={onHeaderClick}
      >
        <RepoName>
          {codeResult.repoFullName}
        </RepoName>

        <FilePathWrapper>
          <FilePath
            onClick={onFilePathClick}
          >
            {codeResult.filePath}
          </FilePath>
          <ExternalLinkButton onClick={handleOpenExternalLinkButton}>
            <ExternalLinkImg />
          </ExternalLinkButton>
        </FilePathWrapper>
      </Header>

      {memoizedCode}
    </Container>
  );
});

export default CodeItem;
