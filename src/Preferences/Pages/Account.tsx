import React, { useContext } from 'react';
import styled from 'styled-components';

import {
  AuthState,
  AuthContext,
} from 'Auth';
import {
  openSignInModal,
  signOutUser,
  trackSignOutButtonClicked,
} from 'mainProcess';
import Button from 'components/Button';
import Loader from 'components/Loader';

import Base from './Base';

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Email = styled.span`
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
  const authInfo = useContext(AuthContext);

  const isLoading =
    authInfo.state === AuthState.LookingForStoredUser ||
    authInfo.state === AuthState.SigningOutUser ||
    authInfo.state === AuthState.SigningInUser ||
    authInfo.state === AuthState.FetchingUserMetadata;

  function handleSignOutButtonClicked() {
    signOutUser();
    trackSignOutButtonClicked();
  }

  return (
    <Base title="Account">
      <Container>
        {isLoading &&
          < StyledLoader />
        }

        {!isLoading && authInfo.state === AuthState.UserAndMetadataLoaded &&
          <>
            <Email>
              {authInfo.metadata.email}
            </Email>
            <SignOutButton onClick={handleSignOutButtonClicked}>
              Sign Out
            </SignOutButton>
          </>
        }

        {!isLoading && authInfo.state === AuthState.NoUser &&
          <SignInWrapper>
            <SignInText>
              You are not signed in
            </SignInText>

            <SignInButton onClick={openSignInModal}>
              Sign in to Devbook
            </SignInButton>
          </SignInWrapper>
        }
      </Container>
    </Base>
  );
}

export default Account;
