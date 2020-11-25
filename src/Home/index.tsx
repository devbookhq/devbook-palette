import React from 'react';
import styled from 'styled-components';
import Button from 'components/Button';
import useIPCRenderer from 'hooks/useIPCRenderer';
import { connectGithub } from 'mainProcess';
import * as github from 'search/github';

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
    github.init(accessToken);
  });

  useIPCRenderer('github-error', (event, { message }: { message: string }) => {
    console.log('gitHub error', message);
  });

  async function search(query: string) {
    try {
      const r = await github.searchCode(query);
      console.log(r);
    } catch (error) {
      console.error(error.message);
    }
  }

  return (
    <Content>
      <Button onClick={connectGithub}>
        Connect GitHub
      </Button>
      <Button onClick={() => search('code')}>
        Search
      </Button>
    </Content>
  );
}

export default Home;
