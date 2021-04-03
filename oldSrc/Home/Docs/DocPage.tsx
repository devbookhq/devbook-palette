import React, {
  useRef,
  useState,
  useEffect,
} from 'react';
import styled from 'styled-components';
import Prism from 'prismjs';

import { useHotkeys } from 'react-hotkeys-hook';

import electron, { openLink } from 'mainCommunication';
import { DocResult } from 'Search/docs';
import { ReactComponent as chevronImg } from 'img/chevron.svg';

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

const ChevronDown = styled(chevronImg)``;

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

  const highlight = textNode.nodeValue.slice(startIdx, endIdx + 1);
  const highlightEl = document.createElement('mark');
  highlightEl.classList.add('devbook-highlight');
  highlightEl.innerText = highlight;
  nodes.push(highlightEl as Node);

  const after = textNode.nodeValue.slice(endIdx + 1);
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
  searchInputRef: any;
  isDocsFilterModalOpened: boolean;
  isSearchingInDocPage: boolean;
  isSearchHistoryOpened: boolean;

  docResult: DocResult;
}

function DocPage({
  searchInputRef,
  isDocsFilterModalOpened,
  isSearchingInDocPage,
  isSearchHistoryOpened,
  docResult,
}: DocPageProps) {
  const { pageURL, html, anchor } = docResult.page;

  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  function handleLinkClick(e: MouseEvent, link: string) {
    if (!link) {
      console.warn('Clicked link had empty href.');
      e.preventDefault();
      return;
    }
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      link = new URL(link, pageURL).href; // Convert relative links to absolute.
    }
    openLink(link);
    e.preventDefault();
  }

  function highlightCode(html: string) {
    const el = document.createElement('html');
    el.innerHTML = html;

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
    /*
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
    */

    return el.outerHTML || '<html></html>';
  }

  function selectNextHighlight() {
    deselectHighlight(highlights[selectedIdx]);
    if (selectedIdx < highlights.length - 1) {
      selectHighlight(highlights[selectedIdx + 1]);
      setSelectedIdx(c => c += 1);
    } else {
      selectHighlight(highlights[0]);
      setSelectedIdx(0);
    }
  }

  function selectPreviousHighlight() {
    deselectHighlight(highlights[selectedIdx]);
    if (selectedIdx > 0) {
      selectHighlight(highlights[selectedIdx - 1]);
      setSelectedIdx(c => c -= 1);
    } else {
      selectHighlight(highlights[highlights.length - 1]);
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

  useHotkeys('shift+up', () => {
    if (isSearchHistoryOpened || isSearchingInDocPage || isDocsFilterModalOpened) return;

    if (containerRef?.current) {
      containerRef.current.scrollBy(0, -15);
    }
  }, { filter: () => true }, [isSearchHistoryOpened, isSearchingInDocPage, isDocsFilterModalOpened]);

  useHotkeys('shift+down', () => {
    if (isSearchHistoryOpened || isSearchingInDocPage || isDocsFilterModalOpened) return;

    if (containerRef?.current) {
      containerRef.current.scrollBy(0, 15);
    }
  }, { filter: () => true }, [isSearchHistoryOpened, isSearchingInDocPage, isDocsFilterModalOpened]);

  useHotkeys(electron.remote.process.platform === 'darwin' ? 'Cmd+up' : 'ctrl+up', () => {
    if (isSearchingInDocPage || isDocsFilterModalOpened) return;

    if (containerRef?.current) {
      containerRef.current.scrollTo(0, 0);
    }
  }, { filter: () => true }, [isSearchingInDocPage, isDocsFilterModalOpened]);

  useHotkeys(electron.remote.process.platform === 'darwin' ? 'Cmd+down' : 'ctrl+down', () => {
    if (isSearchingInDocPage || isDocsFilterModalOpened) return;

    if (containerRef?.current) {
      containerRef.current.scrollTo(0, containerRef.current.scrollHeight);
    }
  }, { filter: () => true }, [isSearchingInDocPage, isDocsFilterModalOpened]);

  useEffect(() => {
    highlights.forEach(h => {
      h.nodes.forEach(removeHighlight);
    });
    setHighlights([]);
    setSelectedIdx(0);

    if (!searchQuery || !containerRef?.current) return;

    const textNodes = getTextNodeChildren(containerRef.current as Node);
    let wholeText = '';
    textNodes.forEach(n => {
      wholeText += n.nodeValue || '';
    });

    const escaped = searchQuery
      .toLowerCase()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string.
    const re = new RegExp(escaped, 'g');
    let match: RegExpExecArray | null;
    let highlightIndex = 0;
    while ((match = re.exec(wholeText.toLowerCase())) !== null) {
      // TODO: highlightPattern sometimes returns an empty array
      const nodes = highlightPattern([...textNodes], match.index, searchQuery);
      if (nodes.length > 0) {
        const highlight: Highlight = { index: highlightIndex++, nodes };
        setHighlights(c => c.concat(highlight));

        // Select the first highlight
        if (highlight.index === 0) selectHighlight(highlight);
      }
    }
    // Note - we don't want to include 'highlights' in the deps array
    // because we would end up in an infinite cycle.
    // We just want to remove highlights every time user changes the
    // query. Not when highlights change.
  }, [setHighlights, searchQuery]);

  useEffect(() => {
    if (!containerRef?.current) return;

    const links = containerRef.current.getElementsByTagName('a');
    for (const link of links) {
      const href = link.getAttribute('href');
      link.onclick = e => handleLinkClick(e, href ?? '');
    }
    const imgs = containerRef.current.getElementsByTagName('img');
    for (const img of imgs) {
      img.onclick = e => { e.preventDefault(); }
    }

    const anchorEl = containerRef.current.querySelector(`#${anchor}`);
    if (!anchorEl) return;

    anchorEl.scrollIntoView();
  }, [html, anchor]);

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
                    <span>{selectedIdx + 1}/{highlights.length}</span>
                  }
                  {highlights.length === 0 &&
                    <span>0/0</span>
                  }
                </>
              }
            </>
          </HitCount>
          <SearchDelimiter />
          <SearchControls>
            <ChevronButton
              onClick={selectNextHighlight}
            >
              <ChevronDown />
            </ChevronButton>

            <ChevronButton
              onClick={selectPreviousHighlight}
            >
              <ChevronUp />
            </ChevronButton>
          </SearchControls>
        </SearchInputWrapper>
      }
      <div
        id="doc-page"
        ref={containerRef}
        dangerouslySetInnerHTML={{ __html: highlightCode(html) as string }}
      />
    </>
  );
}

export default React.memo(DocPage);
