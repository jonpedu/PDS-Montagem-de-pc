
import { GoogleGenAI, GenerateContentResponse, Part, Content } from "@google/genai";
import { PreferenciaUsuarioInput, ChatMessage, Componente, AIRecommendation, MachineType, PurposeType, GamingType, WorkField, CreativeEditingType, CreativeWorkResolution, ProjectSize, BuildExperience, AestheticsImportance, ServerType, ServerUptime, ServerScalability, EnvTempControlType, CaseSizeType, NoiseLevelType, Ambiente, PerfilPCDetalhado } from '../types';
import { MOCK_COMPONENTS } from '../constants/components'; // For providing component list to AI

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY for Gemini is não está configurada. Por favor, defina a variável de ambiente process.env.API_KEY.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY || "NO_KEY_PROVIDED" }); 
const TEXT_MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

const parseJsonFromGeminiResponse = <T,>(responseText: string): T | null => {
  let jsonStr = responseText.trim();
  const fenceRegex = /^```(?:json)?\s*\n?(.*?)\n?\s*```$/s;
  const match = jsonStr.match(fenceRegex);
  if (match && match[1]) {
    jsonStr = match[1].trim();
  }
  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Falha ao analisar resposta JSON do Gemini:", e, "\nResposta Bruta:", responseText);
    return null;
  }
};


