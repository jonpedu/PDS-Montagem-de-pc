
export interface User {
  id: string;
  nome: string; // Alinhado com o diagrama (anteriormente name)
  email: string;
  // senha não é armazenada aqui, é transitória
}

// This interface is for internal use by the authentication service.
// In a real application, NEVER store plain text passwords. This 'password_mock' field
// is for mock purposes only and should be a salted hash in a production environment.
export interface UserWithPassword extends User {
  password_mock: string;
}


// Enumerações existentes, manter como estão ou mapear para nomes do diagrama se necessário
export enum ComponentCategory {
  CPU = "Processador",
  MOTHERBOARD = "Placa-mãe",
  RAM = "Memória RAM",
  GPU = "Placa de Vídeo",
  STORAGE = "Armazenamento",
  PSU = "Fonte",
  CASE = "Gabinete",
  COOLER = "Cooler CPU",
}
// TipoComponente do diagrama mapeia para ComponentCategory

export type MachineType = 
  | 'Computador Pessoal' 
  | 'Servidor' 
  | 'Estação de Trabalho'
  | 'Máquina para Mineração' 
  | 'PC para Streaming'
  | 'Outro'
  | 'Customizado';

export type PurposeType = 
  | 'Jogos' 
  | 'Trabalho/Produtividade' 
  | 'Edição Criativa' 
  | 'Uso Geral' 
  | 'HTPC' 
  | 'Outro';

// PerfilPC do diagrama é uma combinação de MachineType e PurposeType
// Manter os enums detalhados existentes:
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

// Definição da classe/interface Ambiente (conforme diagrama e dados existentes)
export interface Ambiente {
  // Dados da cidade (via geoService/weatherService)
  cidade?: string;
  codigoPais?: string;
  temperaturaMediaCidade?: number;
  temperaturaMaximaCidade?: number;
  temperaturaMinimaCidade?: number;
  descricaoClimaCidade?: string;

  // Dados do local específico do PC
  ventilacaoLocalPC?: 'Ar Condicionado' | 'Ventilador' | 'Ambiente Externo' | 'Outro';
  nivelPoeiraLocalPC?: 'Baixa' | 'Média' | 'Alta';
  comodoPC?: string;

  // Condições ambientais gerais
  controleTemperaturaGeral?: EnvTempControlType;
  nivelPoeiraGeral?: 'Baixa' | 'Média' | 'Alta';

  // Mapeamento direto de atributos do diagrama (podem ser inferidos ou entradas diretas)
  temperatura?: number; // Para atributo `temperatura: double` do diagrama (pode ser temp. média)
  umidade?: 'Baixa' | 'Média' | 'Alta'; // Para `umidade: double` (adaptado para os tipos existentes)
  climatizacao?: boolean; // Para `climatizacao: boolean` (pode ser inferido de ventilacaoLocalPC)
  localizacao?: string; // Para `localizacao: String` (descrição geral, pode ser cidade ou comodoPC)
}

// Detalhes do Perfil do PC, agrupando especificidades de AnamnesisData
export interface PerfilPCDetalhado {
  machineType?: MachineType;
  purpose?: PurposeType;
  // Jogos
  gamingType?: GamingType;
  monitorSpecs?: string;
  peripheralsNeeded?: 'Sim' | 'Não' | 'Não especificado';
  // Trabalho/Produtividade
  workField?: WorkField;
  softwareUsed?: string;
  multipleMonitors?: 'Sim' | 'Não' | 'Não especificado';
  monitorCount?: number;
  // Edição Criativa
  creativeEditingType?: CreativeEditingType;
  creativeWorkResolution?: CreativeWorkResolution;
  projectSize?: ProjectSize;
  // Servidor
  serverType?: ServerType;
  serverUsers?: string;
  serverRedundancy?: string;
  serverUptime?: ServerUptime;
  serverScalability?: ServerScalability;
  // Mineração
  miningCrypto?: string;
  miningHashrate?: string;
  miningGpuCount?: string;
  miningEnergyCost?: string;
  // Customizado
  isCustomType?: boolean;
  customDescription?: string;
  criticalComponents?: string;
  usagePatterns?: string;
  physicalConstraints?: string;
  specialRequirements?: string;
  referenceSystems?: string;
  // Outros campos de AnamnesisData que definem o perfil
  workType?: string; // Legado, pode ser coberto por workField
}

// Refatoração de AnamnesisData para PreferenciaUsuarioInput
export interface PreferenciaUsuarioInput { // Anteriormente AnamnesisData
  orcamento?: number; // Diagrama: orcamento: int
  orcamentoRange?: 'Econômico [R$2-4k]' | 'Médio [R$4-8k]' | 'High-End [R$8k+]' | 'Personalizar';
  
  perfilPC: PerfilPCDetalhado;
  ambiente: Ambiente;

