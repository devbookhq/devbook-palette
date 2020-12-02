import React from 'react';
import styled from 'styled-components';

import { StackOverflowResult } from 'search/stackOverflow';
import Modal from 'components/Modal';

const marginTop = 60;

const StyledModal = styled(Modal)`
  width: 100%;
  height: calc(100vh - ${marginTop}px);
  margin-top: ${marginTop}px;
  padding: 10px;

  background: #212122;
  border-radius: 20px 20px 0 0;
`;

interface StackOverflowModalProps {
  soResult: StackOverflowResult;
  onCloseRequest: () => void;
}

function StackOverflowModal({
  soResult,
  onCloseRequest,
}: StackOverflowModalProps) {
  return (
    <StyledModal
      onCloseRequest={onCloseRequest}
    >
      <h3>{soResult.question.title}</h3>
    </StyledModal>
  );
}

export default StackOverflowModal;

