import React, { useState, useContext, useEffect } from 'react';
import styled from 'styled-components';

import {
  trackSignInButtonClicked,
  trackSignInAgainButtonClicked,
  trackSignInFinished,
  trackSignInFailed,
  trackContinueIntoAppButtonClicked,
} from 'mainCommunication';
import Modal from 'components/Modal';
import Button from 'components/Button';
import Loader from 'components/Loader';
import {
  signIn,
  cancelSignIn,
  AuthContext,
  AuthState,
} from '.';
import { ReactComponent as checkIcon } from 'img/check-circle.svg';

const StyledModal = styled(Modal)`
  padding: 15px;
  height: 100%;
  margin: 60px 0 69px;
  min-width: 550px;

  display: flex;
  flex-direction: column;
  align-items: center;

  background: #1C1B26;
  border-radius: 5px;
  border: 1px solid #3B3A4A;
`;

const Title = styled.h1`
  margin: 0 0 10px;

  color: #fff;
  text-align: center;
  font-size: 18px;
  font-weight: 500;
`;

const Description = styled.div`
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
  color: #C1C9D2;
`;

const SignInButton = styled(Button)`
  margin-bottom: 15px;
  padding: 10px 20px;

  font-size: 15px;
  font-weight: 500;

  border-radius: 5px;
`;

const ContinueIntoAppButton = styled(Button)`
  margin-top: 15px;
  padding: 10px 20px;

  font-size: 15px;
  font-weight: 500;

  border-radius: 5px;
`;

const SignInAgainButton = styled(Button)`
  margin-top: 15px;
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

const InputWrapper = styled.div`
  margin-bottom: 20px;
  width: 100%;
  max-width: 350px;

  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const InputTitle = styled.span`
  margin-bottom: 3px;
  font-size: 14px;
  color: #5A5A6F;
`;

const Error = styled.div`
  margin: 15px 0 10px;
  padding: 5px 10px;
  color: #F44444;
  background: #462323;
  border-radius: 5px;
`;

const EmailInput = styled.input`
  padding: 8px 10px;
  width: 100%;

  color: #fff;
  font-size: 14px;
  font-family: 'Poppins';
  font-weight: 500;

  border: 1px solid #535BD7;
  border-radius: 5px;
  background: #23222D;
`;

const CheckIcon = styled(checkIcon)`
  margin-top: 20px;
`;

interface SignInModalProps {
  onCloseRequest?: () => void;
}

function SignInModal({ onCloseRequest }: SignInModalProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const authInfo = useContext(AuthContext);

  const isLoading = authInfo.state === AuthState.SigningInUser;

  const isSignedIn = authInfo.state === AuthState.UserAndMetadataLoaded;

  function handleEmailInputChange(e: any) {
    setEmail(e.target.value);
  }

  async function handleCloseRequest() {
    onCloseRequest?.();
  }

  async function handleSignInButtonClick() {
    trackSignInButtonClicked();
    if (isLoading) return;
    setError('');

    if (!email) {
      setError('Email is empty')
      return;
    }

    try {
      await signIn(email);
      setError('');
      trackSignInFinished();
    } catch (error) {
      console.error(error.message);
      setError(error.message);
      trackSignInFailed(error);
    }
  }

  function handleSignInAgainButtonClick() {
    trackSignInAgainButtonClicked();
    cancelSignIn();
  }

  function handleEmailInputOnKeyDown(e: any) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSignInButtonClick();
    }
  }

  function handleContinueIntoAppButtonClick() {
    trackContinueIntoAppButtonClicked();
    onCloseRequest?.();
  }

  useEffect(() => {
    if (authInfo.isReconnecting) {
      cancelSignIn();
    }
  }, [
    authInfo.isReconnecting,
  ]);

  return (
    <StyledModal
      onCloseRequest={handleCloseRequest}
    >

      {authInfo.isReconnecting
        &&
        <InfoWrapper>
          <InfoMessage>Contacting Devbook servers failed.</InfoMessage>
          <InfoMessage>Reconnecting...</InfoMessage>
        </InfoWrapper>
      }

      {!authInfo.isReconnecting &&
        <>
          {!isSignedIn
            && !isLoading
            &&
            <>
              <Title>
                Sign in with your email
          </Title>

              <Description>
                Click on the sign-in button to receive an email with a sign-in link.
          </Description>

              <InputWrapper>
                <InputTitle>EMAIL</InputTitle>
                <EmailInput
                  autoFocus
                  placeholder="your@email.com"
                  value={email}
                  onChange={handleEmailInputChange}
                  onKeyDown={handleEmailInputOnKeyDown}
                />
              </InputWrapper>

              {error &&
                <Error>
                  {error}
                </Error>
              }
              <SignInButton
                onClick={handleSignInButtonClick}
              >
                Sign in to Devbook
         </SignInButton>
            </>
          }

          {!isSignedIn
            && isLoading
            && !error
            &&
            <>
              <Title>
                Check your email
          </Title>

              <Description>
                We just sent an email with the sign-in link to the following email address:
            <br />
                <strong>{email}</strong>
              </Description>

              <Description>
                Click on the link and you'll be signed-in in a few seconds...
          </Description>

              <Loader />

              <SignInAgainButton
                onClick={handleSignInAgainButtonClick}
              >
                Sign in again
         </SignInAgainButton>
            </>
          }

          {isSignedIn &&
            <>
              <Title>
                You are signed in!
          </Title>
              <CheckIcon />
              <ContinueIntoAppButton onClick={handleContinueIntoAppButtonClick}>
                Continue into the app
          </ContinueIntoAppButton>
            </>
          }
        </>
      }
    </StyledModal>
  );
}

export default SignInModal;
