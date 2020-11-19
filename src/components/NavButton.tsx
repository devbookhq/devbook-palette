import styled from 'styled-components';
import { NavLink } from 'react-router-dom';


const NavButton = styled(NavLink)`
  font-size: 16px;
  font-weight: 400;
  text-decoration: none;
  color: #6E7075;

  :hover {
    color: #FFFFFF;
    cursor: pointer;
  }
`;


export default NavButton;
