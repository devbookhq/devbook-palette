import React from 'react';
import styled from 'styled-components';
import electron from 'mainProcess';
import trayPreviewMacImg from 'img/tray-preview-mac.png';
import trayPreviewWinImg from 'img/tray-preview-win.png';
import trayPreviewDebImg from 'img/tray-preview-deb.png';

const Content = styled.div`
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
  font-size: 21px;
  font-weight: 500;
`;

const Subtitle = styled.span`
  margin-top: 10px;
  color: white;
  font-size: 16px;
  font-weight: 400;
`;

const TrayImg = styled.img`
  margin-top: 20px;
  height: auto;
  border-radius: 5px;
  box-shadow: 0 0 20px 7px rgba(0, 0, 0, 0.25);
`;

function TrayPage() {
  return (
    <Content>
      <Titles>
        <Title>How it works</Title>
        <Subtitle>
          Sidekick runs in your tray bar in background.
        </Subtitle>
      </Titles>

      {electron.remote.process.platform === 'darwin' && (
        <TrayImg src={trayPreviewMacImg} />
      )}
      {/* TODO: Add image for Ubuntu */}
      {electron.remote.process.platform === 'linux' && (
        <TrayImg src={trayPreviewDebImg} />
      )}
      {electron.remote.process.platform === 'win32' && (
        <TrayImg src={trayPreviewWinImg} />
      )}
    </Content>
  );
}

export default TrayPage;

