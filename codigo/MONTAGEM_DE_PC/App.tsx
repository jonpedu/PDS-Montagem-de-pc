// Importa as bibliotecas e componentes necessários.
import React from 'react';
import { HashRouter, Routes, Route, Navigate, Outlet, useLocation, Link } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import { BuildPage } from './pages/BuildPage';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import ProfilePage from './pages/ProfilePage';
import LoadingSpinner from './components/core/LoadingSpinner';

/**
 * Componente de Rota Protegida.
 * Verifica se o usuário está autenticado antes de permitir o acesso a uma rota.
 */
const ProtectedRoute: React.FC = () => {
  const { currentUser, isLoading } = useAuth(); // Obtém o estado de autenticação do contexto.
  const location = useLocation(); // Obtém a localização atual para redirecionamento.

  // Enquanto o estado de autenticação está sendo verificado, exibe um spinner.
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner size="lg" text="Verificando autenticação..." /></div>;
  }

  // Se não houver usuário logado, redireciona para a página de login.
  // `state={{ from: location }}` passa a página original para que o usuário possa ser redirecionado de volta após o login.
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  // Se o usuário estiver logado, renderiza o conteúdo da rota filha através do <Outlet />.
  return <Outlet />;
};


// Componente principal da aplicação que configura o roteamento.
const App: React.FC = () => {
  return (
    // HashRouter é usado para compatibilidade com diferentes ambientes de hospedagem (especialmente estáticos).
    <HashRouter>
      {/* AuthProvider envolve toda a aplicação, disponibilizando o contexto de autenticação para todos os componentes. */}
      <AuthProvider>
        {/* Layout envolve todas as rotas, fornecendo a estrutura base da página (Navbar, Footer). */}
        <Layout>
          {/* O componente Routes define as rotas da aplicação. */}
          <Routes>
            {/* Rotas Públicas */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<AuthPage mode="login" />} />
            <Route path="/register" element={<AuthPage mode="register" />} />
            
            {/* As rotas de montagem são públicas para permitir que usuários anônimos as acessem. */}
            <Route path="/build" element={<BuildPage />} />
            <Route path="/build/:buildId" element={<BuildPage />} />

            {/* Rotas Protegidas */}
            {/* O componente ProtectedRoute envolve as rotas que exigem autenticação. */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
            
            {/* Rota de fallback para páginas não encontradas (404). */}
            <Route path="*" element={
              <div className="text-center py-10">
                <h1 className="text-4xl font-bold text-accent mb-4">404 - Página Não Encontrada</h1>
                <p className="text-neutral-dark">Desculpe, a página que você está procurando não existe.</p>
                <Link to="/" className="mt-6 inline-block px-6 py-2 text-sm font-medium text-primary bg-accent rounded hover:bg-opacity-80 transition">
                  Voltar para Home
                </Link>
              </div>
            } />
          </Routes>
        </Layout>
      </AuthProvider>
    </HashRouter>
  );
};

export default App;