  // Preferências gerais
  buildExperience?: BuildExperience;
  brandPreference?: string;
  aestheticsImportance?: AestheticsImportance;
  caseSize?: CaseSizeType;
  noiseLevel?: NoiseLevelType;
  specificPorts?: string;
  preferences?: string; // Campo genérico para outras preferências
  
  // Dados climáticos da cidade que estavam no nível raiz de AnamnesisData, agora movidos para Ambiente
  // city?: string; // Movido para Ambiente.cidade
  // countryCode?: string; // Movido para Ambiente.codigoPais
  // cityAvgTemp?: number; // Movido para Ambiente.temperaturaMediaCidade
  // cityMaxTemp?: number; // Movido para Ambiente.temperaturaMaximaCidade
  // cityMinTemp?: number; // Movido para Ambiente.temperaturaMinimaCidade
  // cityWeatherDescription?: string; // Movido para Ambiente.descricaoClimaCidade
  
  // // Detalhes do local do PC movidos para Ambiente
  // pcVentilation?: 'Ar Condicionado' | 'Ventilador' | 'Ambiente Externo' | 'Outro'; // Movido
  // pcDustLevel?: 'Baixa' | 'Média' | 'Alta'; // Movido
  // pcRoomType?: string; // Movido

  // // Condições gerais do ambiente movidas para Ambiente
  // envTempControl?: EnvTempControlType; // Movido
  // envDust?: 'Baixa' | 'Média' | 'Alta'; // Movido

  // Campos legados de AnamnesisData (avaliar se ainda necessários ou cobertos por Ambiente/PerfilPCDetalhado)
  // envTemperature?: 'Baixa' | 'Média' | 'Alta'; 
  // envHumidity?: 'Baixa' | 'Média' | 'Alta';
  [key: string]: any; // Manter para flexibilidade durante o chat, mas usar com cautela
}


export interface Componente { // Anteriormente PCComponent
  id: string;
  tipo: ComponentCategory; // Diagrama: tipo: TipoComponente
  nome: string; // Diagrama: nome: String
  brand: string; // Extra, manter
  preco: number; // Diagrama: preco: double
  imageUrl?: string; // Extra, manter
  // Diagrama: especificacao: Map<String, String>. Código usa Record mais flexível.
  especificacao: Record<string, string | number | string[]>; 
  compatibilityKey?: string; // Extra, manter
  dataLancamento?: string; // Diagrama: dataLancamento: Date. Adicionar se disponível (string ISO)
  linkCompra?: string; // Diagrama: linkCompra: String. Adicionar se disponível
}

// SelectedComponent pode ser removido se for idêntico a Componente.
// Se SelectedComponent tiver atributos próprios (ex: quantidade), então manter.
// Por ora, assumindo que pode ser simplificado. Build.componentes usará Componente[].
export interface SelectedComponent extends Componente {} // Avaliar remoção

export interface Build {
  id: string;
  nome: string; // Diagrama: nome: String
  userId?: string; // Extra, útil para persistência
  componentes: SelectedComponent[]; // Diagrama: componentes: List<Componente>
  orcamento: number; // Diagrama: orcamento: double (era totalPrice)
  dataCriacao: string; // Diagrama: dataCriacao: Date (era createdAt, string ISO)
  
  requisitos?: PreferenciaUsuarioInput; // Extra valioso (era requirements, tipo atualizado)
  avisosCompatibilidade?: string[]; // Extra valioso (era compatibilityIssues)
}

<<<<<<< HEAD
export type MachineType = 
  | 'Computador Pessoal' 
  | 'Servidor' 
  | 'Estação de Trabalho'
  | 'Máquina para Mineração' 
  | 'PC para Streaming'
  | 'Outro'
  | 'Customizado';

export type PurposeType = 
  | 'Jogos' 
  | 'Trabalho/Produtividade' 
  | 'Edição Criativa' 
  | 'Uso Geral' 
  | 'HTPC' 
  | 'Outro';

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

export interface CityWeatherData {
  avgTemp: number; // Temperatura média/atual (current_weather.temperature)
  maxTemp: number; // Temperatura máxima do dia (daily.temperature_2m_max[0])
  minTemp: number; // Temperatura mínima do dia (daily.temperature_2m_min[0])
  description: string; // Descrição do clima (mapeada do weathercode)
}

export interface AnamnesisData {
  // Core
  machineType?: MachineType;
  budget?: number; // Stores the final numeric budget
  budgetRange?: 'Econômico [R$2-4k]' | 'Médio [R$4-8k]' | 'High-End [R$8k+]' | 'Personalizar'; // Stores the user's textual choice for budget range

