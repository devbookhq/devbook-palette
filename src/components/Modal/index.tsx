import React, { useRef } from 'react';
import styled from 'styled-components';

import useLockBodyScroll from 'hooks/useLockBodyScroll';
import useOnClickOutside from 'hooks/useOnClickOutside';

const Overlay = styled.div`
  position: fixed;
  z-index: 10;
  width: 100%;
  height: 100%;

  top: 0;
  left: 0;

  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(0, 0, 0, 0.4);
`;

const Content = styled.div`
  padding: 10px;
  min-height: 100px;
  width: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 3px;
  background: #42444A;
`;

interface ModalProps {
  className?: string;
  children: React.ReactNode[] | React.ReactNode;
  onCloseModalRequest: () => void;
}

function Modal(props: ModalProps) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  function handleClickOutside() {
    props.onCloseModalRequest();
  }

  useOnClickOutside(contentRef, handleClickOutside);
  useLockBodyScroll();

  return (
    <Overlay>
      <Content className={props.className} ref={contentRef}>
        {props.children}
      </Content>
    </Overlay>
  );
}

export default Modal;
