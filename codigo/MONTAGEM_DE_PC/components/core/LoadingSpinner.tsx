// Importa o React.
import React from 'react';

// Define as propriedades que o componente LoadingSpinner pode receber.
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'; // Tamanho do spinner.
  color?: string; // Classe de cor do Tailwind CSS (ex: 'text-accent').
  text?: string; // Texto opcional para ser exibido abaixo do spinner.
}

// Componente funcional para exibir um ícone de carregamento.
const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ size = 'md', color = 'text-accent', text }) => {
  // Mapeia os tamanhos para as classes correspondentes do Tailwind.
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-10 h-10 border-4',
    lg: 'w-16 h-16 border-4',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      {/* O elemento do spinner. A animação 'animate-spin' é do Tailwind. */}
      {/* O truque de 'border-t-transparent' cria o efeito de "arco" girando. */}
      <div
        className={`animate-spin rounded-full ${sizeClasses[size]} ${color} border-t-transparent`}
        style={{ borderTopColor: 'transparent' }}
        role="status" // Atributo de acessibilidade para indicar um estado de carregamento.
        aria-live="polite"
      >
         <span className="sr-only">Carregando...</span> {/* Texto para leitores de tela */}
      </div>
      {/* Exibe o texto se ele for fornecido. */}
      {text && <p className={`text-sm ${color}`}>{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
