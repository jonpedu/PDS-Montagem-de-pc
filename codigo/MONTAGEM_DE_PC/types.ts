// Arquivo Central de Tipos (types.ts)
// Este arquivo define todas as principais estruturas de dados (interfaces e tipos)
// usadas em toda a aplicação, garantindo consistência e segurança de tipos.

// Representa a estrutura de um usuário logado na aplicação.
export interface User {
  id: string; // ID único do usuário, geralmente do Supabase.
  nome: string; // Nome do usuário.
  email: string; // Email do usuário, usado para login.
}

// Interface interna para serviços de autenticação, nunca deve ser exposta ou armazenada.
// O campo 'password_mock' é apenas para propósitos de simulação interna.
export interface UserWithPassword extends User {
  password_mock: string;
}


// Enumeração das categorias de componentes de hardware.
// Usado para classificar e filtrar componentes.
export enum ComponentCategory {
  CPU = "Processador",
  MOTHERBOARD = "Placa-mãe",
  RAM = "Memória RAM",
  GPU = "Placa de Vídeo",
  STORAGE = "Armazenamento",
  PSU = "Fonte",
  CASE = "Gabinete",
  COOLER = "Cooler",
}

// Tipos de máquina que o usuário pode querer montar.
export type MachineType = 
  | 'Computador Pessoal' 
  | 'Servidor' 
  | 'Estação de Trabalho'
  | 'Máquina para Mineração' 
  | 'PC para Streaming' 
  | 'Outro'
  | 'Customizado';

// Propósitos principais para o uso do PC.
export type PurposeType = 
  | 'Jogos' 
  | 'Trabalho/Produtividade' 
  | 'Edição Criativa' 
  | 'Uso Geral' 
  | 'HTPC' 
  | 'Outro';

// Detalhes específicos para cada propósito, usados para refinar as perguntas do chatbot.
export type GamingType = 'Competitivos/eSports' | 'AAA/High-End' | 'VR' | 'Casual' | 'Outro';
export type WorkField = 'Desenvolvimento' | 'Design Gráfico' | 'Engenharia/3D' | 'Escritório' | 'Ciência de Dados' | 'Outro';
export type CreativeEditingType = 'Vídeo' | 'Foto' | 'Áudio' | '3D' | 'Outro';
export type CreativeWorkResolution = 'HD' | '4K' | '8K' | 'Outro';
export type ProjectSize = 'Pequeno' | 'Médio' | 'Grande';
export type BuildExperience = 'Montar Sozinho' | 'Pré-configurado';
export type AestheticsImportance = 'Baixa' | 'Média' | 'Alta';
export type ServerType = 'Arquivos' | 'Web' | 'Banco de Dados' | 'Virtualização' | 'Render Farm' | 'Outro';
export type ServerUptime = '99%' | '99.9%' | '99.99%' | 'Outro';
export type ServerScalability = 'Baixa' | 'Média' | 'Alta';
export type EnvTempControlType = 'Ar condicionado' | 'Ventilação natural' | 'Outro';
export type CaseSizeType = 'Mini-ITX' | 'Micro-ATX' | 'ATX' | 'Full Tower' | 'Outro';
export type NoiseLevelType = 'Silencioso' | 'Moderado' | 'Indiferente';

// Representa as condições ambientais onde o PC será utilizado.
// A IA usa esses dados para otimizar a refrigeração.
export interface Ambiente {
  // Dados da cidade (obtidos via serviços externos).
  cidade?: string;
  codigoPais?: string;
  temperaturaMediaAnual?: number;
  temperaturaMaximaAnual?: number;
  temperaturaMinimaAnual?: number;

  // Dados do local específico do PC (informados pelo usuário).
  ventilacaoLocalPC?: 'Ar Condicionado' | 'Ventilador' | 'Ambiente Externo' | 'Outro';
  nivelPoeiraLocalPC?: 'Baixa' | 'Média' | 'Alta';
  comodoPC?: string;

  // Condições ambientais gerais.
  controleTemperaturaGeral?: EnvTempControlType;
  nivelPoeiraGeral?: 'Baixa' | 'Média' | 'Alta';
  
  // Mapeamento de atributos do diagrama (podem ser inferidos).
  temperatura?: number; 
  umidade?: 'Baixa' | 'Média' | 'Alta'; 
  climatizacao?: boolean; 
  localizacao?: string;
}

