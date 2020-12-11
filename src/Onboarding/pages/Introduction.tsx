import React, { useState } from 'react';
import styled from 'styled-components';
import devbookPreviewSOImg from 'img/devbook-preview-so.png';
import devbookPreviewCodeImg from 'img/devbook-preview-code.png';

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

const Explanation = styled.span`
  margin-top: 10px;
  color: white;
  font-size: 15px;
  font-weight: 400;
  text-align: center;
`;

const FeaturesWrapper = styled.div`
  margin-top: 35px;
  display: flex;
  align-items: center;
`;

const Delimiter = styled.div`
  margin 0 10px;

  width: 25px;
  height: 0px;
  border: 1px solid #3B3A4A;
  transform: rotate(90deg);
`;

const FeatureButton = styled.button<{ selected?: boolean }>`
  color: ${props => props.selected ? 'white' : '#5A5A6F'};
  font-family: 'Poppins';
  font-size: 15px;
  font-weight: 500;

  background: none;
  border: none;

  :hover {
    transition: background 170ms ease-in;
    cursor: pointer;
    color: white;
  }
`;

const DevbookImg = styled.img`
  height: auto;
  max-width: 1000px;
  width: 100%;
`;


enum Feature {
  StackOverflow,
  GitHubCode,
}

function IntroductionPage() {
  const [activeFeature, setActiveFeature] = useState<Feature>(Feature.StackOverflow);

  return (
    <Container>
      <Titles>
        <Title>Search engine for developers</Title>
        <Explanation>
          Solve your problems faster and become a more productive developer
        </Explanation>
      </Titles>

      <FeaturesWrapper>
        <FeatureButton
          selected={activeFeature === Feature.StackOverflow}
          onClick={() => setActiveFeature(Feature.StackOverflow)}
        >
          Search StackOverflow
        </FeatureButton>
        <Delimiter/>
        <FeatureButton
          selected={activeFeature === Feature.GitHubCode}
          onClick={() => setActiveFeature(Feature.GitHubCode)}
        >
          Search code on GitHub
        </FeatureButton>
      </FeaturesWrapper>

      {activeFeature === Feature.StackOverflow &&
        <DevbookImg src={devbookPreviewSOImg} />
      }
      {activeFeature === Feature.GitHubCode &&
        <DevbookImg src={devbookPreviewCodeImg} />
      }
    </Container>
  );
}

export default IntroductionPage;