export const getChatbotResponse = async (
  history: ChatMessage[],
  userInput: string,
  currentPreferencias: PreferenciaUsuarioInput
): Promise<{ aiResponse: string; updatedPreferencias: PreferenciaUsuarioInput }> => {
  if (!API_KEY) return { aiResponse: "Desculpe, o serviço de IA não está configurado corretamente (sem API Key).", updatedPreferencias: currentPreferencias };

  const chatHistoryForGemini: Content[] = history.map(msg => ({
    role: msg.sender === 'user' ? 'user' : (msg.sender === 'ai' ? 'model' : 'user'),
    parts: [{ text: msg.text }],
  }));

  let weatherInfoForSystem = "";
  if (currentPreferencias.ambiente?.cidade && currentPreferencias.ambiente?.temperaturaMaximaCidade !== undefined && currentPreferencias.ambiente?.temperaturaMediaCidade !== undefined && currentPreferencias.ambiente?.temperaturaMinimaCidade !== undefined) {
    weatherInfoForSystem = `Dados climáticos para ${currentPreferencias.ambiente.cidade}: Temp. Média ${currentPreferencias.ambiente.temperaturaMediaCidade}°C, Máx ${currentPreferencias.ambiente.temperaturaMaximaCidade}°C, Mín ${currentPreferencias.ambiente.temperaturaMinimaCidade}°C. Clima: ${currentPreferencias.ambiente.descricaoClimaCidade || 'N/A'}. Considere isso para refrigeração.`;
  } else if (currentPreferencias.ambiente?.cidade && currentPreferencias.ambiente?.temperaturaMediaCidade !== undefined) {
     weatherInfoForSystem = `Dados climáticos para ${currentPreferencias.ambiente.cidade}: Temp. Média ${currentPreferencias.ambiente.temperaturaMediaCidade}°C. Clima: ${currentPreferencias.ambiente.descricaoClimaCidade || 'N/A'}. Considere isso para refrigeração.`;
  }


  const systemInstruction = `Você é CodeTuga, um assistente especializado em montagem de PCs. Siga este fluxo inteligente para coleta de requisitos:

ESTADO ATUAL DA COLETA (PreferenciaUsuarioInput): ${JSON.stringify(currentPreferencias)}
${weatherInfoForSystem ? `\nINFORMAÇÃO CLIMÁTICA DISPONÍVEL: ${weatherInfoForSystem}` : ''}

FLUXO DE PERGUNTAS INTELIGENTE:

1.  **Identificação do Tipo de Máquina** (se \`!currentPreferencias.perfilPC.machineType\`):
    Pergunte: "Que tipo de máquina você deseja montar? (Computador Pessoal, Servidor, Estação de Trabalho, Máquina para Mineração, PC para Streaming, Outro)"

2.  **Fluxos Específicos por Tipo** (após \`perfilPC.machineType\` ser definido):

    ### Para Computador Pessoal (\`currentPreferencias.perfilPC.machineType === 'Computador Pessoal'\`):
    a.  **Propósito Principal** (se \`!currentPreferencias.perfilPC.purpose\`):
        Pergunte: "Qual será o uso principal? (Jogos, Trabalho/Produtividade, Edição Criativa, Uso Geral, HTPC)"
    
    b.  **Sub-fluxos por Propósito**:
        
        #### Jogos (\`currentPreferencias.perfilPC.purpose === 'Jogos'\`):
        -   Se \`!currentPreferencias.perfilPC.gamingType\`: "Que tipo de jogos você pretende jogar? (Competitivos/eSports, AAA/High-End, VR, Casual)"
        -   Se \`currentPreferencias.perfilPC.gamingType\` e \`!currentPreferencias.perfilPC.monitorSpecs\`: "Qual resolução e taxa de atualização do seu monitor? (Ex: 1080p/60Hz, 1440p/144Hz, 4K/60Hz+)"
        -   Se \`currentPreferencias.perfilPC.monitorSpecs\` e \`!currentPreferencias.perfilPC.peripheralsNeeded\`: "Precisa de periféricos específicos para jogos incluídos no orçamento? (Sim/Não)"
        
        #### Trabalho/Produtividade (\`currentPreferencias.perfilPC.purpose === 'Trabalho/Produtividade'\`):
        -   Se \`!currentPreferencias.perfilPC.workField\`: "Qual sua área de trabalho? (Desenvolvimento, Design Gráfico, Engenharia/3D, Escritório, Ciência de Dados)"
        -   Se \`currentPreferencias.perfilPC.workField\` e \`!currentPreferencias.perfilPC.softwareUsed\`: "Quais softwares principais você usa ou pretende usar? (Liste os mais exigentes que impactam a escolha de hardware)"
        -   Se \`currentPreferencias.perfilPC.softwareUsed\` e \`!currentPreferencias.perfilPC.multipleMonitors\`: "Precisa de suporte para múltiplos monitores? (Sim/Não)"
        -   Se \`currentPreferencias.perfilPC.multipleMonitors === 'Sim'\` e \`!currentPreferencias.perfilPC.monitorCount\`: "Quantos monitores você pretende usar?"

        #### Edição Criativa (\`currentPreferencias.perfilPC.purpose === 'Edição Criativa'\`):
        -   Se \`!currentPreferencias.perfilPC.creativeEditingType\`: "Qual tipo de edição criativa você fará principalmente? (Vídeo, Foto, Áudio, Modelagem 3D)"
        -   Se \`currentPreferencias.perfilPC.creativeEditingType\` e \`!currentPreferencias.perfilPC.creativeWorkResolution\`: "Qual a resolução de trabalho principal para seus projetos de edição? (Ex: HD, 4K, 8K)"
        -   Se \`currentPreferencias.perfilPC.creativeWorkResolution\` e \`!currentPreferencias.perfilPC.projectSize\`: "Qual o tamanho médio dos seus projetos? (Pequeno, Médio, Grande - isso ajuda a estimar RAM e armazenamento)"

    c.  **Experiência do Usuário e Estética** (após sub-fluxos de propósito, se ainda não perguntado para Computador Pessoal):
        -   Se \`!currentPreferencias.buildExperience\`: "Você prefere montar o PC sozinho ou gostaria de um sistema já montado/pré-configurado (se disponível)?"
        -   Se \`currentPreferencias.buildExperience\` e \`!currentPreferencias.brandPreference\`: "Tem preferência por marcas específicas de componentes, como AMD, Intel, NVIDIA, ou outras?"
        -   Se \`currentPreferencias.brandPreference\` e \`!currentPreferencias.aestheticsImportance\`: "Qual a importância da estética para você? (Ex: RGB, design do gabinete, cabos organizados - Baixa, Média, Alta)"

    ### Para Servidores (\`currentPreferencias.perfilPC.machineType === 'Servidor'\`):
    a.  **Tipo de Servidor** (se \`!currentPreferencias.perfilPC.serverType\`):
        Pergunte: "Qual o propósito principal do servidor? (Arquivos, Web, Banco de Dados, Virtualização, Render Farm, Outro)"
    b.  (Demais perguntas sobre servidor, e.g. serverUsers, serverRedundancy, serverUptime, serverScalability)

    ### Para Estação de Trabalho (\`currentPreferencias.perfilPC.machineType === 'Estação de Trabalho'\`):
    -   Se \`!currentPreferencias.perfilPC.workField\` e \`!currentPreferencias.perfilPC.creativeEditingType\`: "Qual será a principal carga de trabalho desta Estação de Trabalho? (Ex: CAD/Engenharia, Análise de Dados Pesada, Renderização 3D Profissional, Desenvolvimento com VMs)"
    -   (Demais perguntas)

    ### Para Máquinas de Mineração (\`currentPreferencias.perfilPC.machineType === 'Máquina para Mineração'\`):
    -   (Perguntas sobre miningCrypto, miningHashrate, miningGpuCount, miningEnergyCost)

    ### Para PC para Streaming (\`currentPreferencias.perfilPC.machineType === 'PC para Streaming'\`):
    -    Se \`!currentPreferencias.perfilPC.purpose\`: "Este PC será exclusivamente para streaming ou também para jogar/trabalhar enquanto faz stream? (Dedicado para Stream, Jogos+Stream, Trabalho+Stream)"
    -   (Demais perguntas)
    
    ### Para Tipos Não Previstos/Customizados (\`currentPreferencias.perfilPC.isCustomType === true\`):
    (Este fluxo é ativado se o machineType inicial não for reconhecido e for marcado como customizado)
    1.  Se \`!currentPreferencias.perfilPC.customDescription\`: "Você pode descrever com mais detalhes o que essa máquina precisa fazer de especial?"
    2.  (Demais perguntas sobre customDescription, referenceSystems, criticalComponents, etc.)


3.  **Orçamento** (coletar após entender as necessidades principais, se \`!currentPreferencias.orcamento\` e \`!currentPreferencias.orcamentoRange\`):
    Pergunte: "Com base no que conversamos, qual faixa de orçamento você tem em mente para esta máquina em BRL (Reais)? (Ex: Econômico [até R$4000], Médio [R$4000-R$8000], High-End [R$8000+], ou se preferir, diga um valor específico para 'Personalizar')"

4.  **Permissão de Localização** (após orçamento, se \`!currentPreferencias.ambiente.cidade\` E a pergunta ainda não foi feita E \`!currentPreferencias.ambiente.temperaturaMediaCidade\`):
    Pergunte EXATAMENTE: "Para ajudar com as condições climáticas e otimizar as sugestões de refrigeração e gabinete, você permite que detectemos sua localização automaticamente?" 

5.  **Condições Ambientais Específicas do Local do PC** (se \`currentPreferencias.ambiente.cidade\` existe E os detalhes do local do PC ainda não foram coletados COMPLETAMENTE):
    *   Se \`!currentPreferencias.ambiente.ventilacaoLocalPC\`: "Sobre o local específico onde a máquina será usada: ele possui ar condicionado, ventilador, ou a ventilação depende principalmente da temperatura externa? (Responda com 'Ar Condicionado', 'Ventilador', 'Temperatura Externa' ou 'Outro')"
    *   Se \`currentPreferencias.ambiente.ventilacaoLocalPC\` E \`!currentPreferencias.ambiente.nivelPoeiraLocalPC\`: "E quanto ao nível de poeira nesse local específico onde a máquina ficará? (Responda com Baixa, Média ou Alta)"
    *   Se \`currentPreferencias.ambiente.ventilacaoLocalPC\` E \`currentPreferencias.ambiente.nivelPoeiraLocalPC\` E \`!currentPreferencias.ambiente.comodoPC\`: "Em qual cômodo a máquina será utilizada principalmente? (Ex: Quarto, Sala, Escritório)"

6.  **Condições Ambientais Gerais** (se permissão de localização foi negada/falhou, \`!currentPreferencias.ambiente.cidade\`, OU para tipos como Servidor/Mineração se não perguntado antes, E as condições gerais ainda não foram coletadas COMPLETAMENTE):
    *   Se \`!currentPreferencias.ambiente.controleTemperaturaGeral\`: "O ambiente geral onde a máquina ficará tem algum controle de temperatura, como ar condicionado ou é mais dependente da ventilação natural?"
    *   Se \`currentPreferencias.ambiente.controleTemperaturaGeral\` E \`!currentPreferencias.ambiente.nivelPoeiraGeral\`: "Qual o nível de poeira geral nesse ambiente? (Baixa, Média, Alta)"
    *   Para Mineração (se não perguntado e relevante, e \`!currentPreferencias.preferences\` ou similar não cobre): "O local de mineração é bem ventilado, especialmente para as GPUs?" (Pode ir para \`preferences\` ou \`ambiente.ventilacaoLocalPC\`)

7.  **Preferências Adicionais Gerais** (após as etapas anteriores):
    - Se \`!currentPreferencias.caseSize\`: "Você tem preferência pelo tamanho do gabinete? (Ex: Mini-ITX para compacto, Micro-ATX, ATX padrão, Full Tower para máximo espaço)"
    - Se \`currentPreferencias.caseSize\` e \`!currentPreferencias.noiseLevel\`: "Qual o nível de ruído aceitável para você? (Silencioso, Moderado, Indiferente)"
    - Se \`currentPreferencias.noiseLevel\` e \`!currentPreferencias.specificPorts\`: "Há necessidade de portas específicas em grande quantidade ou tipo? (Ex: Thunderbolt, muitas USB-A, USB-C frontal)"
    - Se todos acima preenchidos ou se um campo genérico \`preferences\` ainda não foi tocado ou precisa de mais: "Alguma outra preferência ou detalhe importante que não cobrimos? (Pode ser sobre Wi-Fi, Bluetooth, sistema operacional desejado, etc.)" (Armazenar em \`preferences\`)

8.  **Validação Final e Conclusão**:
    Se todos os campos CRÍTICOS para o \`currentPreferencias.perfilPC.machineType\` e seu fluxo parecerem preenchidos (Orçamento é quase sempre crítico), resuma brevemente:
    "Ok, coletei as seguintes informações principais: [Liste 2-3 pontos chave de \`currentPreferencias\` como machineType, purpose/serverType, budgetRange]. Está tudo correto e podemos prosseguir para gerar uma recomendação de build com base nisso e nos outros detalhes que você me passou?"

REGRAS DE INTERAÇÃO: (Manter regras existentes)
- Faça UMA pergunta por vez.
- Adapte o vocabulário.
- Confirme informações ambíguas.
- Ofereça exemplos.
- Mantenha o foco no fluxo lógico.
- Responda APENAS com a sua próxima pergunta ou a validação final.
- Se o usuário fornecer múltiplas informações, processe-as e faça a PRÓXIMA pergunta.
`;

  try {
    const userMessageContent: Content = { role: 'user', parts: [{ text: userInput }] };
    const contents: Content[] = [...chatHistoryForGemini, userMessageContent];
    
    const result: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: contents,
      config: {
        systemInstruction: systemInstruction,
      },
    });
    
    const aiText = result.text;
    // Criar cópias profundas para evitar mutações diretas
    const updatedPreferencias: PreferenciaUsuarioInput = JSON.parse(JSON.stringify(currentPreferencias));
    if (!updatedPreferencias.perfilPC) updatedPreferencias.perfilPC = {} as PerfilPCDetalhado;
    if (!updatedPreferencias.ambiente) updatedPreferencias.ambiente = {} as Ambiente;

    const lowerInput = userInput.toLowerCase();
    
    let lastAiQuestionText = "";
    for (let i = history.length - 1; i >= 0; i--) {
        if (history[i].sender === 'ai') {
            lastAiQuestionText = history[i].text.toLowerCase();
            break;
        }
    }
    
    const parseGenericOptions = (input: string, options: Record<string, string>): string | undefined => {
      for (const [key, value] of Object.entries(options)) {
        if (input.includes(key)) return value;
      }
      return undefined;
    };

    const FEMININE_DUST_LEVEL_MAP: Record<string, 'Baixa' | 'Média' | 'Alta'> = {
      'baixo': 'Baixa', 'baixa': 'Baixa',
      'médio': 'Média', 'media': 'Média',
      'alto': 'Alta', 'alta': 'Alta'
    };

    // 1. Machine Type
    if (lastAiQuestionText.includes("que tipo de máquina você deseja montar?") && !updatedPreferencias.perfilPC.machineType) {
        const typeMap: Record<string, MachineType> = { /* ... manter mapeamentos ... */ };
        updatedPreferencias.perfilPC.machineType = parseGenericOptions(lowerInput, typeMap) as MachineType;
        if (lowerInput.length > 2 && !updatedPreferencias.perfilPC.machineType) {
            const customTypes: Record<string, MachineType> = { /* ... */ };
            updatedPreferencias.perfilPC.machineType = parseGenericOptions(lowerInput, customTypes) as MachineType || 'Customizado';
            updatedPreferencias.perfilPC.isCustomType = true;
            if(!updatedPreferencias.perfilPC.customDescription) updatedPreferencias.perfilPC.customDescription = userInput;
        }
    }

    // 2. Fluxos Específicos - Exemplo para Computador Pessoal > Propósito
    if (updatedPreferencias.perfilPC.machineType === 'Computador Pessoal') {
        if (lastAiQuestionText.includes("qual será o uso principal?") && !updatedPreferencias.perfilPC.purpose) {
            const purposeMap: Record<string, PurposeType> = { /* ... manter mapeamentos ... */ };
            updatedPreferencias.perfilPC.purpose = parseGenericOptions(lowerInput, purposeMap) as PurposeType;
        }
        // ... adaptar todos os outros parsers para acessar updatedPreferencias.perfilPC.campo ou updatedPreferencias.ambiente.campo ...
        // Exemplo para Jogos > gamingType
        if (updatedPreferencias.perfilPC.purpose === 'Jogos') {
            if (lastAiQuestionText.includes("que tipo de jogos você pretende jogar?") && !updatedPreferencias.perfilPC.gamingType) {
                const gameTypeMap: Record<string, GamingType> = { /* ... */ };
                updatedPreferencias.perfilPC.gamingType = parseGenericOptions(lowerInput, gameTypeMap) as GamingType;
            }
            // ... e assim por diante para monitorSpecs, peripheralsNeeded
        }
    }
    
    // 3. Orçamento
    if (lastAiQuestionText.includes("faixa de orçamento") && (!updatedPreferencias.orcamento && !updatedPreferencias.orcamentoRange)) {
        // ... lógica de parsing para updatedPreferencias.orcamento e updatedPreferencias.orcamentoRange ...
        const budgetRangesMap: Record<string, { range: PreferenciaUsuarioInput['orcamentoRange'], value?: number }> = {
            'econômico': { range: 'Econômico [R$2-4k]', value: 3000 }, 
            // ... outros mapeamentos ...
        };
        // ... (lógica de parsing adaptada)
         const numMatch = userInput.match(/(\d[\d.,]*\d|\d+)/g);
        if (numMatch) {
            const cleanedNumber = parseFloat(numMatch[0].replace(/\./g, '').replace(',', '.'));
            if (!isNaN(cleanedNumber)) {
                 updatedPreferencias.orcamento = cleanedNumber;
                 if(!updatedPreferencias.orcamentoRange) updatedPreferencias.orcamentoRange = 'Personalizar'; 
            }
        }
    }

    // 5. Condições Ambientais Específicas
     if (lastAiQuestionText.includes("ar condicionado") || lastAiQuestionText.includes("ventilador") || lastAiQuestionText.includes("ventilação onde a máquina será usada")) {
        if (lowerInput.includes("ar condicionado")) updatedPreferencias.ambiente.ventilacaoLocalPC = "Ar Condicionado";
        else if (lowerInput.includes("ventilador")) updatedPreferencias.ambiente.ventilacaoLocalPC = "Ventilador";
        // ... etc
    }
    if (lastAiQuestionText.includes("nível de poeira nesse local específico")) {
        updatedPreferencias.ambiente.nivelPoeiraLocalPC = parseGenericOptions(lowerInput, FEMININE_DUST_LEVEL_MAP) as 'Baixa' | 'Média' | 'Alta';
    }
    if (lastAiQuestionText.includes("qual cômodo a máquina será utilizada") && !updatedPreferencias.ambiente.comodoPC && userInput.trim().length > 2) {
        updatedPreferencias.ambiente.comodoPC = userInput.trim().charAt(0).toUpperCase() + userInput.trim().slice(1);
    }
    
    // 6. Condições Ambientais Gerais
     if (lastAiQuestionText.includes("ambiente geral") && lastAiQuestionText.includes("controle de temperatura") && !updatedPreferencias.ambiente.controleTemperaturaGeral) {
        const tempControlMap: Record<string, EnvTempControlType> = { /* ... */ };
        updatedPreferencias.ambiente.controleTemperaturaGeral = parseGenericOptions(lowerInput, tempControlMap) as EnvTempControlType;
    }
    if (lastAiQuestionText.includes("nível de poeira geral nesse ambiente") && !updatedPreferencias.ambiente.nivelPoeiraGeral) {
        updatedPreferencias.ambiente.nivelPoeiraGeral = parseGenericOptions(lowerInput, FEMININE_DUST_LEVEL_MAP) as 'Baixa' | 'Média' | 'Alta';
    }

    // 7. Preferências Adicionais Gerais
    if (lastAiQuestionText.includes("tamanho do gabinete") && !updatedPreferencias.caseSize) {
        const caseSizeMap: Record<string, CaseSizeType> = { /* ... */ };
        updatedPreferencias.caseSize = parseGenericOptions(lowerInput, caseSizeMap) as CaseSizeType;
    }
    // ...etc para noiseLevel, specificPorts, preferences

    return { aiResponse: aiText, updatedPreferencias };

  } catch (error) {
    console.error("Erro ao chamar API Gemini (getChatbotResponse):", error);
    return { aiResponse: "Desculpe, ocorreu um erro ao processar sua solicitação.", updatedPreferencias: currentPreferencias };
  }
};


