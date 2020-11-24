import React, { useState } from 'react';
import styled from 'styled-components';

import SearchInput from './SearchInput';

const Content = styled.div`
  padding: 20px 30px;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
`;

const Input = styled.input`
  width: 400px;
  padding: 10px 13px;

  color: white;
  font-family: 'Source Code Pro';
  font-weight: 600;
  font-size: 14px;

  border-radius: 10px;
  background: #2B2D2F;
  border: 1px solid #404244;
  outline: none;
`;

function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <Content>
      <SearchInput
        placeholder="Question or code"
        value={searchQuery}
        onChange={e => setSearchQuery(e.target.value)}
      />
    </Content>
  );
}

export default Home;

