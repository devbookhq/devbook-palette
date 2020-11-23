import React, { useState } from 'react';
import styled from 'styled-components';
import useIPCRenderer from 'hooks/useIPCRenderer';

const Content = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

function Home() {
  const [problems, setProblems] = useState<Array<any>>([]);

  useIPCRenderer('problems', (event, currentProblems: any) => {
    setProblems(currentProblems);
    console.log('Problems: ', currentProblems);
  });

  return (
    <Content>
      <>
        {problems.map(p => JSON.stringify({
          message: p.diagnostic.message,
          source: p.diagnostic.source,
        }))}
      </>
    </Content>
  );
}

export default Home;
