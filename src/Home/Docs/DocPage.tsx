import React, {
  useRef,
  useState,
  useEffect,
} from 'react';
import styled from 'styled-components';
import Prism from 'prismjs';

import { useHotkeys } from 'react-hotkeys-hook';

import { openLink } from 'mainProcess';
import useDebounce from 'hooks/useDebounce';
import { ReactComponent as chevronImg } from 'img/chevron.svg';

const DocPageContainer = styled.div`
  flex: 1;
  padding: 10px 15px 20px;
  height: 100%;
  width: 100%;
  min-width: 1px;
  // background: #1b1b1b;
  background: #1f1e1e;

  //color: #E3E3E3;
  color: #c1c9d2;
  //color: #ced3d8;
  font-size: 14px;
  line-height: 1.65em;
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Ubuntu,sans-serif;

  overflow: hidden;
  overflow-y: overlay;

  h1 {
    margin: 0;
    padding: 15px 0 10px;
    color: #dcdcdc;
    font-weight: 600;
    font-size: 24px;
    border-bottom: 1px solid #3B3A4A;
  }

  h2 {
    margin: 0;
    padding: 15px 0 10px;
    color: #dcdcdc;
    font-weight: 600;
    font-size: 20px;
  }

  h3 {
    margin: 0;
    padding: 15px 0 10px;
    color: #dcdcdc;
    font-weight: 500;
    font-size: 18px;
  }

  h4 {
    margin: 0;
    padding: 15px 0 10px;
    color: #dcdcdc;
    font-weight: 500;
    font-size: 16px;
  }

  p {
    margin: 10px 0;
  }

  ul {
    padding-left: 40px;
    li {
      :not(:last-child) {
        margin-bottom: 10px;
      }
    }
  }

  code {
    padding: 2px 4px;

    color: #D9D9DA;
    font-family: 'Roboto Mono';
    font-size: 13px;
    font-weight: 400;

    background: #2a2933;
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

    font-size: 13px;
    font-weight: 500;
    font-family: 'Roboto Mono';
    background: #373648;
    border-left: 4px solid #5861d6;
    border-radius: 3px;

    code {
      padding: 0;
      background: transparent;
      line-height: 1.4em;
    }
  }

  a {
    color: #4CACD6;
    text-decoration: underline;
    code {
      text-decoration: none;
    }
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

  /* MDN Specific (JS) */
  .badge {
    font-family: 'Roboto Mono';
    font-weight: 600;
    text-transform: lowercase;
    font-size: 13px;
    color: #87929c;
  }

  // Section titles.
  #description,
  #parameters,
  #return_value,
  #constructor,
  #static_methods,
  #instance_methods,
  #examples {
    border-bottom: 1px solid #3B3A4A;
  }

  dl {
    margin: 10px 0 0;
    dt {
      margin-top: 10px;
      code {
        font-weight: 500;
        background: transparent;
      }
    }

    dd {
      margin: 5px 0 0 15px;
      // Nested <dl> should have spacing.
      dl {
        margin-top: 10px;
      }

      p:first-child {
        margin-top: 0;
      }
    }
  }

  .notecard.note {
    margin: 5px 0;
    padding: 1px 15px;
    background: #1C2443;
    border-left: 4px solid #1F4AE5;
    border-radius: 3px;
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
  const infront = textNode.nodeValue.slice(0, startIdx);
  if (infront) {
    nodes.push(document.createTextNode(infront));
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
  (highlight.nodes[0] as HTMLElement).scrollIntoView({ block: 'center' });
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
  isDocsFilterModalOpened: boolean;
  isSearchingInDocPage: boolean;
  pageURL: string;
  html: string;
  searchInputRef: any;
}

function DocPage({
  isDocsFilterModalOpened,
  isSearchingInDocPage,
  pageURL,
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
    const codes = el.getElementsByTagName('code');
    for (const code of codes) {
      const codeText = (code as HTMLElement).innerText;
      if (codeText) {
        // TODO: We could use the correct langague highlight based on the documentation.
        const codeHTML = Prism.highlight(codeText, Prism.languages.clike, 'clike');
        code.innerHTML = codeHTML;
      }
    }
    */

    const pres = el.getElementsByTagName('pre');
    for (const pre of pres) {
      const codeText = (pre as HTMLElement).innerText;
      if (codeText) {
        // TODO: We could use the correct langague highlight based on the documentation.
        const codeHTML = Prism.highlight(codeText, Prism.languages.clike, 'clike');
        pre.innerHTML = codeHTML;
      }
    }

    // TODO: Load TEX language.
    const maths = el.getElementsByTagName('math');
    for (const math of maths) {
      //console.log('math', math);
      const mathText = (math as HTMLElement).innerText;
      //console.log('mathText', mathText);
      //console.log('Prism', Prism.languages)
      if (mathText) {
        // TODO: We could use the correct langague highlight based on the documentation.
        const mathHTML = Prism.highlight(mathText, Prism.languages.tex, 'tex');
        math.innerHTML = mathHTML;
      }
    }

    return el.outerHTML || '<html></html>';
  }

  function selectNextHighlight() {
    deselectHighlight(highlights[selectedIdx]);
    if (selectedIdx < highlights.length - 1) {
      selectHighlight(highlights[selectedIdx+1]);
      setSelectedIdx(c => c += 1);
    } else {
      selectHighlight(highlights[0]);
      setSelectedIdx(0);
    }
  }

  function selectPreviousHighlight() {
      deselectHighlight(highlights[selectedIdx]);
    if (selectedIdx > 0) {
      selectHighlight(highlights[selectedIdx-1]);
      setSelectedIdx(c => c -= 1);
    } else {
      selectHighlight(highlights[highlights.length-1]);
      setSelectedIdx(highlights.length - 1);
    }
  }

  function handleSearchInputKeyDown(e: any) {
    // Enter pressed.
    if (searchQuery && e.keyCode === 13) {
      if (e.shiftKey) {
        selectPreviousHighlight();
      } else {
        selectNextHighlight();
      }
    }
  }

  // Open all links in the browser.
  function handleDocPageClick(e: any) {
    const target = e.target || e.srcElement;
    console.log('EVENT', e);
    console.log('TARGET', target);
    // The 'target.parentNode' handles a case when <a> element contains a <code> element.
    // If <code> element is inside the <a> element the event's target is actually the
    // <code> element and not the <a> element. So we have to check if its parent is <a>.
    if (target.tagName === 'A' || target.parentNode.tagName === 'A') {
      let url = target.getAttribute('href') || target.parentNode.getAttribute('href');
      if (
        url.startsWith('.')
        || url.startsWith('#')
        || !url.startsWith('http://')
        || !url.startsWith('https://')
       ) {
        url = new URL(url, pageURL).href;
      }
      openLink(url);
      e.preventDefault();
    }

    if (target.tagName === 'IMG') {
      let url = target.getAttribute('src');
      if (
        url.startsWith('.')
        || url.startsWith('#')
        || !url.startsWith('http://')
        || !url.startsWith('https://')
       ) {
        url = new URL(url, pageURL).href;
      }
      openLink(url);
      e.preventDefault();
    }
    e.preventDefault();
  }

  useHotkeys('up', () => {
    if (isSearchingInDocPage || isDocsFilterModalOpened) return;

    if (containerRef?.current) {
      containerRef.current.scrollBy(0, -15);
    }
  }, { filter: () => true }, [isSearchingInDocPage, isDocsFilterModalOpened]);

  useHotkeys('down', () => {
    if (isSearchingInDocPage || isDocsFilterModalOpened) return;

    if (containerRef?.current) {
      containerRef.current.scrollBy(0, 15);
    }
  }, { filter: () => true }, [isSearchingInDocPage, isDocsFilterModalOpened]);

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
      // TODO: highlightPattern sometimes returns an empty array
      const nodes = highlightPattern([...textNodes], match.index, debouncedSearchQuery);
      if (nodes.length > 0) {
        const highlight: Highlight = { index: highlightIndex++, nodes };
        setHighlights(c => c.concat(highlight));

        // Select the first highlight
        if (highlight.index === 0) selectHighlight(highlight);
      }
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
      <DocPageContainer
        id="doc-page"
        onClick={handleDocPageClick}
        ref={containerRef}
        dangerouslySetInnerHTML={{__html: highlightCode(html) as string}}
      />
    </>
  );
}

export default DocPage;

