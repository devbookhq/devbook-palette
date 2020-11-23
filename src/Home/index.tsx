import React, {
  useState,
  useCallback,
  useEffect,
} from 'react';
import styled from 'styled-components';
import useIPCRenderer from 'hooks/useIPCRenderer';
import debounce from 'util/debounce';
import { search as searchStackOverflow } from 'search/stackOverflow';

const Content = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

function Home() {
  const [problems, setProblems] = useState<Array<any>>([]);

  const debouncedSearch = useCallback(debounce(((query) => {
    return searchStackOverflow(query);
  }), 200), []);

  useEffect(() => {

  }, []);

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
