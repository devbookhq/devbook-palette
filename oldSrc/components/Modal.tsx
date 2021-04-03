import React from 'react';
import styled from 'styled-components';

import useLockBodyScroll from 'hooks/useLockBodyScroll';
import { ReactComponent as closeImg } from 'img/close.svg';

const Overlay = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;
  z-index: 5;

  top: 0;
  left: 0;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  background: rgba(182, 182, 182, 0.05);
  backdrop-filter: blur(10px);
`;

const CancelButton = styled.button`
  position: absolute;
  top: 22px;
  right: 18px;

  border: none;
  outline: none;
  background: transparent;

  :hover {
    cursor: pointer;
    path {
      stroke: #fff;
    }
  }
`;

const CloseImg = styled(closeImg)`
  width: auto;
  height: 18px;

  path {
    stroke: #fff;
  }
`;

const Container = styled.div``;

interface ModalProps {
  className?: string;
  children?: React.ReactNode | React.ReactNode[];
  onCloseRequest?: () => void;
  tabIndex?: number;
}

const Modal = React.forwardRef<HTMLDivElement, ModalProps>(({
  className,
  children,
  onCloseRequest,
  tabIndex,
}, ref) => {
  useLockBodyScroll();

  return (
    <Overlay>
      <CancelButton
        onClick={onCloseRequest}
      >
        <CloseImg />
      </CancelButton>

      <Container
        className={className}
        ref={ref}
        tabIndex={tabIndex}
      >
        {children}
      </Container>
    </Overlay>
  );
});

export default Modal;