  // Computador Pessoal Details
  purpose?: PurposeType;
  // -- Jogos Sub-flow
  gamingType?: GamingType;
  monitorSpecs?: string; // e.g., "1080p/60Hz, 1440p/144Hz, 4K/60Hz+"
  peripheralsNeeded?: 'Sim' | 'Não' | 'Não especificado';
  // -- Trabalho/Produtividade Sub-flow
  workField?: WorkField;
  softwareUsed?: string; // "Quais softwares principais você usa?" - This was already here, good.
  multipleMonitors?: 'Sim' | 'Não' | 'Não especificado';
  monitorCount?: number;
  // -- Edição Criativa Sub-flow
  creativeEditingType?: CreativeEditingType;
  creativeWorkResolution?: CreativeWorkResolution;
  projectSize?: ProjectSize;
  // -- Experiência do Usuário (Computador Pessoal)
  buildExperience?: BuildExperience;
  brandPreference?: string; // e.g., "AMD/Intel/NVIDIA" or specific brands
  aestheticsImportance?: AestheticsImportance;

  // Servidor Details
  serverType?: ServerType;
  serverUsers?: string; // "Número estimado de usuários/conexões simultâneas?"
  serverRedundancy?: string; // "Necessidade de redundância? (RAID, PSU redundante)"
  serverUptime?: ServerUptime;
  serverScalability?: ServerScalability;

  // Máquina para Mineração Details
  miningCrypto?: string; // "Quais criptomoedas pretende minerar?"
  miningHashrate?: string; // "Hashrate desejado?"
  miningGpuCount?: string; // "Número de GPUs planejado?"
  miningEnergyCost?: string; // "Custo energético na sua região?"
  
  // Estação de Trabalho / PC para Streaming (could leverage existing `preferences` or add specific fields if needed by AI flow)
  // For now, these will likely fall into 'preferences' or share fields with 'Computador Pessoal'

  // Environmental Conditions (refined)
  city?: string; // City name from GeoJS
  countryCode?: string; // Country code from GeoJS
  cityAvgTemp?: number; // Temperatura média da cidade (Open-Meteo)
  cityMaxTemp?: number; // Temperatura máxima da cidade (Open-Meteo)
  cityMinTemp?: number; // Temperatura mínima da cidade (Open-Meteo)
  cityWeatherDescription?: string; // Descrição do clima da cidade (Open-Meteo)
  // -- Specific PC Location (already exists, good)
  pcVentilation?: 'Ar Condicionado' | 'Ventilador' | 'Ambiente Externo' | 'Outro'; // From existing
  pcDustLevel?: 'Baixa' | 'Média' | 'Alta'; // Changed from 'Baixo' | 'Médio' | 'Alto'
  pcRoomType?: string; // From existing
  // -- General Environment (if specific not available or for other types)
  envTempControl?: EnvTempControlType; // New: "O ambiente tem controle de temperatura?"
  envDust?: 'Baixa' | 'Média' | 'Alta'; // Existing, good for: "Nível de poeira no ambiente?"

  // General Preferences (can overlap or be used for specific details not covered)
  preferences?: string;
  caseSize?: CaseSizeType;
  noiseLevel?: NoiseLevelType;
  specificPorts?: string;

  // Custom/Unknown Machine Type Fields
  isCustomType?: boolean;
  customDescription?: string;
  criticalComponents?: string;
  usagePatterns?: string;
  physicalConstraints?: string;
  specialRequirements?: string; // May overlap with criticalComponents or customDescription
  referenceSystems?: string;

  // Utility (already exists)
  envTemperature?: 'Baixa' | 'Média' | 'Alta'; // Fallback, less specific
  envHumidity?: 'Baixa' | 'Média' | 'Alta'; // Fallback, less specific
  workType?: string; // Se purpose for 'Trabalho' - can be consolidated into workField potentially or used as more generic input

  [key: string]: any; // For dynamic properties during chat, use 'any' carefully
}
=======
>>>>>>> gustavo

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: number;
}

export interface AIRecommendation {
  recommendedComponentIds: string[];
  justification: string;
  estimatedTotalPrice?: number;
  budgetNotes?: string;
  compatibilityWarnings?: string[];
}

<<<<<<< HEAD
export type BuildMode = 'auto' | null;
=======
export type BuildMode = 'auto' | null; // Avaliar se ainda é usado
>>>>>>> gustavo

// Para compatibilidade - pode ser usado por um futuro compatibilityService.ts
export interface CompatibilityRules {
<<<<<<< HEAD
  [key: string]: (component: PCComponent, buildSoFar: SelectedComponent[]) => string | null;
=======
  [key: string]: (component: Componente, buildSoFar: SelectedComponent[]) => string | null;
}

// Estrutura para dados de clima da cidade (já existente, parece OK)
export interface CityWeatherData {
  avgTemp: number;
  maxTemp: number;
  minTemp: number;
  description: string;
>>>>>>> gustavo
}
