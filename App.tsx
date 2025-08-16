/**
 * @file Componente principal da aplicação e configuração de rotas.
 * @module App
 * @description
 * Este arquivo define a estrutura de roteamento da aplicação usando `react-router-dom`.
 * Versão simplificada sem autenticação, focada apenas na funcionalidade de montagem de PCs.
 */

import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import Layout from './components/layout/Layout';
import HomePage from './pages/HomePage';
import { BuildPage } from './pages/BuildPage';

/**
 * @component App
 * @description O componente raiz da aplicação que configura todas as rotas.
 * Versão simplificada sem autenticação, apenas com as funcionalidades essenciais.
 * @returns {React.ReactElement} A aplicação completa com roteamento.
 */
const App: React.FC = () => {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          {/* --- Rotas Públicas --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/build" element={<BuildPage />} />
          <Route path="/build/:buildId" element={<BuildPage />} />

          {/* Rota de fallback para 404 */}
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
    </HashRouter>
  );
};

export default App;