// Importa React e seus tipos.
import React, { ReactNode } from 'react';

// Define as propriedades que o componente Modal pode receber.
interface ModalProps {
  isOpen: boolean; // Controla se o modal está visível ou não.
  onClose: () => void; // Função chamada quando o modal deve ser fechado.
  title?: string; // Título opcional para o modal.
  children: ReactNode; // Conteúdo a ser renderizado dentro do modal.
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'; // Tamanho do modal.
}

// Componente de modal genérico e reutilizável.
const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  // Se o modal não estiver aberto, não renderiza nada.
  if (!isOpen) return null;

  // Mapeia os tamanhos para as classes de largura máxima do Tailwind CSS.
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-full h-full',
  };

  return (
    // O backdrop (fundo escuro) que cobre a tela inteira.
    // O evento onClick no backdrop aciona a função onClose para fechar o modal.
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75 transition-opacity duration-300 ease-in-out" 
      onClick={onClose}
      role="dialog" // Acessibilidade: indica que é uma caixa de diálogo.
      aria-modal="true" // Acessibilidade: indica que o conteúdo por trás do modal está inerte.
      aria-labelledby={title ? "modal-title" : undefined}
    >
      {/* O contêiner principal do modal. */}
      {/* O e.stopPropagation() impede que o clique dentro do modal se propague para o backdrop, evitando que ele feche acidentalmente. */}
      <div
        className={`bg-secondary p-6 rounded-lg shadow-xl transform transition-all duration-300 ease-in-out w-11/12 ${sizeClasses[size]} max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Renderiza o cabeçalho do modal se um título for fornecido. */}
        {title && (
          <div className="flex justify-between items-center mb-4">
            <h2 id="modal-title" className="text-2xl font-semibold text-accent">{title}</h2>
            {/* Botão para fechar o modal. */}
            <button
              onClick={onClose}
              className="text-neutral-dark hover:text-accent transition-colors"
              aria-label="Close modal" // Acessibilidade: descreve a função do botão.
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {/* Renderiza o conteúdo (children) passado para o modal. */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
