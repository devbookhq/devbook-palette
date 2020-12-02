import React from 'react';
import styled from 'styled-components';

import { StackOverflowResult } from 'search/stackOverflow';
import Modal from 'components/Modal';

const marginTop = 40;

const Content = styled.div`
  width: 100%;
  height: calc(100vh - ${marginTop}px);
  margin-top: ${marginTop}px;
  padding: 10px;

  background: #212122;
  border-radius: 12px 12px 0 0;
`;

interface StackOverflowModalProps {
  soResult: StackOverflowResult;
  onCloseRequest: () => void;
}

function StackOverflowModal({
  soResult,
  onCloseRequest,
}: StackOverflowModalProps) {
  function a() {
    console.log('CLOSE');
    onCloseRequest();
  }

  return (
    <Modal
      onCloseRequest={a}
    >
      <Content>
        <h3>{soResult.question.title}</h3>
      </Content>
    </Modal>
  );
}

export default StackOverflowModal;

