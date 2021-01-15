import React, { useState } from 'react';
import styled from 'styled-components';
import devbookPreviewSOImg from 'img/onboarding-so-preview.png';
import devbookPreviewCodeImg from 'img/onboarding-code-preview.png';
import devbookPreviewDocsImg from 'img/onboarding-docs-preview.png';

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
  margin: 20px 0 10px;
  height: auto;
  max-width: 850px;
  width: 100%;
  box-shadow: 0px 4px 25px 10px rgba(0, 0, 0, 0.25);
`;

enum Feature {
  StackOverflow,
  GitHubCode,
  Docs,
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
        <Delimiter/>
        <FeatureButton
          selected={activeFeature === Feature.Docs}
          onClick={() => setActiveFeature(Feature.Docs)}
        >
          Search in documentation
        </FeatureButton>
      </FeaturesWrapper>

      {activeFeature === Feature.StackOverflow &&
        <DevbookImg src={devbookPreviewSOImg} />
      }
      {activeFeature === Feature.GitHubCode &&
        <DevbookImg src={devbookPreviewCodeImg} />
      }
      {activeFeature === Feature.Docs &&
        <DevbookImg src={devbookPreviewDocsImg} />
      }
    </Container>
  );
}

export default IntroductionPage;
