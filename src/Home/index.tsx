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
  const [terminalData, setTerminalData] = useState<Array<any>>([]);

  useIPCRenderer('problems', (event, currentProblems: any) => {
    setProblems(currentProblems);
    console.log('Problems: ', currentProblems);
  });

  useIPCRenderer('terminal-data', (event, currentTerminalData: any) => {
    setTerminalData(currentTerminalData)
    console.log('Terminal data:', currentTerminalData);
  });

  return (
    <Content>
      <>
        {problems.map(p => JSON.stringify({
          message: p.diagnostic.message,
          source: p.diagnostic.source,
        }))}
      </>
      <>
        {terminalData.map(p => JSON.stringify(p))}
      </>
    </Content>
  );
}

export default Home;
