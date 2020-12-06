import React, {
  useRef,
  useEffect,
} from 'react';
import styled from 'styled-components';
import Prism, { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/nightOwl';

import { FilePreview } from 'search/gitHub';

theme.plain.backgroundColor = 'rgb(39, 38, 54)';

const Container = styled.div`
  width: 100%;
  height: 100%;
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

const HighlightedResult = styled.span`
  font-weight: 600;
  background: #806416;
  color: white;
  box-shadow: 0 0 0 1px #806416;
`;

function isInRange(ranges: number[][], offset: number) {
  return ranges.some(([start, end]) => start < offset && end >= offset);
}

function getMarkedContent(ranges: number[][], content: string, startingOffset: number) {
  let highlightAccumulator = '';
  let plainAccumulator = '';

  let hasHighlight = false;

  const newContent = [];

  for (let i = 0; i < content.length; i++) {
    const offset = i + startingOffset + 1;
    const isHighlighted = isInRange(ranges, offset);
    const char = content[i];

    if (isHighlighted) {
      hasHighlight = true;

      if (plainAccumulator.length > 0) {
        newContent.push(plainAccumulator);
        plainAccumulator = '';
      }

      highlightAccumulator = highlightAccumulator.concat(char);
    } else {
      if (highlightAccumulator.length > 0) {
        newContent.push(<HighlightedResult key={offset}>{highlightAccumulator}</HighlightedResult>);
        highlightAccumulator = '';
      }

      plainAccumulator = plainAccumulator.concat(char);
    }
  }

  if (plainAccumulator.length > 0) {
    newContent.push(plainAccumulator);
  }
  if (highlightAccumulator.length > 0) {
    newContent.push(<HighlightedResult key="last">{highlightAccumulator}</HighlightedResult>);
  }

  return [newContent, hasHighlight];
}

// TODO: Add correct types to arguments:
// tokens (Token[][]), and
// getTokenProps ((input: TokenInputProps) => TokenOutputProps)
// I cannot get the types from prism-react-renderer because they are not explicitly exported
function getRenderableLines(preview: FilePreview, tokens: any, getTokenProps: any, firstHighlightRef: any, containerRef: any) {
  const linesNos: JSX.Element[] = [];
  const lines: JSX.Element[] = [];
  let currentOffset = 0;

  let afterFirstHighlight = false;

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
      const [children, hasHighlight] = getMarkedContent(preview.indices, tokenProps.children, tokenStartOffset + i);

      outputTokens.push(
        <span
          ref={hasHighlight && !afterFirstHighlight ? firstHighlightRef : undefined}
          key={tokenProps.key}
          style={tokenProps.style}
          className={tokenProps.className}
          children={children}
        />
      );

      afterFirstHighlight = afterFirstHighlight || !!hasHighlight;
    }

    lines.push(
      <LineContent key={i}>
        {outputTokens}
      </LineContent>
    );
  }

  return (
    <>
      <LinesNoWrapper ref={containerRef}>{linesNos}</LinesNoWrapper>
      <LinesContentWrapper>{lines}</LinesContentWrapper>
    </>
  );
}

interface CodeProps {
  filePreview: FilePreview;
  className?: string;
  isFocused?: boolean;
}

function Code({
  filePreview,
  className,
  isFocused,
}: CodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const firstHighlightRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isFocused && containerRef.current && firstHighlightRef.current) {
      // TODO: Scroll to the top of the preview without using ref.
      containerRef?.current?.scrollIntoView({ inline: 'end' });

      // TODO/HACK: scrollIntoView is only working here in the first opened code modal view when called normally.
      // setTimeout without any delay is a hack which puts it on the event loop stack and gives control to the event loop.
      setTimeout(() => {
        firstHighlightRef?.current?.scrollIntoView({ block: 'center', behavior: 'smooth', inline: 'end' })
      });
    }
  }, [isFocused, firstHighlightRef, filePreview, containerRef]);

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
              {getRenderableLines(filePreview, tokens, getTokenProps, firstHighlightRef, containerRef)}
            </Pre>
          )}
      </Prism>
    </Container>
  );
};

export default Code;
