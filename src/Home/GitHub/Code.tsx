import React from 'react';
import styled from 'styled-components';
import Prism, { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/nightOwl';

import { FilePreview } from 'search/gitHub';

theme.plain.backgroundColor = 'rgb(39, 38, 54)';

const Container = styled.div`
  width: 100%;
  height: 80%;
`;

const Pre = styled.pre`
  height: 100%;
  margin: 0;
  padding: 10px;
  display: flex;
  overflow: auto;

  background: transparent;

  font-family: 'Roboto Mono';
  font-weight: 500;
  font-size: 13px;
  line-height: 19px;
  text-align: left;

  :last-child {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }
`;

const LineNo = styled.div`
  padding-right: 1em;
  user-select: none;

  color: #5A5A6F;
  text-align: right;
`;

const LineContent = styled.div`
  margin-right: 1em;
  background: rgb(39, 38, 54);
`;

const LinesNoWrapper = styled.div`
  display: table-column;
`;

const LinesContentWrapper = styled.div`
  display: table-column;
`;

const MarkedSpan = styled.span`
  font-weight: 600;
  background: #806416;
  color: white;
  box-shadow: 0 0 0 1px #806416;
`;

function isInRange(ranges: number[][], offset: number) {
  return ranges.some(([start, end]) => start < offset && end >= offset);
}

function getMarkedContent(ranges: number[][], content: string, startingOffset: number) {
  let markedAccumulator = '';
  let plainAccumulator = '';

  const newContent = [];

  for (let i = 0; i < content.length; i++) {
    const offset = i + startingOffset + 1;
    const isMarked = isInRange(ranges, offset);
    const char = content[i];

    if (isMarked) {
      if (plainAccumulator.length > 0) {
        newContent.push(plainAccumulator);
        plainAccumulator = '';
      }

      markedAccumulator = markedAccumulator.concat(char);
    } else {
      if (markedAccumulator.length > 0) {
        newContent.push(<MarkedSpan key={offset}>{markedAccumulator}</MarkedSpan>);
        markedAccumulator = '';
      }

      plainAccumulator = plainAccumulator.concat(char);
    }
  }

  if (plainAccumulator.length > 0) {
    newContent.push(plainAccumulator);
  }
  if (markedAccumulator.length > 0) {
    newContent.push(<MarkedSpan key="last">{markedAccumulator}</MarkedSpan>);
  }

  return newContent;
}

// TODO: Add correct types to arguments:
// tokens (Token[][]), and
// getTokenProps ((input: TokenInputProps) => TokenOutputProps)
// I cannot get the types from prism-react-renderer because they are not explicitly exported
function getRenderableLines(preview: FilePreview, tokens: any, getTokenProps: any) {
  const linesNos: JSX.Element[] = [];
  const lines: JSX.Element[] = [];
  let currentOffset = 0;

  for (let i = 0; i < tokens.length; i++) {
    const line = tokens[i];
    // Assemble line number element
    const lineNoElement = (
      <LineNo key={i}>
        {preview.startLine + i}
      </LineNo>
    );
    linesNos.push(lineNoElement);

    // Assemble line element from tokens
    const outputTokens: JSX.Element[] = [];

    for (let j = 0; j < line.length; j++) {
      const token = line[j];
      const tokenStartOffset = currentOffset;
      const tokenEndOffset = currentOffset + token.content.length;
      currentOffset = tokenEndOffset;

      const tokenProps = getTokenProps({ token, key: j });
      const children = getMarkedContent(preview.indices, tokenProps.children, tokenStartOffset + i);

      outputTokens.push(
        <span
          key={tokenProps.key}
          style={tokenProps.style}
          className={tokenProps.className}
          children={children}
        />
      );
    }

    lines.push(
      <LineContent key={i}>
        {outputTokens}
      </LineContent>
    );
  }

  return (
    <>
      <LinesNoWrapper>{linesNos}</LinesNoWrapper>
      <LinesContentWrapper>{lines}</LinesContentWrapper>
    </>
  );
}

interface CodeProps {
  filePreview: FilePreview;
  className?: string;
}

function Code({ filePreview, className }: CodeProps) {
  return (
    <Container className={className}>
      <Prism
        {...defaultProps}
        code={filePreview.fragment}
        theme={theme}
        language="typescript" // TODO: Detect the fragment's language.
      >
        {({
          className,
          style,
          tokens,
          getTokenProps,
        }) => (
            <Pre className={className} style={style}>
              {getRenderableLines(filePreview, tokens, getTokenProps)}
            </Pre>
          )}
      </Prism>
    </Container>
  );
};

export default Code;
