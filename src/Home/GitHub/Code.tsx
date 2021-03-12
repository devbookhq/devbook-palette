import React, {
  useRef,
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';
import Prism, { defaultProps } from 'prism-react-renderer';
import theme from 'prism-react-renderer/themes/nightOwl';

import { FilePreview } from 'search/gitHub';

theme.plain.backgroundColor = '#1C1B26';
theme.plain.margin = '0';

const Container = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex: 1;
`;

const Pre = styled.pre`
  height: 100%;
  width: 100%;
  margin: 0;
  padding: 10px;
  display: flex;
  overflow: auto;

  background: transparent;

  font-family: 'Roboto Mono' !important;
  font-weight: 400 !important;
  font-size: 14px !important;
  line-height: 19px;
  text-align: left;

  :last-child {
    border-bottom-left-radius: 5px;
    border-bottom-right-radius: 5px;
  }
  :focus {
    border: 5px red;
  }
`;

const InfoMessage = styled.div`
  margin: auto;

  color: #5A5A6F;
  font-size: 16px;
  font-weight: 600;
`;

const LineNo = styled.div`
  padding-right: 1em;

  color: #5A5A6F;
  text-align: right;

  user-select: none;
`;

const LineContent = styled.div`
  margin-right: 1em;

  background: #1C1B26;
`;

const LinesNoWrapper = styled.div`
  display: table-column;
`;

const LinesContentWrapper = styled.div`
  display: table-column;
`;

const HighlightedResult = styled.span`
  background: #806416;

  font-weight: 600;
  color: white;

  box-shadow: 0 0 0 1px #806416;
`;

function isInRange(ranges: number[][], offset: number) {
  return ranges.some(([start, end]) => start < offset && end >= offset);
}

function getHighlightedContent(ranges: number[][], content: string, startingOffset: number) {
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
function getRenderableLines(
  preview: FilePreview,
  lines: any,
  getTokenProps: any,
  firstHighlightRef: React.RefObject<HTMLSpanElement>,
  ref: React.RefObject<HTMLDivElement>) {
  const assembledLinesNos: JSX.Element[] = [];
  const assembledLines: JSX.Element[] = [];

  let currentCharOffset = 0;
  let afterFirstHighlight = false;

  for (let lineIdx = 0; lineIdx < lines.length; lineIdx++) {
    const line = lines[lineIdx];
    // Assemble line number element
    const lineNoElement = (
      <LineNo key={lineIdx}>
        {preview.startLine + lineIdx}
      </LineNo>
    );
    assembledLinesNos.push(lineNoElement);

    // Assemble line element from tokens
    const assembledTokens: JSX.Element[] = [];

    for (let tokenIdx = 0; tokenIdx < line.length; tokenIdx++) {
      const token = line[tokenIdx];
      const tokenStartOffset = currentCharOffset;
      const tokenEndOffset = currentCharOffset + token.content.length;

      currentCharOffset = tokenEndOffset;

      const tokenProps = getTokenProps({ token, key: tokenIdx });
      const [children, hasHighlight] = getHighlightedContent(preview.indices, tokenProps.children, tokenStartOffset);

      assembledTokens.push(
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

    assembledLines.push(
      <LineContent key={lineIdx} ref={ref} tabIndex={0}>
        {assembledTokens}
      </LineContent>
    );

    currentCharOffset = currentCharOffset + 1;
  }

  return (
    <>
      <LinesNoWrapper>{assembledLinesNos}</LinesNoWrapper>
      <LinesContentWrapper>{assembledLines}</LinesContentWrapper>
    </>
  );
}

interface CodeProps {
  filePreview: FilePreview;
  className?: string;
  isInModal?: boolean;
}

function Code({
  filePreview,
  className,
  isInModal,
}: CodeProps) {
  const lineRef = useRef<HTMLDivElement>(null);
  const firstHighlightRef = useRef<HTMLSpanElement>(null);

  const [codeComponent, setCodeComponent] = useState<JSX.Element>();

  useEffect(() => {
    // setTimeout without any delay is a hack which puts it on the event loop stack and gives control to the event loop.
    // I'm not sure why the hack is needed.

    // TODO/HACK: When rendering Prism component in the useEffect the initial rendering takes a long time
    // and the hotkey panel is rendered after the whole Prism component.
    setTimeout(() => {
      if (isInModal && filePreview) {
        const component = <Prism
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
              <Pre
                className={className}
                style={style}
              >
                {getRenderableLines(filePreview, tokens, getTokenProps, firstHighlightRef, lineRef)}
              </Pre>
            )}
        </Prism>;

        setCodeComponent(component);
        // TODO/HACK: When using scrollIntoView without setTimeout, the scroll works only for the first opened modal view.
        setTimeout(() => firstHighlightRef.current?.scrollIntoView({ block: 'center', inline: 'end' }));
        lineRef?.current?.focus();
      }
    });
  }, [isInModal, filePreview]);

  return (
    <>
      <Container
        className={className}
      >
        {isInModal && !codeComponent && <InfoMessage>Loading...</InfoMessage>}
        {isInModal && codeComponent}
        {!isInModal &&
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
                <Pre
                  className={className}
                  style={style}
                >
                  {getRenderableLines(filePreview, tokens, getTokenProps, firstHighlightRef, lineRef)}
                </Pre>
              )}
          </Prism>
        }
      </Container>
    </>
  );
};

export default Code;
