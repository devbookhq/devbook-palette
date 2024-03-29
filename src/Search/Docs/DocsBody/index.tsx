import {
  useRef,
  useState,
  useEffect,
  useCallback,
} from 'react';
import styled from 'styled-components';
import Prism from 'prismjs';
import { observer } from 'mobx-react-lite';

import ElectronService from 'services/electron.service';
import { DocResult } from 'services/search.service';
import { ReactComponent as chevronImg } from 'img/chevron.svg';
import { HotkeyAction, useUIStore } from 'ui/ui.store';
import DocsContent from './DocsContent';
import useHotkey from 'hooks/useHotkey';

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
  if (!node.parentNode) throw new Error('Cannot remove highlight on a node without parent.');
  if (node.childNodes.length === 0) throw new Error('Cannot remove highlight on a node without children.');
  const textNode = node.childNodes[0];
  if (textNode.nodeType !== Node.TEXT_NODE || !textNode.nodeValue)
    throw new Error('Cannot remove highlight on a node that does not have a text node.');

  node.parentNode.insertBefore(document.createTextNode(textNode.nodeValue), node.nextSibling);
  node.parentNode.removeChild(node);
}

function highlightNode(textNode: Node, startIdx: number, endIdx: number) {
  if (textNode.nodeType !== Node.TEXT_NODE) throw new Error('Cannot highlight a node that is not of type TEXT_NODE.');
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

function highlightCode(html: string) {
  const el = document.createElement('html');
  el.innerHTML = html;

  const pres = el.getElementsByTagName('pre');
  for (const pre of pres) {
    const codeText = (pre as HTMLElement).innerText;
    if (codeText) {
      const codeHTML = Prism.highlight(codeText, Prism.languages.clike, 'clike');
      pre.innerHTML = codeHTML;
    }
  }
  return el.outerHTML || '<html></html>';
}

function handleLinkClick(e: MouseEvent, link: string, pageURL: string | undefined) {
  if (!link) {
    console.warn('Clicked link had empty href.');
    e.preventDefault();
    return;
  }
  if (!link.startsWith('http://') && !link.startsWith('https://')) {
    link = new URL(link, pageURL).href; // Convert relative links to absolute.
  }
  ElectronService.openLink(link);
  e.preventDefault();
}

interface DocsBodyProps {
  result: DocResult;
}

function DocsBody({
  result,
}: DocsBodyProps) {
  const { pageURL, html, anchor } = result.page;
  const uiStore = useUIStore();

  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const selectNextHighlight = useCallback(() => {
    setSelectedIdx(c => {
      if (highlights.length === 0) return c;
      deselectHighlight(highlights[c]);
      const idx = c < highlights.length - 1 ? c + 1 : 0;
      selectHighlight(highlights[idx]);
      return idx;
    });
  }, [highlights]);

  const selectPreviousHighlight = useCallback(() => {
    setSelectedIdx(c => {
      if (highlights.length === 0) return c;
      deselectHighlight(highlights[c]);
      const idx = c > 0 ? c - 1 : highlights.length - 1;
      selectHighlight(highlights[idx]);
      return idx;
    });
  }, [highlights]);

  const toggleSearchInPage = useCallback(() => {
    uiStore.toggleSearchInPage();
  }, [uiStore]);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.DocsOpenSearchInPage, toggleSearchInPage);
    uiStore.registerHotkeyHandler(HotkeyAction.DocsCancelSearchInPage, toggleSearchInPage);
  }, [toggleSearchInPage, uiStore]);

  useHotkey(uiStore.hotkeys[HotkeyAction.DocsSearchInPageUp], selectPreviousHighlight);
  useHotkey(uiStore.hotkeys[HotkeyAction.DocsSearchInPageDown], selectNextHighlight);

  const scrollUp = useCallback(() => {
    containerRef?.current?.scrollBy(0, -25);
  }, [containerRef]);

  const scrollDown = useCallback(() => {
    containerRef?.current?.scrollBy(0, 25);
  }, [containerRef]);

  const scrollTop = useCallback(() => {
    if (containerRef?.current?.scrollTop !== 0) containerRef?.current?.scrollTo(0, 0);
  }, [containerRef]);

  const scrollBottom = useCallback(() => {
    containerRef?.current?.scrollTo(0, containerRef.current.scrollHeight);
  }, [containerRef]);

  useEffect(() => {
    uiStore.registerHotkeyHandler(HotkeyAction.DocsScrollUp, scrollUp);
    uiStore.registerHotkeyHandler(HotkeyAction.DocsScrollDown, scrollDown);
    uiStore.registerHotkeyHandler(HotkeyAction.DocsScrollTop, scrollTop);
    uiStore.registerHotkeyHandler(HotkeyAction.DocsScrollBottom, scrollBottom);
  }, [scrollUp, scrollDown, scrollTop, scrollBottom, uiStore]);

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
      link.onclick = e => handleLinkClick(e, href ?? '', pageURL);
    }
    const imgs = containerRef.current.getElementsByTagName('img');
    for (const img of imgs) {
      img.onclick = e => { e.preventDefault(); }
    }

    const anchorEl = containerRef.current.querySelector(`#${anchor}`);
    if (!anchorEl) return;

    anchorEl.scrollIntoView();
  }, [html, anchor, pageURL]);

  useEffect(() => {
    scrollTop();
  }, [result, scrollTop]);

  return (
    <>
      {uiStore.isSearchInPageOpened &&
        <SearchInputWrapper>
          <SearchInput
            ref={searchInputRef}
            autoFocus
            placeholder="Search in page"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
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
      <DocsContent
        containerRef={containerRef}
        html={highlightCode(html)}
      // html={highlightedHTML}
      />
    </>
  );
}

export default observer(DocsBody);
