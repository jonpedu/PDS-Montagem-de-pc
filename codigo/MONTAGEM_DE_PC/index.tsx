// Importa as bibliotecas React e ReactDOM para renderização da aplicação.
import React from 'react';
import ReactDOM from 'react-dom/client';
// Importa o componente principal da aplicação.
import App from './App';

// Procura pelo elemento 'root' no HTML, que servirá como ponto de montagem da aplicação React.
const rootElement = document.getElementById('root');
if (!rootElement) {
  // Lança um erro se o elemento 'root' não for encontrado, pois a aplicação não pode ser renderizada.
  throw new Error("Could not find root element to mount to");
}

// Cria uma raiz de renderização React associada ao elemento 'root'.
const root = ReactDOM.createRoot(rootElement);
// Renderiza o componente App dentro do modo estrito do React, que ajuda a identificar problemas potenciais na aplicação.
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
