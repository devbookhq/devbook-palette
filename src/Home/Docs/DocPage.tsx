import React, {
  useRef,
  useState,
  useEffect,
} from 'react';
import styled from 'styled-components';
import Prism from 'prismjs';

import useDebounce from 'hooks/useDebounce';
import { ReactComponent as chevronImg } from 'img/chevron.svg';

const Container = styled.div`
  flex: 1;
  padding: 10px 15px 20px;
  height: 100%;
  width: 100%;
  min-width: 1px;

  overflow: hidden;
  overflow-y: overlay;

  * {
    font-size: 14px;
    font-weight: 400;
    color: #e2e2e2;
  }

  strong {
    font-weight: 600;
    font-size: 14px;
  }

  hr {
    border: none;
    height: 1px;
    background-color: #535557;
    height: 0;
  }

  code {
    padding: 2px 4px;

    color: #D9D9DA;
    font-family: 'Roboto Mono';
    font-size: 14px;
    font-weight: 400;

    background: #23222D;
    border-radius: 3px;
  }

  blockquote {
    margin: 0 5px 0 10px;
    position: relative;
    padding: 0 15px;
    color: rgba(255, 255, 255, 0.8);

    :before {
      content: "";
      display: block;
      position: absolute;
      top: 0;
      bottom: 0;
      left: 0;
      width: 4px;
      border-radius: 8px;
      background: #555a5e;
    }
  }

  /* Code block */
  pre {
    padding: 10px;
    overflow-y: auto;

    background: #23222D;
    border-radius: 3px;

    code {
      padding: 0;
      background: transparent;
      line-height: 18px;
    }
  }

  h1 {
    margin: 0 0 15px;
    padding: 0 0 15px;
    font-size: 21px;
    font-weight: 600;
    border-bottom: 2px solid #5A5A6F;
  }

  h2 {
    font-size: 14px;
    font-weight: 600;
  }

  h3 {
    font-size: 14px;
  }

  a {
    color: #4CACD6;
    text-decoration: underline;
  }

  img {
    max-width: 100%;
    :hover {
      cursor: pointer;
    }
  }

  iframe {
    padding: 3px;
    border-radius: 5px;
    background: #fff;
  }

  .devbook-highlight {
    color: #000;
    background: #FFFF3F;

    font-size: inherit;
    font-weight: inherit;
    transition: none;
  }

  .devbook-highlight.selected {
    background: #e46804;
  }
`;

const SearchInputWrapper = styled.div`
  position: absolute;
  top: 115px;
  right: 20px;
  min-height: 50px;

  padding: 5px 10px;
  display: flex;
  align-items: center;
  background: #111013;
  border: 1px solid #434252;
  border-radius: 5px;
  box-shadow: 0px 4px 4px rgba(0, 0, 0, 0.8);
`;

const SearchInput = styled.input`
  width: 200px;
  color: white;
  font-family: 'Poppins';
  font-size: 14px;

  background: transparent;
  border: none;
  outline: none;

  ::placeholder {
    color: #5A5A6F;
  }
`;

const SearchDelimiter = styled.div`
  width: 1px;
  height: 25px;
  margin: 0 10px;
  background: #434252;
`;

const SearchControls = styled.div`
  padding: 0 5px;
  display: flex;
  justify-content: space-between;
`;

const HitCount = styled.span`
  min-width: 70px;
  text-align: right;
  font-size: 14px;
  color: #5A5A6F;
`;

const ChevronButton = styled.button`
  padding: 5px 0;

  border: none;
  background: none;
  outline: none;

  :hover {
    cursor: pointer;
    path {
      stroke: #fff;
    }
  }

  :first-child {
    margin-right: 10px;
  }
`;

const ChevronUp = styled(chevronImg)`
  transform: rotate(180deg);
`;

const ChevronDown = styled(chevronImg)`
`;

function getTextNodeChildren(node: Node) {
  let nodes: Node[] = [];
  for (let n = node.firstChild; n; n = n.nextSibling) {
    if (n.nodeType === Node.TEXT_NODE) nodes.push(n);
    nodes = nodes.concat(getTextNodeChildren(n));
  }
  return nodes;
}

