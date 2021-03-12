import React, {
  useRef,
  useEffect,
  useState,
} from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';

import useEventListener from 'newsrc/hooks/useEventListener';
import { useUserStore } from 'newsrc/user/user.store';
import { AuthState } from 'newsrc/user/authState';
import { AuthErrorType } from 'newsrc/user/authError';
import Input from 'newsrc/ui/Input';
import { TitleLarge, TitleNormal } from 'newsrc/ui/Title';
import { RegularText } from 'newsrc/ui/Text';
import { Button } from 'newsrc/ui/Button';
import { RouterLink } from 'newsrc/ui/Link';
import Loader from 'newsrc/ui/Loader';
import * as Colors from 'newsrc/ui/colors';
import * as Typography from 'newsrc/ui/typography';

const Container = styled.div`
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  background: ${Colors.Charcoal.normal}
`;

const Form = styled.div`
  margin: 32px 0 16px;
  width: 310px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const InputWrapper = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
`;

const ErrorMessage = styled.span` margin-top: 4px;
  font-size: ${Typography.Body.regular.normal.fontSize};
  font-weight: ${Typography.Body.regular.normal.fontWeight};
  color: ${Colors.Red.normal};
`;

const SignInButton = styled(Button)`
  margin-top: 16px;
`;

const EmailRegularText = styled(RegularText)`
  margin: 16px 0;
`;

const StyledRouterLink = styled(RouterLink)`
  margin-top: 8px;
`;

function SignIn() {
  const inputRef = useRef<HTMLInputElement>(null);
  const userStore = useUserStore();
  const history = useHistory();
  const [email, setEmail] = useState('vasek@usedevbook.com');
  const [error, setError] = useState('');

  function isEmailValid() {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

  async function checkInputAndSignIn() {
    if (userStore.state === AuthState.SigningInUser) return;

    setError('');

    if (!email) {
      setError('Please enter an email to sign in.');
      return;
    }

    if (!isEmailValid()) {
      setError('Please enter a valid email address to sign in.');
      return;
    }

    userStore.signIn(email);
  }

  function handleInputKeyDown(e: any) {
    // User pressed enter.
    if (e.keyCode === 13) {
      checkInputAndSignIn();
    }
  }

  useEventListener('keydown', (e: any) => {
    // User pressed escape.
    if (e.keyCode === 27) {
      history.replace('/app');
    }
  }, [history]);

  useEffect(() => {
    inputRef?.current?.focus();
  }, []);

  useEffect(() => {
    if (
      !userStore.error ||
      userStore.error.type !== AuthErrorType.FailedSigningInUser
    ) return;
    setError(userStore.error?.message);
  }, [userStore.error?.message]);

  useEffect(() => {
    if (userStore.state === AuthState.UserSignedIn) {
      history.replace('/app');
    }
  }, [userStore.state]);

  return (
    <>
      {userStore.isLoading &&
        <Container>
          <TitleLarge>Check your email</TitleLarge>

          <EmailRegularText isLarge>
            We sent an email to <b>{email}</b> with the sign-in link. Click on the link to sign-in...
          </EmailRegularText>
          <Loader/>
          <StyledRouterLink
            to="/app/sign-in"
            isDark
          >
            Sign in with different email
          </StyledRouterLink>
        </Container>
      }

      {!userStore.isLoading &&
        <Container>
          {userStore.state === AuthState.NoUser &&
            <>
              <TitleLarge>Sign in to Devbook</TitleLarge>
              <Form>
                <InputWrapper>
                  <Input
                    ref={inputRef}
                    placeholder="Enter your email address..."
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                  />
                  {error &&
                    <ErrorMessage>{error}</ErrorMessage>
                  }
                </InputWrapper>

                <SignInButton
                  onClick={checkInputAndSignIn}
                >
                  Sign in with email
                </SignInButton>
              </Form>
              <RouterLink
                to="/app"
                isDark
              >
                Go back
              </RouterLink>
            </>
          }
        </Container>
      }
    </>
  );
}

export default observer(SignIn);

