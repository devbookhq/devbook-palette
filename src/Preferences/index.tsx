import React from 'react';
import styled from 'styled-components';
import {
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
import { NavLink } from 'react-router-dom';

import Integrations from './Integrations';

import logo from 'img/logo.png';

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
`;

const LinkButton = styled(NavLink)`
  margin: 3px 0;
  padding: 5px 15px;
  width: 100%;

  font-size: 16px;
  font-weight: 400;
  color: #3B3A4A;
  text-decoration: none;

  :hover {
    color: #fff;
    cursor: pointer;
  }
`;

const DevbookWrapper = styled.div`
  margin-top: 15px;
  padding: 0 15px 5px 8px;

  display: flex;
  align-items: center;
`;

const DevbookLogo = styled.img`
  height: auto;
  width: 50px;
  margin-right: 10px;
  vertical-align: middle;
`;

const DevbookTitle = styled.div`
  margin: 0 0 5px;
  font-weight: 500;
  font-size: 20px;
  line-height: 24px;
`;

const Title = styled.div`
  margin-top: 15px;
  padding: 0 15px;
  font-size: 17px;
  font-weight: 500;
`;

const Sidebar = styled.div`
  height: 100%;
  padding: 25px 0;
  min-width: 230px;

  display: flex;
  flex-direction: column;

  background: #23222D;
  border-right: 1px solid #3B3A4A;
`;

function Preferences() {
  return (
    <Container>
      <Sidebar>
        <DevbookWrapper>
          <DevbookLogo src={logo}/>
          <DevbookTitle>
            Devbook
          </DevbookTitle>
        </DevbookWrapper>

        <Title>
          Preferences
        </Title>
        <LinkButton
          to="/preferences/integrations"
          activeStyle={{
            background: '#3B3A4A',
            color: '#fff',
          }}
        >
          Integrations
        </LinkButton>
      </Sidebar>

      <Switch>
        <Route
          path="/preferences"
          exact
        >
          <Redirect to={{ pathname: "/preferences/integrations" }} />
        </Route>
        <Route
          path="/preferences/integrations"
          exact
          component={Integrations}
        >
        </Route>
      </Switch>
    </Container>
  );
}

export default Preferences;