export const getBuildRecommendation = async (
  requisitos: PreferenciaUsuarioInput, // Tipo atualizado
  availableComponents: Componente[] // Tipo atualizado
): Promise<AIRecommendation | null> => {
  if (!API_KEY) {
    console.error("API Key do Gemini não configurada para getBuildRecommendation");
    return null;
  }

  const componentSummary = availableComponents.map(c => ({
    id: c.id,
    category: c.tipo, // Corrigido para tipo
    name: c.nome,   // Corrigido para nome
    price: c.preco, // Corrigido para preco
    key_specs: `${c.especificacao.socket || c.especificacao.type || ''} ${c.especificacao.chipset || c.especificacao.capacity_gb || ''} ${c.especificacao.tdp || c.especificacao.wattage_w || ''}`.trim()
  }));

  // O prompt precisará ser cuidadosamente ajustado para refletir a nova estrutura aninhada de requisitos.perfilPC e requisitos.ambiente
  const prompt = `
Você é um especialista em montagem de PCs. Sua tarefa é recomendar uma build otimizada com base nos seguintes requisitos e componentes disponíveis.

Requisitos do Usuário (PreferenciaUsuarioInput):
- Orçamento:
  - Faixa Escolhida: ${requisitos.orcamentoRange || 'Não especificado'}
  - Valor Numérico (BRL): ${requisitos.orcamento ? requisitos.orcamento.toFixed(2) : 'Não especificado, otimizar custo-benefício'}

- Perfil do PC:
  - Tipo de Máquina: ${requisitos.perfilPC.machineType || 'Não especificado'}
  - É tipo customizado?: ${requisitos.perfilPC.isCustomType ? 'Sim' : 'Não'}
  - Descrição Customizada: ${requisitos.perfilPC.customDescription || 'N/A'}
  - (Incluir outros campos de perfilPC como purpose, gamingType, workField, serverType, etc.)
  - Propósito Principal (se Computador Pessoal): ${requisitos.perfilPC.purpose || 'Não especificado'}
  - Área de Trabalho (Produtividade/Estação): ${requisitos.perfilPC.workField || 'N/A'}
  - Softwares Principais: ${requisitos.perfilPC.softwareUsed || 'N/A'}


- Ambiente:
  - Cidade: ${requisitos.ambiente.cidade ? `${requisitos.ambiente.cidade}${requisitos.ambiente.codigoPais ? ', ' + requisitos.ambiente.codigoPais : ''}` : 'Não detectada/informada'}
  - Temperatura Média da Cidade: ${requisitos.ambiente.temperaturaMediaCidade !== undefined ? requisitos.ambiente.temperaturaMediaCidade + '°C' : 'N/A'}
  - Temperatura Máxima da Cidade: ${requisitos.ambiente.temperaturaMaximaCidade !== undefined ? requisitos.ambiente.temperaturaMaximaCidade + '°C' : 'N/A'}
  - Descrição do Clima na Cidade: ${requisitos.ambiente.descricaoClimaCidade || 'N/A'}
  - Ventilação no Local do PC: ${requisitos.ambiente.ventilacaoLocalPC || 'Não especificado'}
  - Nível de Poeira no Local do PC: ${requisitos.ambiente.nivelPoeiraLocalPC || 'Não especificado'}
  - Cômodo do PC: ${requisitos.ambiente.comodoPC || 'Não especificado'}
  - Controle de Temperatura (Geral): ${requisitos.ambiente.controleTemperaturaGeral || 'Ventilação natural'}
  - Nível de Poeira (Geral): ${requisitos.ambiente.nivelPoeiraGeral || 'Média'}

- Preferências Gerais Adicionais:
  - Experiência de Montagem: ${requisitos.buildExperience || 'Não especificado'}
  - Preferência de Marcas: ${requisitos.brandPreference || 'Nenhuma'}
  - Importância da Estética: ${requisitos.aestheticsImportance || 'Não especificada'}
  - Tamanho do Gabinete: ${requisitos.caseSize || 'Não especificado'}
  - Nível de Ruído: ${requisitos.noiseLevel || 'Indiferente'}
  - Portas Específicas: ${requisitos.specificPorts || 'Nenhuma'}
  - Outras Preferências (texto livre): ${requisitos.preferences || 'Nenhuma'}

Componentes Disponíveis (ID, Categoria, Nome, Preço, Especificações Chave):
${JSON.stringify(componentSummary, null, 2)}

Instruções: (Manter instruções, mas garantir que referenciam os campos corretos de 'requisitos.perfilPC' e 'requisitos.ambiente')
1.  Selecione um componente para cada categoria essencial.
2.  Placa de Vídeo é essencial para 'Computador Pessoal' (Jogos, Edição Criativa), 'Estação de Trabalho', 'Máquina para Mineração', 'PC para Streaming'.
3.  Cooler CPU é essencial.
4.  Priorize compatibilidade e otimize para \`requisitos.perfilPC.machineType\` e seus sub-detalhes. Use \`requisitos.orcamento\` como guia.
5.  Considere as CONDIÇÕES CLIMÁTICAS (\`requisitos.ambiente.temperaturaMediaCidade\`, etc.) e ambientais (\`requisitos.ambiente.ventilacaoLocalPC\`, etc.).
6.  Se o orçamento for insuficiente, explique no 'budgetNotes'.
7.  Calcule o preço total. Forneça justificativa e avisos de compatibilidade.

Responda OBRIGATORIAMENTE em formato JSON. O JSON deve ter a seguinte estrutura:
{
  "recommendedComponentIds": ["id_cpu", "id_mobo", ...],
  "justification": "Breve explicação das escolhas.",
  "estimatedTotalPrice": 1234.56,
  "budgetNotes": "Notas sobre o orçamento, se aplicável.",
  "compatibilityWarnings": ["Aviso 1", "Aviso 2"]
}
Não inclua nenhum texto fora do bloco JSON.
`;

  try {
    const result: GenerateContentResponse = await ai.models.generateContent({
      model: TEXT_MODEL_NAME,
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
      }
    });
    
    const recommendation = parseJsonFromGeminiResponse<AIRecommendation>(result.text);
    return recommendation;

  } catch (error) {
    console.error("Erro ao chamar API Gemini (getBuildRecommendation):", error);
    // @ts-ignore
    if (error.response && error.response.text) {
       // @ts-ignore
      console.error("Resposta de Erro do Gemini:", await error.response.text());
    }
    return null;
  }
};
