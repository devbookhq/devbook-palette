import React from 'react';
import styled from 'styled-components';
import Button from 'components/Button';
import useIPCRenderer from 'hooks/useIPCRenderer';
import { connectGitHub } from 'mainProcess';
import * as gitHub from 'search/gitHub';

const Content = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

function Home() {
  useIPCRenderer('github-access-token', (event, { accessToken }: { accessToken: string }) => {
    console.log('access token', accessToken);
    gitHub.init(accessToken);
  });

  useIPCRenderer('github-error', () => {
    console.log('gitHub error');
  });

  async function search(query: string) {
    try {
      const r = await gitHub.searchCode(query);
      console.log(r);
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <Content>
      <Button onClick={connectGitHub}>
        Connect GitHub
      </Button>
      <Button onClick={() => search('code')}>
        Search
      </Button>
    </Content>
  );
}

export default Home;
