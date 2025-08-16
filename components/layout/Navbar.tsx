/**
 * @file Componente Navbar.
 * @module components/layout/Navbar
 * @description Barra de navegação superior da aplicação, versão simplificada sem autenticação.
 */

import React from 'react';
import { Link } from 'react-router-dom';

/**
 * @component Navbar
 * @description Componente da barra de navegação superior simplificado.
 * Exibe apenas os links essenciais sem funcionalidades de autenticação.
 * @returns {React.ReactElement} O elemento da barra de navegação.
 */
const Navbar: React.FC = () => {
  return (
    <nav className="bg-secondary shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-accent hover:text-opacity-80 transition-colors">
          CodeTugaBuilds
        </Link>
        <div className="flex items-center space-x-4">
          <Link to="/build" className="text-neutral hover:text-accent transition-colors px-3 py-2 rounded-md text-sm font-medium">
            Montar PC
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;