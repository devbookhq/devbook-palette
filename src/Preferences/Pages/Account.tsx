import styled from 'styled-components';

import Base from './Base';

const Container = styled.div`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

function Account() {
  return (
    <Base title="Account">
      <Container>
        You don't have to be signed in to use Devbook now
      </Container>
    </Base>
  );
}

export default Account;
