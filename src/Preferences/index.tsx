import {
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';
import {
  Route,
  Redirect,
  Switch,
  useHistory,
} from 'react-router-dom';
import { NavLink } from 'react-router-dom';

import Button from 'components/Button';
import useIPCRenderer from 'hooks/useIPCRenderer';

import GeneralPreferences from './Pages/GeneralPreferences';
import Account from './Pages/Account';
import { PreferencesPage } from './preferencesPage';

import logo from 'img/logo.png';
import IPCService, { IPCInvokeChannel, IPCOnChannel, IPCSendChannel } from 'services/ipc.service';
import { UpdateLocation } from 'services/appWindow';
import ElectronService from 'services/electron.service';

const Container = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  display: flex;
`;

const Sidebar = styled.div`
  height: 100%;
  padding: 25px 0 10px;
  min-width: 230px;

  display: flex;
  flex-direction: column;
  justify-content: space-between;


  background: #23222D;
  border-right: 1px solid #3B3A4A;
`;

const SidebarContent = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
`;

const Version = styled.div`
  padding: 0 15px;
  width: 100%;
  color: #959CB1;
  font-size: 14px;
  font-weight: 400;
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

const UpdateWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const UpdateButton = styled(Button)`
  /* align-self: center; */

  margin: 0px 15px 10px;
`;

function Preferences() {
  const history = useHistory();
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    async function checkUpdateStatus() {
      const isNewUpdateAvailable = await IPCService.invoke(IPCInvokeChannel.UpdateStatus, undefined);
      if (isNewUpdateAvailable) {
        setIsUpdateAvailable(true);
      }
    }
    checkUpdateStatus();
  }, []);

  useEffect(() => {
    IPCService.send(IPCSendChannel.GetAuthFromMainWindow, undefined);
  }, []);

  useIPCRenderer(IPCOnChannel.UpdateAvailable, () => {
    setIsUpdateAvailable(true);
  });

  useIPCRenderer(IPCOnChannel.GoToPreferencesPage, (_, { page }: { page: PreferencesPage }) => {
    history.push(`/preferences/${page}`);
  });

  function handleUpdate() {
    IPCService.send(IPCSendChannel.RestartAndUpdate, { location: UpdateLocation.Preferences });
  }

  return (
    <Container>
      <Sidebar>
        <SidebarContent>
          <DevbookWrapper>
            <DevbookLogo src={logo} />
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
            to="/preferences/account"
            activeStyle={{
              background: '#3B3A4A',
            }}
          >
            Account
          </LinkButton>
        </SidebarContent>
        <UpdateWrapper>
          {isUpdateAvailable &&
            <UpdateButton onClick={handleUpdate}>
              {'Restart & Update'}
            </UpdateButton>
          }
          <Version>v{ElectronService.appVersion}</Version>
        </UpdateWrapper>
      </Sidebar>

      <Switch>
        <Route
          path="/preferences"
          exact
        >
          <Redirect to="/preferences/general" />
        </Route>

        <Route
          path="/preferences/general"
          exact
          component={GeneralPreferences}
        />

        <Route
          path="/preferences/account"
          exact
          component={Account}
        />
      </Switch>
    </Container>
  );
}

export default Preferences;
