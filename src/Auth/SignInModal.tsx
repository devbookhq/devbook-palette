import React, {
  useState,
  useEffect,
  useCallback,
} from 'react';
import styled from 'styled-components';

import Modal from 'components/Modal';
import Button from 'components/Button';
import { signIn, cancelSignIn } from 'Auth';


const StyledModal = styled(Modal)`
  height: 100%;
  margin: 60px 0 69px;
  min-width: 550px;

  display: flex;
  flex-direction: column;

  overflow: hidden;
  background: #1C1B26;
  border-radius: 5px;
  border: 1px solid #3B3A4A;
`;

const SignInButton = styled(Button)`
  margin-bottom: 15px;
  padding: 10px 20px;

  font-size: 15px;
  font-weight: 500;

  border-radius: 5px;
`;

const CancelSignInButton = styled.div`
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

const EmailInput = styled.input`
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
    cancelSignIn()
  }

  async function handleSignIn() {
    if (email && email !== '') {
      setError('Email must not be empty')
    }

    setIsLoading(true);
    setError('');
    try {
      await signIn(email);
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
      <EmailInput disabled={isLoading} value={email} onChange={handleEmailInputChange} />

      {
        isLoading
        &&
        <CancelSignInButton
          onClick={cancelSignIn}
        >
          Cancel
       </CancelSignInButton>
      }

      {
        !isLoading
        &&
        <SignInButton
          disabled={email.length < 1}
          onClick={handleSignIn}
        >
          Sign In
       </SignInButton>
      }
    </StyledModal >
  );
}

export default SignInModal;
