import React, {
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';

const Container = styled.div`
  padding: 15px 0;
  flex: 1;
`;

const Title = styled.div`
  width: 100%;
  padding: 0 15px 15px;

  font-size: 17px;
  font-weight: 500;

  border-bottom: 1px solid #3B3A4A;
`;

const Content = styled.div`
  padding: 15px;
`;

interface BaseProps {
  title: string;
  children: React.ReactNode | React.ReactNode[];
}

function Base({
  title,
  children,
}: BaseProps) {
   return (
    <Container>
      <Title>{title}</Title>
      <Content>
        {children}
      </Content>
     </Container>
   );
}


export default Base;

