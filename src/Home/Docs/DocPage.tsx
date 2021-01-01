import React, {
  useRef,
  useState,
  useEffect,
} from 'react';
import styled from 'styled-components';
import Prism from 'prismjs';

import useDebounce from 'hooks/useDebounce';
import Mark from 'mark.js';
import { boyerMooreSearch } from './BoyerMoore';

const markInstance = new Mark('#doc-page');

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
  }
`;

const SearchInputWrapper = styled.div`
  position: absolute;
  top: 115px;
  right: 20px;

  padding: 10px;
  display: flex;
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
  background: #434252;
`;

const SearchControls = styled.div`
`;

interface DocPageProps {
  isSearchingInDocPage?: boolean;
  html: string;
}

function getTextNodeChildren(node: Node) {
  let nodes: Node[] = [];
  for (let n = node.firstChild; n; n = n.nextSibling) {
    if (n.nodeType === Node.TEXT_NODE) nodes.push(n);
    nodes = nodes.concat(getTextNodeChildren(n));
  }
  return nodes;
}


// processTextNode processes a single TEXT_NODE node
// and returns an array of nodes.
// The nodes array is meant to replace the TEXT_NODE
// with nodes where pattern is highlighted.
// The highlight feature is accomplished by wrapping
// the matched text in a <span> element.
/*
function highlightTextNode(node: Node, pattern: string) {
  if (node.nodeType !== Node.TEXT_NODE) throw Error('Cannot highlight a node that is not of the type TEXT_NODE');
  if (!node.nodeValue?.toLowerCase().includes(pattern.toLowerCase())) { return [] };

  // The text node may contain multiple occurences of the pattern.
  // We use regexp to find starting indexes of all these matches.
  const escaped = pattern.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string.
  const re = new RegExp(escaped, 'g');
  let match: RegExpExecArray | null;

  let start = 0;
  const nodes: Node[] = [];
  while ((match = re.exec(node.nodeValue.toLowerCase())) !== null) {
    const beforeHit = node.nodeValue.slice(start, match.index);
    if (beforeHit) {
      nodes.push(document.createTextNode(beforeHit));
    }

    const hit = node.nodeValue.slice(match.index, match.index + pattern.length);
    if (hit) {
      const highlightEl = document.createElement('span');
      highlightEl.classList.add('devbook-highlight');
      highlightEl.innerText = hit;
      nodes.push(highlightEl as Node);
    }

    // We update the start variable so we can correctly
    // slice node's value in the following iteration.
    start = match.index + pattern.length;
  }
  if (start !== 0) {
    const rest = node.nodeValue.slice(start);
    if (rest) {
      nodes.push(document.createTextNode(rest));
    }
  }
  return nodes;
}
*/

/*
function highlightNode(node: Node, { start, end }: { start: number, end: number}) {
  console.log('highlightNode', node, start, end);

  if (!node.textContent) return [];
  const nodes: Node[] = [];

  const beforeHit = node.textContent.slice(0, start);
  if (beforeHit) {
    nodes.push(document.createTextNode(beforeHit));
  }

  const hit = node.textContent.slice(start, end);
  if (hit) {
    const highlightEl = document.createElement('span');
    highlightEl.classList.add('devbook-highlight');
    highlightEl.innerText = hit;
    nodes.push(highlightEl as Node);
  }

  const rest = node.textContent.slice(end);
  if (rest) {
    nodes.push(document.createTextNode(rest));
  }
  return nodes;
}
*/

// TODO: Add comments. Specifically, explain why we are removing siblings and concatenating texts.
/*
function removeHighlights(nodes: Node[]) {
  console.log('removing', nodes);
  nodes.forEach(n => {
    let text = '';

    if (n.previousSibling?.nodeType === Node.TEXT_NODE && n.previousSibling.nodeValue) {
      text = n.previousSibling.nodeValue;
      n.parentNode?.removeChild(n.previousSibling);
    }

    text += n.childNodes[0].nodeValue!;

    if (n.nextSibling?.nodeType === Node.TEXT_NODE && n.nextSibling.nodeValue) {
      text += n.nextSibling.nodeValue;
      n.parentNode?.removeChild(n.nextSibling);
    }

    n.parentNode?.replaceChild(document.createTextNode(text), n);
  });
}
*/

function DocPage({
  isSearchingInDocPage,
  html,
}: DocPageProps) {
  const webviewRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebounce(searchQuery, 0);

  interface CachedNode {
    tagName: string;
    className: string;
  }
  const [highlightedNodes, setHighlightedNodes] = useState<Node[]>([]);


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

  function removeHighlight(node: Node) {
    if (!node.parentNode) throw new Error('Cannot remove highlight on a node without parent');
    if (node.childNodes.length === 0) throw new Error('Cannot remove highlight on a node without children');
    const textNode = node.childNodes[0];
    if (textNode.nodeType !== Node.TEXT_NODE || !textNode.nodeValue)
      throw new Error('Cannot remove highlight on a node that does not have a text node.');

    //const leftNode = node.previousSibling;
    // const rightNode = node.nextSibling;
    node.parentNode.insertBefore(document.createTextNode(textNode.nodeValue), node.nextSibling);
    node.parentNode.removeChild(node);
  }

  function highlightNode(textNode: Node, startIdx: number, endIdx: number) {
    console.log('---------!!! HIGHLIGHT NODE', textNode, startIdx, endIdx);
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
      const cp = textNode.parentNode.cloneNode();
      // TODO: Cache textNode.parentNode and a copy of the textNode so later we can remove highlights.
      // setHighlightedNodes(c => c.concat([{ parent: textNode.parentNode!.cloneNode(true), node: textNode }]));

      nodes.forEach(newN => {
        textNode.parentNode!.insertBefore(newN, textNode);
      });
      setHighlightedNodes(c => c.concat([highlightEl as Node]));
      console.log('child nodes [BEFORE]:', [...textNode.parentNode.childNodes]);
      if (nodes.length > 0) {
        const p = textNode.parentNode;
        textNode.parentNode.removeChild(textNode);
        console.log('child nodes [AFTER]:', [...p.childNodes]);
      }
    }
  }

  function highlightPattern(textNodes: Node[], startIdx: number, pattern: string) {
    console.log('startIdx:', startIdx);
    let matchedLength = 0; // Length of a pattern substring that is already matched.
    let wholeText = '';
    const toHighlight: any[] = [];
    for (let i = 0; i < textNodes.length; i++) {
      const n = textNodes[i];
      if (!n.nodeValue) continue;
      wholeText += n.nodeValue;
      console.log('<<TEXT NODE:', n.nodeValue);
      console.log('wholeText:', wholeText.length, wholeText);
      console.log('matchedLength:', matchedLength);

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
        console.log('nodeStartIdx', nodeStartIdx);
        console.log('nodeEndIdx', nodeEndIdx);
        toHighlight.push({
          node: n,
          start: nodeStartIdx,
          end: nodeEndIdx
        });
        //highlightNode(n, nodeStartIdx, nodeEndIdx);
      } else {
        console.log('---> Skipping node, before start or after end');
      }
    }
    toHighlight.forEach((obj: any) => {
      highlightNode(obj.node, obj.start, obj.end);
    });
  }

  useEffect(() => {
    containerRef?.current?.focus();
  }, [html]);

  useEffect(() => {
    highlightedNodes.forEach(n => {
      removeHighlight(n);
    });
    setHighlightedNodes([]);
    if (!debouncedSearchQuery) return;

    // xpath problem with apostrophe - https://stackoverflow.com/questions/44032984/xpath-expression-error-due-to-apostrophe-in-a-string-in-robot-framework
    /*
    const els = document.evaluate(
      `//div[@id='doc-page']//*[contains(translate(., 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz'), '${debouncedSearchQuery.toLowerCase()}')]`,
      document,
      null,
      XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
      null,
    );

    for (let i = 0; i < els.snapshotLength; i++) {
      const parentNode = els.snapshotItem(i);
      if (!parentNode || !(parentNode as HTMLElement).innerText) continue;
      console.log('===== xpath node', (parentNode as HTMLElement).innerText);
      const textNodes = getTextNodeChildren(parentNode as Node);

      const escaped = debouncedSearchQuery
        .toLowerCase()
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string.
      const re = new RegExp(escaped, 'g');
      let match: RegExpExecArray | null;
      while ((match = re.exec((parentNode as HTMLElement).innerText.toLowerCase())) !== null) {
        highlightPattern([...textNodes], match.index, debouncedSearchQuery);
      }
    }
    */

    const textNodes = getTextNodeChildren(containerRef!.current! as Node);

    const escaped = debouncedSearchQuery
      .toLowerCase()
      .replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string.
    const re = new RegExp(escaped, 'g');
    let match: RegExpExecArray | null;
    //while ((match = re.exec((containerRef!.current! as HTMLElement).innerText.toLowerCase())) !== null) {
    let wholeText = '';
    textNodes.map(n => {
      wholeText += n.nodeValue || '';
    });
    while ((match = re.exec(wholeText.toLowerCase())) !== null) {
      highlightPattern([...textNodes], match.index, debouncedSearchQuery);
    }
  }, [debouncedSearchQuery]);

  return (
    <>
      {isSearchingInDocPage &&
        <SearchInputWrapper>
          <SearchInput
            autoFocus
            placeholder="Search in page"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          <SearchDelimiter/>
          <SearchControls>
            <span>Next</span>
            <span>Back</span>
            <span>Cancel</span>
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

