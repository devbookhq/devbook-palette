import React from 'react';
import styled from 'styled-components';

import { openLink } from 'mainProcess';

const Body = styled.div`
  hr {
    border: none;
    height: 1px;
    background-color: #535557;
    height: 0;
  }

  * {
    font-size: 14px;
    font-weight: 500;
    color: #fff;
  }

  code {
    padding: 2px 4px;

    color: #D9D9DA;
    font-family: 'Roboto Mono';
    font-size: 14px;
    font-weight: 500;

    background: #23222D;
    border-radius: 3px;
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
  }
`;

interface StackOverflowBodyProps {
  className?: string;
  dangerouslySetInnerHTML?: any;
}

function StackOverflowBody({
  className,
  dangerouslySetInnerHTML,
}: StackOverflowBodyProps) {
  // Open all links in the browser.
  function handleBodyClick(e: any) {
    const target = e.target || e.srcElement;
    if (target.tagName === 'A') {
      const url = target.getAttribute('href');
      openLink(url);
      e.preventDefault();
    }
  }

  return (
    <Body
      className={className}
      dangerouslySetInnerHTML={dangerouslySetInnerHTML}
      onClick={handleBodyClick}
    />
  );
}

export default StackOverflowBody;
