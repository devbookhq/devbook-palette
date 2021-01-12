import React, {
  useEffect,
  useState,
} from 'react';
import styled from 'styled-components';
import Base from './Base';
import Button from 'components/Button';

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

const SignInButton = styled(Button)``;

interface AccountProps {
  user?: any; // TODO: Add a proper type.
}

function Account({ user }: AccountProps) {
  return (
    <Base title="Account">
      <Container>
        {user &&
          <>
            <Email>
              {user.email}
            </Email>
            {/* TODO: Implement onClick */}
            <SignOutButton onClick={() => {}}>
              Sign Out
            </SignOutButton>
          </>
        }

        {!user &&
          <SignInWrapper>
            <SignInText>
              You are not signed in
            </SignInText>

            {/* TODO: Implement onClick */}
            <SignInButton onClick={() => {}}>
              Sign in to Devbook
            </SignInButton>
          </SignInWrapper>
        }
      </Container>
    </Base>
  );
}

export default Account;