function removeHighlight(node: Node) {
  if (!node.parentNode) throw new Error('Cannot remove highlight on a node without parent');
  if (node.childNodes.length === 0) throw new Error('Cannot remove highlight on a node without children');
  const textNode = node.childNodes[0];
  if (textNode.nodeType !== Node.TEXT_NODE || !textNode.nodeValue)
    throw new Error('Cannot remove highlight on a node that does not have a text node.');

  node.parentNode.insertBefore(document.createTextNode(textNode.nodeValue), node.nextSibling);
  node.parentNode.removeChild(node);
}

function highlightNode(textNode: Node, startIdx: number, endIdx: number) {
  if (textNode.nodeType !== Node.TEXT_NODE) throw new Error('Cannot highlight a node that is not of type TEXT_NODE');
  if (!textNode.nodeValue) return;

  const nodes: Node[] = [];
  const before = textNode.nodeValue.slice(0, startIdx);
  if (before) {
    nodes.push(document.createTextNode(before));
  }

  const highlight = textNode.nodeValue.slice(startIdx, endIdx+1);
  const highlightEl = document.createElement('mark');
  highlightEl.classList.add('devbook-highlight');
  highlightEl.innerText = highlight;
  nodes.push(highlightEl as Node);

  const after = textNode.nodeValue.slice(endIdx+1);
  if (after) {
    nodes.push(document.createTextNode(after));
  }

  if (textNode.parentNode) {
    nodes.forEach(newN => {
      textNode.parentNode!.insertBefore(newN, textNode);
    });
    if (nodes.length > 0) {
      textNode.parentNode.removeChild(textNode);
    }
    return highlightEl as Node;
  }
}

function highlightPattern(textNodes: Node[], startIdx: number, pattern: string) {
  let matchedLength = 0; // Length of a pattern substring that is already matched.
  let wholeText = '';
  const nodes: Node[] = [];
  for (let i = 0; i < textNodes.length; i++) {
    const n = textNodes[i];
    if (!n.nodeValue) continue;
    wholeText += n.nodeValue;

    // This node contains the starting index of the matched pattern.
    if (wholeText.length > startIdx && matchedLength < pattern.length) {
      // Convert startIdx to an index relative to the current node.
      // We must take the already matched pattern substring into an
      // account.
      const nodeStartIdx = (startIdx + matchedLength) - (wholeText.length - n.nodeValue.length);

      let nodeEndIdx = 0;
      if (pattern.length - matchedLength > n.nodeValue.length) {
        // The pattern is longer than this node. We want to highlight the whole node.
        nodeEndIdx = n.nodeValue.length - 1;
      } else {
        // The pattern is shorter and the same length is the current node
        // and starts anywhere in the middle of the node.
        nodeEndIdx = nodeStartIdx + (pattern.length - matchedLength - 1);
      }
      matchedLength += nodeEndIdx - nodeStartIdx + 1;
      const highlightedNode = highlightNode(n, nodeStartIdx, nodeEndIdx);
      if (highlightedNode) {
        nodes.push(highlightedNode);
      }
    }
  }
  return nodes;
}

function selectHighlight(highlight: Highlight) {
  highlight.nodes.forEach(n => {
    (n as HTMLElement).classList.add('selected');
  });
}

function deselectHighlight(highlight: Highlight) {
  highlight.nodes.forEach(n => {
    (n as HTMLElement).classList.remove('selected');
  });
}

interface Highlight {
  index: number;
  nodes: Node[];
}

interface DocPageProps {
  isSearchingInDocPage?: boolean;
  html: string;
  searchInputRef: any;
}

