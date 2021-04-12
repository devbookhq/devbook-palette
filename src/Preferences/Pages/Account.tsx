import styled from 'styled-components';
import { AuthState } from 'user/authState';

import Button from 'components/Button';
import Loader from 'components/Loader';
import Base from './Base';
import IPCService, { IPCOnChannel, IPCSendChannel } from 'services/ipc.service';
import { useEffect, useState } from 'react';
import { AuthInfo } from 'user/authInfo';
import AnalyticsService, { AnalyticsEvent } from 'services/analytics.service';

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const SignOutButton = styled.div`
  margin: 6px 0;

  color: #FF5865;
  font-weight: 500;
  font-size: 14px;
  user-select: none;

  :hover {
    cursor: pointer;
    color: white;
  }
`;

const SignInWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const SignInText = styled.div`
  margin-bottom: 15px;
`;

const StyledLoader = styled(Loader)`
  margin: 0 auto;
`;

const SignInButton = styled(Button)``;

function Account() {
  const [auth, setAuth] = useState<AuthInfo>();

  const openSignInModal = () => {
    IPCService.send(IPCSendChannel.OpenSignInModal, undefined);
  };

  const signOut = () => {
    AnalyticsService.track(AnalyticsEvent.SignOutButtonClicked, undefined);
    IPCService.send(IPCSendChannel.SignOut, undefined);
  };

  useEffect(() => {
    IPCService.on(IPCOnChannel.SetAuthInOtherWindows, (_, payload) => {
      setAuth(payload.auth);
    });
    IPCService.send(IPCSendChannel.GetAuthFromMainWindow, undefined);
  }, []);

  const isLoading = auth?.state === AuthState.LookingForStoredUser
    || auth?.state === AuthState.SigningInUser
    || auth?.state === AuthState.SigningOutUser;

  return (
    <Base title="Account">
      <Container>
        {isLoading &&
          <StyledLoader />
        }
        {!isLoading &&
          <>
            {auth?.user &&
              <>
                <span>
                  {auth?.user?.email}
                </span>
                <SignOutButton onClick={signOut}>
                  Sign Out
                </SignOutButton>
              </>
            }
            {!auth?.user &&
              <SignInWrapper>
                <SignInText>
                  You are not signed in
                </SignInText>

                <SignInButton onClick={openSignInModal}>
                  Sign in to Devbook
                </SignInButton>
              </SignInWrapper>
            }
          </>
        }
      </Container>
    </Base>
  );
}

export default Account;
