
import React, { ReactNode } from 'react';
import Navbar from './Navbar';
// Não precisamos mais de getUserLocation ou GeoLocation aqui

interface LayoutProps {
  children: ReactNode;
}

const Footer: React.FC = () => {
  // A lógica de geolocalização foi removida daqui
  return (
    <footer className="bg-secondary text-neutral-dark py-8 mt-auto">
      <div className="container mx-auto px-6 text-center">
        <p>&copy; {new Date().getFullYear()} CodeTugaBuilds. Todos os direitos reservados.</p>
        <p className="text-sm mt-1">Montador de PCs Inteligente</p>
        <div className="mt-4">
          <a href="/docs.html" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline text-sm">
            Ver Documentação do Projeto
          </a>
        </div>
      </div>
    </footer>
  );
};


const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen bg-primary text-neutral">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;