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
  font-size: 15px;
  font-weight: 400;
  text-decoration: none;
  color: #3B3A4A;

  :hover {
    color: #FFFFFF;
    cursor: pointer;
  }

  padding: 10px 10px 10px 15px;
  margin: 3px 0px;
  width: 100%;
`;

const DevbookWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 15px 0 0 15px;
`;

const DevbookTitle = styled.div`
  font-weight: 500;
  font-size: 20px;
  line-height: 24px;
  margin: 0 0 5px;
`;

const DevbookLogo = styled.img`
  height: auto;
  width: 50px;
  vertical-align: middle;
  margin: 0 5px 0 -7px;
`;

const Title = styled.div`
  font-size: 17px;
  font-weight: 500;
  margin: 15px 0 5px 15px;
`;

const Sidebar = styled.div`
  height: 100%;
  padding: 25px 0px 0px 0px;
  width: 225px;
  min-width: 225px;
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
          <DevbookLogo src={logo} />
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
            color: '#FFFFFF',
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
