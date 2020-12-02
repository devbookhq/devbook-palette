import React, { useRef } from 'react';
import styled from 'styled-components';

import useLockBodyScroll from 'hooks/useLockBodyScroll';
// import useOnClickOutside from 'hooks/useOnClickOutside';

import { ReactComponent as closeImg } from 'img/close.svg';

const Overlay = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;

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
`;

const Content = styled.div``;

interface ModalProps {
  className?: string;
  children?: React.ReactNode | React.ReactNode[];
  onCloseRequest?: () => void;
}

function Modal({
  className,
  children,
  onCloseRequest,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useLockBodyScroll();
  // useOnClickOutside(contentRef, onCloseRequest || (() => {}));

  return (
    <Overlay>
      <CancelButton
        onClick={onCloseRequest}
      >
        <CloseImg/>
      </CancelButton>

      <Content
        className={className}
        ref={contentRef}
      >
        {children}
      </Content>
    </Overlay>
  );
}

export default Modal;

