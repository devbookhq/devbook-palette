import React, { memo } from 'react';
import styled from 'styled-components';
import Highlight, { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/nightOwl';

import { FilePreview } from 'search/gitHub';

theme.plain.backgroundColor = '#272636';

const CodeWrapper = styled.div`
  width: 100%;
  height: 100%;
  /* background: #2B2D2F; */
  border-bottom-left-radius: 5px;
  border-bottom-right-radius: 5px;
`;

const CodeSnippet = styled.div`
  :not(:last-child) {
    border-bottom: 1px solid #404244;
  }
`;

const Pre = styled.pre`
  height: 100%;
  margin: 0;
  padding: 10px;
  overflow: hidden;

  font-family: 'Roboto Mono';
  font-weight: 600;
  font-size: 13px;
  line-height: 19px;
  text-align: left;

  :last-child {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }
`;

const LinesWrapper = styled.div`
  display: flex;
`;

const Line = styled.div`
  display: table-row;
`;

const LineNo = styled.span`
  padding-right: 1em;
  display: table-cell;
  user-select: none;

  color: #959697;
  text-align: right;
`;

const LineContent = styled.span`
  display: table-cell;
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
  background: #404244;
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

  for (const [i, line] of tokens.entries()) {
    // Assemble line number element
    const lineNoElement = (
      <Line {...getLineProps({ line, key: i })}>
        <LineNo>
          {preview.startLine + i}
        </LineNo>
      </Line>
    );
    linesNos.push(lineNoElement);

    // Assemble line element from tokens
    const tokens: JSX.Element[] = [];

    for (const [key, token] of line.entries()) {
      const tokenStartOffset = currentOffset;
      const tokenEndOffset = currentOffset + token.content.length;
      currentOffset = tokenEndOffset;

      const tokenProps = { ...getTokenProps({ token, key }) };
      const children = getMarkedContent(preview.indices, tokenProps.children, tokenStartOffset + i);

      const markedTokenProps = {
        ...tokenProps,
        children,
      };

      const element = <span {...markedTokenProps} />;
      tokens.push(element);
    }

    const lineElement = (
      <Line {...getLineProps({ line, key: i })}>
        <LineContent>
          {tokens}
        </LineContent>
      </Line>
    );
    lines.push(lineElement);
  }

  return (
    <LinesWrapper>
      <LinesNoWrapper>{linesNos}</LinesNoWrapper>
      <LinesContentWrapper>{lines}</LinesContentWrapper>
    </LinesWrapper>
  );
}

interface GitHubCode {
  filePreviews: FilePreview[];
}

const GitHubCode = memo(({ filePreviews }: GitHubCode) => {
  return (
    <CodeWrapper>
      <CodeSnippet>
        {filePreviews.map((preview, idx) => (
          <React.Fragment key={idx}>
            <>
              <Highlight
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
              </Highlight>
              {idx + 1 !== filePreviews.length && <Delimiter />}
            </>
          </React.Fragment>
        ))}
      </CodeSnippet>
    </CodeWrapper>
  );
});

export default GitHubCode;
