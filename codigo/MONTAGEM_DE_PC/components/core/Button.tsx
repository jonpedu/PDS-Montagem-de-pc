// Importa o React.
import React from 'react';

// Define as propriedades que o componente Button pode receber.
// Estende as propriedades padrão de um botão HTML para maior flexibilidade.
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'; // Estilos visuais do botão.
  size?: 'sm' | 'md' | 'lg'; // Tamanhos do botão.
  isLoading?: boolean; // Se true, exibe um spinner e desabilita o botão.
  leftIcon?: React.ReactNode; // Ícone a ser exibido à esquerda do texto.
  rightIcon?: React.ReactNode; // Ícone a ser exibido à direita do texto.
}

// Componente de botão reutilizável com variantes de estilo e estado de carregamento.
const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  leftIcon,
  rightIcon,
  className = '',
  ...props
}) => {
  // Estilos base aplicados a todos os botões.
  const baseStyles = 'font-semibold rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary transition-colors duration-150 flex items-center justify-center';

  // Mapeamento de variantes para classes de estilo do Tailwind.
  const variantStyles = {
    primary: 'bg-accent text-primary hover:bg-opacity-80 focus:ring-accent',
    secondary: 'bg-secondary text-neutral hover:bg-opacity-80 focus:ring-neutral-dark',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    ghost: 'bg-transparent text-accent hover:bg-accent hover:text-primary focus:ring-accent',
  };

  // Mapeamento de tamanhos para classes de estilo do Tailwind.
  const sizeStyles = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  // Componente SVG do spinner de carregamento.
  const loadingSpinner = (
    <svg className="animate-spin h-5 w-5 text-currentColor" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  );

  return (
    <button
      // Combina as classes de estilo: base, variante, tamanho e classes condicionais.
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${isLoading || disabled ? 'opacity-60 cursor-not-allowed' : ''} ${className}`}
      // O botão é desabilitado se estiver carregando ou se a propriedade `disabled` for true.
      disabled={isLoading || disabled}
      {...props}
    >
      {/* Renderização condicional: exibe o spinner ou o conteúdo do botão. */}
      {isLoading ? loadingSpinner : (
        <>
          {leftIcon && <span className="mr-2">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="ml-2">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