function DocPage({
  isSearchingInDocPage,
  html,
  searchInputRef,
}: DocPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 0);

  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  function highlightCode(html: string) {
    const el = document.createElement('html');
    el.innerHTML = html;

    /*
    if (el.getElementsByTagName('body').length > 0) {
      console.log('el.innerText', el.getElementsByTagName('body')[0].innerText);
    }
    */

    const codes = el.getElementsByTagName('code');
    for (const code of codes) {
      if (code.childNodes.length === 0) continue;
      const codeText = code.childNodes[0].nodeValue;
      if (codeText) {
        // TODO: We could use the correct langague highlight based on the documentation.
        const codeHTML = Prism.highlight(codeText, Prism.languages.clike, 'clike');
        code.innerHTML = codeHTML;
      }
    }

    const pres = el.getElementsByTagName('pre');
    for (const pre of pres) {
      if (pre.childNodes.length === 0) return;
      const text = pre.childNodes[0].nodeValue;
      if (text) {
        // TODO: We could use the correct langague highlight based on the documentation.
        const codeHTML = Prism.highlight(text, Prism.languages.clike, 'clike');
        pre.innerHTML = codeHTML;
      }
    }

    return el.outerHTML || '<html></html>';
  }

  function selectNextHighlight() {
    if (selectedIdx < highlights.length - 1) {
      deselectHighlight(highlights[selectedIdx]);
      selectHighlight(highlights[selectedIdx+1]);
      setSelectedIdx(c => c += 1);
    }
  }

  function selectPreviousHighlight() {
    if (selectedIdx > 0) {
      deselectHighlight(highlights[selectedIdx]);
      selectHighlight(highlights[selectedIdx-1]);
      setSelectedIdx(c => c -= 1);
    }
  }

  function handleSearchInputKeyDown(e: any) {
    // Enter pressed.
    if (e.keyCode === 13) {
      if (e.shiftKey) {
        selectPreviousHighlight();
      } else {
        selectNextHighlight();
      }
    }
  }

  useEffect(() => {
    containerRef?.current?.focus();
  }, [html]);

  useEffect(() => {
    highlights.forEach(h => {
      h.nodes.forEach(removeHighlight);
    });
    setHighlights([]);
    setSelectedIdx(0);

    if (!debouncedSearchQuery || !containerRef?.current) return;

    const textNodes = getTextNodeChildren(containerRef.current as Node);
    let wholeText = '';
    textNodes.map(n => {
      wholeText += n.nodeValue || '';
    });

    const escaped = debouncedSearchQuery
      .toLowerCase()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string.
    const re = new RegExp(escaped, 'g');
    let match: RegExpExecArray | null;
    let highlightIndex = 0;
    while ((match = re.exec(wholeText.toLowerCase())) !== null) {
      const nodes = highlightPattern([...textNodes], match.index, debouncedSearchQuery);

      const highlight: Highlight = { index: highlightIndex++, nodes };
      setHighlights(c => c.concat(highlight));

      // Select the first highlight
      if (highlight.index === 0) selectHighlight(highlight);
      //highlightIndex += 1;
    }
  }, [setHighlights, debouncedSearchQuery]);

  return (
    <>
      {isSearchingInDocPage &&
        <SearchInputWrapper>
          <SearchInput
            ref={searchInputRef}
            autoFocus
            placeholder="Search in page"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchInputKeyDown}
          />
          <HitCount>
            <>
            {searchQuery &&
              <>
                {highlights.length > 0 &&
                  <span>{selectedIdx+1}/{highlights.length}</span>
                }
                {highlights.length === 0 &&
                  <span>0/0</span>
                }
              </>
            }
            </>
          </HitCount>
          <SearchDelimiter/>
          <SearchControls>
            <ChevronButton
              onClick={selectNextHighlight}
            >
              <ChevronDown/>
            </ChevronButton>

            <ChevronButton
              onClick={selectPreviousHighlight}
            >
              <ChevronUp/>
            </ChevronButton>
          </SearchControls>
        </SearchInputWrapper>
      }
      <Container
        id="doc-page"
        ref={containerRef}
        tabIndex={0}
        dangerouslySetInnerHTML={{__html: highlightCode(html) as string}}
      />
    </>
  );
}

export default DocPage;

