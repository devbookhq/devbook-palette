import React, {
  useRef,
  useEffect,
} from 'react';
import styled from 'styled-components';
import Prism from 'prismjs';

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
    line-height: 1.6em;
    color: #fff;
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
    font-size: 15px;
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
    height: inherit;
  }
`;

const DocPageSearchInput = styled.input`
  position: absolute;
  top: 115px;
  right: 55px;
  width: 180px;
  padding: 10px;

  color: white;

  background: black;
  border: none;
  border-radius: 5px;
  outline: none;
`;

interface DocPageProps {
  isSearchingInDocPage?: boolean;
  html: string;
}

function DocPage({
  isSearchingInDocPage,
  html,
}: DocPageProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    containerRef?.current?.focus();
  }, [html]);

  function highlightCode(html: string) {
    const el = document.createElement('html');
    el.innerHTML = html;

    const codes = el.getElementsByTagName('code');
    for (const code of codes) {
      if (code.childNodes.length === 0) continue;
      const codeText = code.childNodes[0].nodeValue;
      if (codeText) {
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

  return (
    <>
      {isSearchingInDocPage &&
        <DocPageSearchInput
          autoFocus
          placeholder="Search on page"
        />
      }
      <Container
        ref={containerRef}
        tabIndex={0}
        dangerouslySetInnerHTML={{__html: highlightCode(html) as string}}
      />
    </>
  );
}

export default DocPage;

