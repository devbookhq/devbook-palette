import React from 'react';
import styled, { keyframes } from 'styled-components';

const size = 40;
const borderSize = 2;

const ripple = keyframes`
  0% {
    top: ${Math.round(size * 0.5) - borderSize}px;
    left: ${Math.round(size * 0.5) - borderSize}px;
    width: ${borderSize * 2}px;
    height: ${borderSize * 2}px;
    opacity: 1;
  }

  100% {
    top: ${Math.round(size * 0.1) - borderSize}px;
    left: ${Math.round(size * 0.1) - borderSize}px;
    width: ${Math.round(size * 0.9)}px;
    height: ${Math.round(size * 0.9)}px;
    opacity: 0;
  }
`;

const Container = styled.div`
  display: inline-block;
  position: relative;
  width: ${size}px;
  height: ${size}px;

  div {
    position: absolute;
    border: ${borderSize}px solid #fff;
    opacity: 1;
    border-radius: 50%;
    animation: ${ripple} 1s cubic-bezier(0, 0.2, 0.8, 1) infinite;
  }

  div:nth-child(2) {
    animation-delay: -0.5s;
  }
`;

interface LoaderProps {
  className?: string;
}

function Loader({ className }: LoaderProps) {
  return (
    <Container
      className={className}
    >
      <div/>
      <div/>
    </Container>
  );
}

export default Loader;