// Agrupa todos os detalhes específicos do perfil do PC.
export interface PerfilPCDetalhado {
  machineType?: MachineType;
  purpose?: PurposeType;
  // Campos detalhados para cada propósito.
  gamingType?: GamingType;
  monitorSpecs?: string;
  peripheralsNeeded?: 'Sim' | 'Não' | 'Não especificado';
  workField?: WorkField;
  softwareUsed?: string;
  multipleMonitors?: 'Sim' | 'Não' | 'Não especificado';
  monitorCount?: number;
  creativeEditingType?: CreativeEditingType;
  creativeWorkResolution?: CreativeWorkResolution;
  projectSize?: ProjectSize;
  serverType?: ServerType;
  serverUsers?: string;
  serverRedundancy?: string;
  serverUptime?: ServerUptime;
  serverScalability?: ServerScalability;
  miningCrypto?: string;
  miningHashrate?: string;
  miningGpuCount?: string;
  miningEnergyCost?: string;
  isCustomType?: boolean;
  customDescription?: string;
  criticalComponents?: string;
  usagePatterns?: string;
  physicalConstraints?: string;
  specialRequirements?: string;
  referenceSystems?: string;
  workType?: string; 
}

// Estrutura principal que agrega todas as informações coletadas do usuário.
// Este objeto é construído progressivamente pelo chatbot e enviado à IA para a recomendação final.
export interface PreferenciaUsuarioInput { 
  orcamento?: number;
  orcamentoRange?: 'Econômico [R$2-4k]' | 'Médio [R$4-8k]' | 'High-End [R$8k+]' | 'Personalizar';
  
  perfilPC: PerfilPCDetalhado; // Detalhes do tipo e propósito do PC.
  ambiente: Ambiente; // Informações sobre o ambiente de uso.

  // Preferências gerais do usuário.
  ownedComponents?: string; // Componentes que o usuário já possui.
  buildExperience?: BuildExperience;
  brandPreference?: string;
  aestheticsImportance?: AestheticsImportance;
  caseSize?: CaseSizeType;
  noiseLevel?: NoiseLevelType;
  specificPorts?: string;
  preferences?: string; // Campo genérico para outras preferências.
  
  // Permite flexibilidade durante a coleta de dados, mas deve ser usado com cautela.
  [key: string]: any; 
}


// Representa um componente de hardware individual.
export interface Componente {
  id: string; // ID único do componente.
  Produto: string; // Nome completo do produto.
  Preco: number; // Preço do componente em BRL.
  LinkCompra?: string; // URL para a página de compra.
  Categoria: string; // Categoria do componente (ex: "Processadores").

  // Campos opcionais, podem ser inferidos ou adicionados posteriormente.
  brand?: string;
  imageUrl?: string;
  especificacao?: Record<string, string | number | string[]>;
  compatibilityKey?: string; // Chave para verificação de compatibilidade (ex: "LGA1700").
  dataLancamento?: string;
}

// Representa uma montagem de PC completa.
export interface Build {
  id: string; // ID único da build.
  nome: string; // Nome dado à build (ex: "Minha Build Gamer").
  userId?: string; // ID do usuário que criou a build.
  componentes: Componente[]; // Lista de componentes que formam a build.
  orcamento: number; // Custo total da build.
  dataCriacao: string; // Data de criação no formato ISO.
  
  requisitos?: PreferenciaUsuarioInput; // Os requisitos do usuário que geraram esta build.
  justificativa?: string; // Visão geral ou justificativa da IA para a build, incluindo avisos.
  avisos_compatibilidade?: string[]; // Array de avisos de compatibilidade para persistência no DB.
}


// Representa uma única mensagem na interface do chat.
export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system'; // Quem enviou a mensagem.
  text: string;
  timestamp: number;
}

// Estrutura da recomendação retornada pela IA.
export interface AIRecommendation {
  recommendedComponentIds: string[]; // IDs dos componentes recomendados.
  justification: string; // Explicação das escolhas da IA.
  estimatedTotalPrice?: number; // Preço total estimado.
  budgetNotes?: string; // Notas sobre como o orçamento foi utilizado.
  compatibilityWarnings?: string[]; // Avisos de compatibilidade.
}

// Tipo obsoleto, avaliar remoção.
export type BuildMode = 'auto' | null;

// Estrutura para futuras regras de compatibilidade.
export interface CompatibilityRules {
  [key: string]: (component: Componente, buildSoFar: Componente[]) => string | null;
}

// Estrutura para os dados de clima obtidos da API.
export interface CityWeatherData {
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
}