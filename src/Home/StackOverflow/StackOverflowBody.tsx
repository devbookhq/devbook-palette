import React, {useRef} from 'react';
import styled from 'styled-components';
import Prism from 'prismjs';

import { openLink } from 'mainCommunication';

const Body = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  /*
  * {
    font-size: 14px;
    font-weight: 400;
    line-height: 1.6em;
    color: #fff;
  }


  strong {
    font-weight: 600;
    font-size: 14px;
  }
  */

  color: #c1c9d2;
  font-size: 14px;
  line-height: 1.65em;
  font-family: -apple-system,BlinkMacSystemFont,Segoe UI,Roboto,Helvetica Neue,Ubuntu,sans-serif;

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

  .snippet, .snippet-code {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }

  /* Code block */
  .code-copy {
    margin-top: 24px;
    padding: 5px;
    display: flex;
    align-items: center;

    border-radius: 5px;
    user-select: none;
  }
  .code-copy:first-child {
    margin-top: 8px;
  }
  .code-copy:hover {
    transition: background 170ms ease-in;
    cursor: pointer;
    background: #434252;
  }
  .code-copy:hover > .code-copy-hotkey-text {
    color: #fff;
  }
  .code-copy-hotkey {
    min-height: 24px;
    padding: 2px 6px;
    display: flex;
    align-items: center;
    justify-content: flex-start;

    color: white;
    border-radius: 5px;
    background: #434252;

    font-weight: 500;
    font-family: 'Poppins';
    font-size: 13px;
  }
  .code-copy-hotkey-text {
    margin-left: 8px;
    font-size: 13px;
    color: #616171;
    transition: color 170ms ease-in;
  }
  pre {
    width: 100%;
    margin: 4px 0;
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

  h1 {
    font-size: 15px;
  }

  h2 {
    font-size: 14px;
    font-weight: 600;
  }

  h3 {
    font-size: 14px;
  }

  img {
    max-width: 100%;
    :hover {
      cursor: pointer;
    }
  }

  .live {
    background: #fff;
  }
`;


interface StackOverflowBodyProps {
  className?: string;
  html: string;
  tabIndex?: number;
}

const StackOverflowBody = React.forwardRef<HTMLDivElement, StackOverflowBodyProps>(({
  className,
  html,
  tabIndex,
}, ref) => {
//function StackOverflowBody({
//  className,
//  html,
//  tabIndex,
//}: StackOverflowBodyProps) {
  //const bodyRef = React.useRef<HTMLDivElement>(null);

  // Open all links in the browser.
  function handleBodyClick(e: any) {
    const target = e.target || e.srcElement;
    // The 'target.parentNode' handles a case when <a> element contains a <code> element.
    // If <code> element is inside the <a> element the event's target is actually the
    // <code> element and not the <a> element. So we have to check if its parent is <a>.
    if (target.tagName === 'A' || target.parentNode.tagName === 'A') {
      const url = target.getAttribute('href') || target.parentNode.getAttribute('href');
      openLink(url);
      e.preventDefault();
    }

    if (target.tagName === 'IMG') {
      const url = target.getAttribute('src');
      openLink(url);
      e.preventDefault();
    }
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
    return el.outerHTML || '<html></html>';
  }

  /*
  React.useEffect(() => {
    if (!bodyRef?.current) return;
    const codeSnippets = bodyRef.current.getElementsByTagName('pre');
    console.log('snippets', codeSnippets);
  }, []);
  */

  return (
    <Body
      ref={ref}
      //ref={bodyRef}
      tabIndex={tabIndex}
      className={className}
      dangerouslySetInnerHTML={{__html: highlightCode(html)}}
      onClick={handleBodyClick}
    />
  );
//}
});

export default StackOverflowBody;
