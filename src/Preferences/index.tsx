import React from 'react';
import styled from 'styled-components';
import {
  Route,
  Redirect,
  Switch,
} from 'react-router-dom';
import { NavLink } from 'react-router-dom';

import GeneralPreferences from './Pages/GeneralPreferences';
import Integrations from './Pages/Integrations';

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

  font-size: 15px;
  font-weight: 400;
  color: #fff;
  text-decoration: none;

  :hover {
    color: #fff;
    cursor: pointer;
    background: #3B3A4A;
  }
`;

const DevbookWrapper = styled.div`
  margin: 15px 0;
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
  font-size: 20px;
  font-weight: 600;
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

        <LinkButton
          replace
          to="/preferences/general"
          activeStyle={{
            background: '#3B3A4A',
          }}
        >
          Preferences
        </LinkButton>

        <LinkButton
          replace
          to="/preferences/integrations"
          activeStyle={{
            background: '#3B3A4A',
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
          <Redirect to="/preferences/general"/>
        </Route>

        <Route
          path="/preferences/general"
          exact
          component={GeneralPreferences}
        />

        <Route
          path="/preferences/integrations"
          exact
          component={Integrations}
        />
      </Switch>
    </Container>
  );
}

export default Preferences;

