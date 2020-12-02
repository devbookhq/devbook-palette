import React, { useRef } from 'react';
import styled from 'styled-components';

import useLockBodyScroll from 'hooks/useLockBodyScroll';
import useOnClickOutside from 'hooks/useOnClickOutside';

const Overlay = styled.div`
  position: fixed;
  width: 100%;
  height: 100%;

  top: 0;
  left: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(182, 182, 182, 0.05);
  backdrop-filter: blur(10px);
`;

const Content = styled.div`
  width: 100%;
  height: 100%;
`;

interface ModalProps {
  children?: React.ReactNode | React.ReactNode[];
  onCloseRequest?: () => void;
}

function Modal({
  children,
  onCloseRequest,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useLockBodyScroll();
  useOnClickOutside(contentRef, onCloseRequest || (() => {}));

  return (
    <Overlay>
      <Content ref={contentRef}>
        {children}
      </Content>
    </Overlay>
  );
}

export default Modal;

