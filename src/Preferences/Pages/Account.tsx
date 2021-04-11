import styled from 'styled-components';
import { useUserStore } from 'user/user.store';
import { AuthState } from 'user/authState';

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

const InfoWrapper = styled.div`
  padding: 5px;
  height: 100%;
  display: flex;
  margin: auto;
  align-items: center;
  justify-content: center;
  flex-direction: column;
`;

const InfoMessage = styled.div`
  color: #5A5A6F;
  font-size: 16px;
  font-weight: 600;
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
  const userStore = useUserStore();

  return (
    <Base title="Account">
      {userStore.isReconnecting &&
        <InfoWrapper>
          <InfoMessage>Contacting Devbook servers failed.</InfoMessage>
          <InfoMessage>Reconnecting...</InfoMessage>
        </InfoWrapper>
      }

      {!userStore.isReconnecting &&
        <Container>
          {userStore.isLoading &&
            <StyledLoader />
          }

          {userStore.user &&
            !userStore.isLoading &&
            <>
              <Email>
                {userStore.auth.user?.email}
              </Email>
              <SignOutButton onClick={() => { throw new Error('Not implemented') }}>
                Sign Out
              </SignOutButton>
            </>
          }

          {!userStore.user &&
            !userStore.isLoading &&
            <SignInWrapper>
              <SignInText>
                You are not signed in
            </SignInText>

              <SignInButton onClick={() => { throw new Error('Not implemented') }}>
                Sign in to Devbook
            </SignInButton>
            </SignInWrapper>
          }
        </Container>
      }
    </Base>
  );
}

export default Account;
