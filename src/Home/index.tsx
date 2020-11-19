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


  useIPCRenderer('problems', (event, { problems: currentProblems }: { problems: any }) => {
    console.log(currentProblems);
    setProblems(currentProblems)
  });

  return (
    <Content>
      {problems.length}
    </Content>
  );
}

export default Home;
