// Importa React, o componente Navbar e o Toaster para notificações.
import React, { ReactNode } from 'react';
import Navbar from './Navbar';
import { Toaster } from 'react-hot-toast';

// Define as propriedades que o componente Layout pode receber.
interface LayoutProps {
  children: ReactNode; // O conteúdo da página a ser envolvido pelo layout.
}

// Componente do rodapé da página.
const Footer: React.FC = () => {
  return (
    <footer className="bg-secondary text-neutral-dark py-8 mt-auto">
      <div className="container mx-auto px-6 text-center">
        <p>&copy; {new Date().getFullYear()} CodeTugaBuilds. Todos os direitos reservados.</p>
        <p className="text-sm mt-1">Montador de PCs Inteligente</p>
      </div>
    </footer>
  );
};


// Componente principal de Layout que estrutura todas as páginas da aplicação.
const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    // Usa flexbox para garantir que o rodapé fique no final da página, mesmo em páginas com pouco conteúdo.
    <div className="flex flex-col min-h-screen bg-primary text-neutral">
      {/* Componente que renderiza as notificações toast. */}
      <Toaster 
        position="top-right"
        toastOptions={{
          className: '',
          style: {
            margin: '8px',
            background: '#1B263B', // secondary color
            color: '#E0E1DD', // neutral color
            border: '1px solid #778DA9', // neutral-dark
          },
          success: {
            iconTheme: {
              primary: '#41EAD4', // accent color
              secondary: '#0D1B2A', // primary color
            },
          },
           error: {
            iconTheme: {
              primary: '#ef4444', // red-500
              secondary: '#E0E1DD', // neutral color
            },
          },
        }}
      />
      {/* A barra de navegação é sempre exibida no topo. */}
      <Navbar />
      {/* O conteúdo principal da página (passado como `children`) é renderizado aqui. */}
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      {/* O rodapé é sempre exibido na parte inferior. */}
      <Footer />
    </div>
  );
};

export default Layout;