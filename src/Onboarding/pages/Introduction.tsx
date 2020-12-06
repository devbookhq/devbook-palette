import React from 'react';
import styled from 'styled-components';
import sidekickPreviewImg from 'img/sidekick-preview.png';

const Container = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  user-select: none;
`;

const Titles = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.span`
  color: white;
  font-size: 22px;
  font-weight: 600;
`;

const Subtitle = styled.span`
  margin-top: 5px;
  color: white;
  font-size: 18px;
  font-weight: 500;
  text-align: center;
`;

const Explanation = styled.span`
  margin-top: 25px;
  color: white;
  font-size: 16px;
  font-weight: 400;
  text-align: center;
`;

const SidekickImg = styled.img`
  margin-top: 20px;
  height: auto;
  max-width: 950px;
  width: 100%;
`;

function IntroductionPage() {
  return (
    <Container>
      <Titles>
        <Title>Welcome to Sidekick</Title>
        <Subtitle>
          Search engine for your terminal
        </Subtitle>
        <Explanation>
          Sidekick makes it easy to search yours and your team's terminal history.
        </Explanation>
      </Titles>

      <SidekickImg src={sidekickPreviewImg} />
    </Container>
  );
}

export default IntroductionPage;
