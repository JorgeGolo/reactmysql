// Examenes.js
import React from 'react';
import { Link } from 'react-router-dom';

const Nav = () => {
  return (
    <nav>
    <Link to="/">Inicio</Link>
    <Link to="/examenes">Exámenes</Link>
  </nav>
  );
};

export default Nav;