// Importações necessárias do React, React Router e do contexto de autenticação.
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../core/Button';

// Componente da barra de navegação superior.
const Navbar: React.FC = () => {
  // Obtém o estado de autenticação (usuário atual, status de carregamento) e a função de logout do contexto.
  const { currentUser, logout, isLoading } = useAuth();
  const navigate = useNavigate();

  // Função para lidar com o evento de logout.
  const handleLogout = () => {
    logout(); // Chama a função de logout do contexto.
    navigate('/'); // Redireciona o usuário para a página inicial.
  };

  return (
    <nav className="bg-secondary shadow-lg sticky top-0 z-40">
      <div className="container mx-auto px-6 py-3 flex justify-between items-center">
        {/* Link do logotipo que leva para a página inicial. */}
        <Link to="/" className="text-2xl font-bold text-accent hover:text-opacity-80 transition-colors">
          CodeTugaBuilds
        </Link>
        <div className="flex items-center space-x-4">
          {/* Renderização condicional com base no estado de autenticação. */}
          {isLoading ? (
            // Exibe "Carregando..." enquanto o estado de autenticação é verificado.
            <span className="text-neutral-dark">Carregando...</span>
          ) : currentUser ? (
            // Se houver um usuário logado, exibe os links do painel e de logout.
            <>
              <Link to="/dashboard" className="text-neutral hover:text-accent transition-colors px-3 py-2 rounded-md text-sm font-medium">
                Painel
              </Link>
              {/* O `state={{ newBuild: true }}` é usado para instruir a BuildPage a resetar seu estado. */}
              <Link to="/build" state={{ newBuild: true }} className="text-neutral hover:text-accent transition-colors px-3 py-2 rounded-md text-sm font-medium">
                Nova Montagem
              </Link>
              <span className="text-neutral-dark text-sm hidden md:block">Olá, {currentUser.nome}!</span>
              <Button onClick={handleLogout} variant="ghost" size="sm">
                Sair
              </Button>
            </>
          ) : (
            // Se não houver usuário logado, exibe os links de Login e Cadastro.
            <>
              <Link to="/login" className="text-neutral hover:text-accent transition-colors px-3 py-2 rounded-md text-sm font-medium">
                Login
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Cadastrar
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
