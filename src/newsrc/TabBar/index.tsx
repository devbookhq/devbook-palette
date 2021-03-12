import React from 'react';
import { useRouteMatch } from 'react-router-dom';
import { observer } from 'mobx-react-lite';
import styled from 'styled-components';

import * as Colors from 'newsrc/ui/colors';
import { TextButton } from 'newsrc/ui/Button';
import { RouterLink } from 'newsrc/ui/Link';
import Loader from 'components/Loader';

import { useUserStore } from 'newsrc/user/user.store';
import { AuthState } from 'newsrc/user/authState';

const Container = styled.div`
  width: 100%;
  height: 32px;
  padding: 8px 12px;

  display: flex;
  align-items: center;
  justify-content: flex-end;

  background: ${Colors.Charcoal.light};
  z-index: 2; /* Move above the dragging area */
`;

function TabBar() {
  const { url } = useRouteMatch();
  const userStore = useUserStore();

  return (
    <Container>
      {userStore.isLoading &&
        <Loader/>
      }
      {!userStore.isLoading &&
        <RouterLink
          to={`${url}/sign-in`}
        >
          {userStore.state === AuthState.UserSignedIn && <>signed in</>}
          {userStore.state === AuthState.NoUser && <>Sign in</>}
        </RouterLink>
      }
      {userStore.isSignedIn &&
        <button
          onClick={() => userStore.signOut()}
        >
          Sign out
        </button>
      }
    </Container>
  );
}

export default observer(TabBar);


