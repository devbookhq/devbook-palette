import React from 'react';
import styled from 'styled-components';
import Prism, { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/nightOwl';

import { FilePreview } from 'search/gitHub';

theme.plain.backgroundColor = '#272636';

const Container = styled.div`
  width: 100%;
  height: 100%;
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;

  :not(:last-child) {
    border-bottom: 1px solid #2F2E3C;
  }
`;

const Pre = styled.pre`
  height: 100%;
  margin: 0;
  padding: 10px;
  overflow: hidden;
  display: flex;

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
`;

const LinesNoWrapper = styled.div`
  display: table-column;
`;

const LinesContentWrapper = styled.div`
  display: table-column;
  overflow: auto;
`;

const Delimiter = styled.div`
  width: 100%;
  height: 1px;
  background: #2F2E3C;
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

  return Object.values(content)
    // Transform all chars from content and mark those that are in any ranges
    .map((char, i) => {
      const offset = startingOffset + i + 1;
      return {
        key: offset,
        content: char,
        marked: isInRange(ranges, offset),
      };
    })
    // Join continuos marked and unmarked sequences of chars and transform them to rendeable elements
    .reduce((newContent, curr, i, markedChars) => {
      if (curr.marked) {

        if (plainAccumulator.length > 0) {
          newContent.push(plainAccumulator);
          plainAccumulator = '';
        }

        markedAccumulator = markedAccumulator.concat(curr.content);
      } else {
        if (markedAccumulator.length > 0) {
          newContent.push(<MarkedSpan key={curr.key}>{markedAccumulator}</MarkedSpan>);
          markedAccumulator = '';
        }

        plainAccumulator = plainAccumulator.concat(curr.content);
      }

      if (i === markedChars.length - 1) {
        if (plainAccumulator.length > 0) {
          newContent.push(plainAccumulator);
        }
        if (markedAccumulator.length > 0) {
          newContent.push(<MarkedSpan key={curr.key}>{markedAccumulator}</MarkedSpan>);
        }
      }
      return newContent;
    }, [] as (string | JSX.Element)[]);
}

// TODO: Add correct types to arguments:
// tokens (Token[][]),
// getLineProps ((input: LineInputProps) => LineOutputProps), and
// getTokenProps ((input: TokenInputProps) => TokenOutputProps)
// I cannot get the types from prism-react-renderer because they are not explicitly exported
function getRenderableLines(preview: FilePreview, tokens: any, getLineProps: any, getTokenProps: any) {
  const linesNos: JSX.Element[] = [];
  const lines: JSX.Element[] = [];
  let currentOffset = 0;

  console.time('assemble code');

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

      const tokenProps = { ...getTokenProps({ token, key: j }) };
      const children = getMarkedContent(preview.indices, tokenProps.children, tokenStartOffset + i);

      const markedTokenProps = {
        ...tokenProps,
        children,
      };

      const element = <span {...markedTokenProps} />;
      outputTokens.push(element);
    }

    const lineElement = (
      <LineContent {...getLineProps({ line, key: i })}>
        {outputTokens}
      </LineContent>
    );
    lines.push(lineElement);
  }

  console.timeEnd('assemble code');

  return (
    <React.Fragment>
      <LinesNoWrapper>{linesNos}</LinesNoWrapper>
      <LinesContentWrapper>{lines}</LinesContentWrapper>
    </React.Fragment>
  );
}

interface GitHubCodeProps {
  filePreviews: FilePreview[];
}

function GitHubCode({ filePreviews }: GitHubCodeProps) {
  return (
    <Container>
      <div>
        {filePreviews.map((preview, idx) => (
          <React.Fragment key={idx}>
            <Prism
              {...defaultProps}
              code={preview.fragment}
              theme={theme}
              language="typescript" // TODO: Detect the fragment's language.
            >
              {({
                className,
                style,
                tokens,
                getLineProps,
                getTokenProps,
              }) => (
                  <Pre className={className} style={style}>
                    {getRenderableLines(preview, tokens, getLineProps, getTokenProps)}
                  </Pre>
                )}
            </Prism>
            {idx + 1 !== filePreviews.length && <Delimiter />}
          </React.Fragment>
        ))}
      </div>
    </Container>
  );
};

export default GitHubCode;
