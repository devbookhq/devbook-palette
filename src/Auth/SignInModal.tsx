import React, { useState } from 'react';
import styled from 'styled-components';

import Modal from 'components/Modal';
import Button from 'components/Button';
import { signIn } from 'Auth';

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

interface SignInModalProps {
  onCloseRequest?: () => void;
}

function SignInModal({ onCloseRequest }: SignInModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  function handleEmailInputChange(e: any) {
    setEmail(e.target.value);
  }

  async function handleCloseRequest() {
    onCloseRequest?.();
  }

  async function handleSignIn() {
    if (isLoading) return;
    setIsLoading(true);
    setError('');

    if (!email) {
      setError('Email is empty')
      return;
    }

    try {
      await signIn(email);
      onCloseRequest?.();
    } catch (error) {
      console.error(error.message);
      setError('Problem signing in');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <StyledModal
      onCloseRequest={handleCloseRequest}
    >
      <Title>
        Sign in with your email
      </Title>

      <Description>
        Click on the sign-in button and you'll receive an email with a sign-in link.
      </Description>

      <InputWrapper>
        <InputTitle>EMAIL</InputTitle>
        <EmailInput
          placeholder="your@email.com"
          value={email}
          onChange={handleEmailInputChange}
        />
     </InputWrapper>

      {error &&
        <Error>
          {error}
        </Error>
      }
      <SignInButton
        onClick={handleSignIn}
      >
        Sign in to Devbook
     </SignInButton>
    </StyledModal>
  );
}

export default SignInModal;
