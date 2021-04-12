import styled from 'styled-components';
import { useUIStore } from 'ui/ui.store';
import SignInModal from './SignInModal';
import InfoMessage from 'components/InfoMessage';
import InfoText from 'components/InfoMessage/InfoText';
import { observer } from 'mobx-react-lite';
import { useCallback } from 'react';
import Button from 'components/Button';

const SignInRequest = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const SignInButton = styled(Button)`
  margin-top: 8px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 500;
  border-radius: 5px;
`;

const SignInAgainButton = styled(Button)`
  margin-top: 8px;
  padding: 10px 20px;
  color: #535BD7;
  font-size: 15px;
  font-weight: 500;
  border-radius: 5px;
  background: transparent;
  border: 1px solid #535BD7;
  :hover {
    background: transparent;
    color: #646CEA;
    border: 1px solid #646CEA;
    cursor: pointer;
  }
`;

interface SignInProps {
  isLoading: boolean;
  isSigningInUser: boolean;
}

function SignIn({ isLoading, isSigningInUser }: SignInProps) {
  const uiStore = useUIStore();

  const openSignInModal = useCallback(() => {
    uiStore.toggleSignInModal();
  }, [uiStore]);

  return (
    <>
      {uiStore.isSignInModalOpened &&
        <SignInModal />
      }
      {!uiStore.isSignInModalOpened &&
        isSigningInUser &&
        <InfoMessage>
          <SignInRequest>
            <InfoText>
              You're being signed in. Please check your email.
            </InfoText>
            <SignInAgainButton
              onClick={openSignInModal}
            >
              Sign in with a different email
            </SignInAgainButton>
          </SignInRequest>
        </InfoMessage>
      }
      {!uiStore.isSignInModalOpened &&
        !isLoading &&
        <InfoMessage>
          <SignInRequest>
            <InfoText>You need to sign in to search documentation</InfoText>
            <SignInButton
              onClick={openSignInModal}
            >
              Sign in to Devbook
          </SignInButton>
          </SignInRequest>
        </InfoMessage>
      }
    </>
  );
}

export default observer(SignIn);
