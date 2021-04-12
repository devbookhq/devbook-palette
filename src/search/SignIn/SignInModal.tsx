import { useState } from 'react';
import styled from 'styled-components';
import { observer } from 'mobx-react-lite';

import AnalyticsService, { AnalyticsEvent } from 'services/analytics.service';
import Modal from 'components/Modal';
import Button from 'components/Button';
import Loader from 'components/Loader';
import { ReactComponent as checkIcon } from 'img/check-circle.svg';
import { useUIStore } from 'ui/ui.store';
import { useUserStore } from 'user/user.store';

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

function SignInModal() {
  const userStore = useUserStore();
  const uiStore = useUIStore();

  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  function handleEmailInputChange(e: any) {
    setEmail(e.target.value);
  }

  async function handleCloseRequest() {
    uiStore.toggleSignInModal();
  }

  async function handleSignInButtonClick() {
    AnalyticsService.track(AnalyticsEvent.SignInButtonClicked, undefined);
    if (userStore.isLoading) return;
    setError('');

    if (!email) {
      setError('Email is empty.')
      return;
    }

    try {
      await userStore.signIn(email)
      setError('');
      AnalyticsService.track(AnalyticsEvent.SignInFinished, undefined);
    } catch (error) {
      console.error(error.message);
      setError(error.message);
      AnalyticsService.track(AnalyticsEvent.SignInFailed, error);
    }
  }

  async function handleSignInAgainButtonClick() {
    AnalyticsService.track(AnalyticsEvent.SignInAgainButtonClicked, undefined);
    await userStore.cancelSignIn();
  }

  function handleEmailInputOnKeyDown(e: any) {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSignInButtonClick();
    }
  }

  function handleContinueIntoAppButtonClick() {
    AnalyticsService.track(AnalyticsEvent.ContinueIntoAppButtonClicked, undefined);
    uiStore.toggleSignInModal();
  }

  return (
    <StyledModal
      onCloseRequest={handleCloseRequest}
    >
      {!userStore.user && !userStore.isLoading &&
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

      {!userStore.user && userStore.isLoading && !userStore.error &&
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

      {userStore.user &&
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
    </StyledModal >
  );
}

export default observer(SignInModal);
