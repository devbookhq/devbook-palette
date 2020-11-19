import React from 'react';
import styled from 'styled-components';

import { ReactComponent as LoaderIcon } from 'img/loader.svg';

const Content = styled.div`
  display: flex;
  padding: 0;
  margin: 0;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  `;

const Loader = styled(LoaderIcon) <{ text?: string }>`
  margin-bottom: ${props => props.text ? '10px' : '0px'};

  @keyframes spin { 100% { transform:rotate(360deg); } }
  animation: spin 1s linear infinite;

  * {
    stroke: white;
    fill: white;
  }
`;

const Text = styled.span`
  font-weight: 400;
  color: white;
`;

interface LoadingProps {
  className?: string;
  text?: string;
}

function Loading(props: LoadingProps) {
  return (
    <Content
      className={props.className}
    >
      <Loader text={props.text} />
      {props.text && <Text>{props.text}</Text>}
    </Content>
  );
}

export default Loading;

