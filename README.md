# CodeTugaBuilds - Montador de PCs Inteligente

Um assistente inteligente para montagem de PCs personalizada, utilizando IA do Google Gemini para recomendar configurações otimizadas baseadas nas necessidades e orçamento do usuário.

## Funcionalidades

- 🤖 **Assistente IA**: Chatbot inteligente que coleta requisitos e gera recomendações personalizadas
- 💾 **Download direto**: Baixe o resumo da sua build em PDF sem precisar criar conta
- 🔧 **Compatibilidade**: Verificação automática de compatibilidade entre componentes
- 🎯 **Personalizado**: Considerações de orçamento, uso pretendido, condições ambientais e preferências
- 📱 **Responsivo**: Interface adaptada para desktop e mobile

## Executar localmente

**Pré-requisitos:** Node.js (versão 18 ou superior)

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Defina a variável `GEMINI_API_KEY` no arquivo `.env.local` com sua chave da API Gemini:
   ```bash
   GEMINI_API_KEY=sua_chave_da_api_aqui
   ```

3. Execute o app:
   ```bash
   npm run dev
   ```

## Deploy no Vercel

1. Conecte seu repositório ao Vercel
2. Configure a variável de ambiente `GEMINI_API_KEY` no painel do Vercel
3. Deploy automático a cada push na branch main

## Principais tecnologias

- React 19 com TypeScript
- Google Gemini API para IA conversacional  
- Vite como build tool e servidor de desenvolvimento
- jsPDF para exportação de relatórios
- TailwindCSS para estilização

## Estrutura do Projeto

```
/
├── components/          # Componentes React reutilizáveis
│   ├── build/          # Componentes específicos de montagem
│   ├── core/           # Componentes base (Button, Modal, etc.)
│   └── layout/         # Layout e navegação
├── config/             # Configurações de ambiente
├── pages/              # Páginas principais da aplicação
├── services/           # Serviços (API Gemini, componentes)
├── types.ts            # Definições de tipos TypeScript
├── App.tsx             # Componente raiz da aplicação
└── index.html          # Arquivo HTML principal
```

## Como funciona

1. **Conversação inicial**: O chatbot IA coleta suas necessidades através de perguntas inteligentes
2. **Processamento**: A IA analisa seus requisitos e orçamento 
3. **Recomendação**: Sistema gera uma build personalizada com verificação de compatibilidade
4. **Download**: Baixe um PDF detalhado com a lista de componentes e preços

## Licença

Este projeto é desenvolvido para fins acadêmicos como parte do curso de Projeto de Desenvolvimento de Software.
