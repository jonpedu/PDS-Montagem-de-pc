

import { GoogleGenAI, GenerateContentResponse, Part, Content } from "@google/genai";
import { PreferenciaUsuarioInput, ChatMessage, Componente, AIRecommendation, MachineType, PurposeType, GamingType, WorkField, CreativeEditingType, CreativeWorkResolution, ProjectSize, BuildExperience, AestheticsImportance, ServerType, ServerUptime, ServerScalability, EnvTempControlType, CaseSizeType, NoiseLevelType, Ambiente, PerfilPCDetalhado } from '../types';

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

  // Handle cases where the model might add explanatory text before or after the JSON block.
  const firstBrace = jsonStr.indexOf('{');
  const lastBrace = jsonStr.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace > firstBrace) {
    jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
  }

  try {
    return JSON.parse(jsonStr) as T;
  } catch (e) {
    console.error("Falha ao analisar resposta JSON do Gemini:", e, "\nResposta Bruta:", responseText, "\nString Analisada:", jsonStr);
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


  const systemInstruction = `Você é CodeTuga, um assistente especializado em montagem de PCs. Siga este fluxo inteligente e conciso para coleta de requisitos.

ESTADO ATUAL DA COLETA (PreferenciaUsuarioInput): ${JSON.stringify(currentPreferencias)}
${weatherInfoForSystem ? `\nINFORMAÇÃO CLIMÁTICA DISPONÍVEL: ${weatherInfoForSystem}` : ''}

FLUXO DE PERGUNTAS INTELIGENTE E CONCISO:

1.  **Identificação do Tipo de Máquina** (se \`!currentPreferencias.perfilPC.machineType\`):
    Pergunte: "Que tipo de máquina você deseja montar? (ex: Computador Pessoal para Jogos, Servidor, Estação de Trabalho)"

2.  **Fluxos Específicos por Tipo** (após \`perfilPC.machineType\` ser definido):

    ### Para Computador Pessoal (\`currentPreferencias.perfilPC.machineType === 'Computador Pessoal'\`):
    a.  **Propósito Principal** (se \`!currentPreferencias.perfilPC.purpose\`):
        Pergunte: "Qual será o uso principal? (Jogos, Trabalho/Produtividade, Edição Criativa, Uso Geral)"
    
    b.  **Sub-fluxos por Propósito** (faça apenas a pergunta mais relevante):
        - Para **Jogos**: Se \`!currentPreferencias.perfilPC.gamingType\`, pergunte "Que tipo de jogos? (Competitivos/eSports, AAA/High-End)" e se \`!currentPreferencias.perfilPC.monitorSpecs\`, inclua "Qual a resolução e taxa de atualização do seu monitor? (Ex: 1080p/144Hz)".
        - Para **Trabalho/Produtividade**: Se \`!currentPreferencias.perfilPC.workField\`, pergunte "Qual sua área de trabalho? (Desenvolvimento, Design Gráfico, Engenharia/3D)" e se \`!currentPreferencias.perfilPC.softwareUsed\`, inclua "Quais os softwares mais exigentes que você usa?".
        - Para **Edição Criativa**: Se \`!currentPreferencias.perfilPC.creativeEditingType\`, pergunte "Qual tipo de edição? (Vídeo, Foto, 3D)" e se \`!currentPreferencias.perfilPC.creativeWorkResolution\`, inclua "Qual a resolução principal de trabalho? (HD, 4K, 8K)".

3.  **Orçamento** (coletar após entender as necessidades principais, se \`!currentPreferencias.orcamento\` e \`!currentPreferencias.orcamentoRange\`):
    Pergunte: "Qual faixa de orçamento você tem em mente em BRL (Reais)? (Ex: Econômico [até R$4000], Médio [R$4000-R$8000], High-End [R$8000+], ou um valor específico)"

4.  **Permissão de Localização** (após orçamento, se \`!currentPreferencias.ambiente.cidade\` E a pergunta ainda não foi feita):
    Pergunte EXATAMENTE: "Para ajudar a otimizar a refrigeração, você permite que detectemos sua localização para verificar o clima?"

5.  **Preferências Finais (Opcional)** (após as etapas anteriores):
    Se os campos críticos estiverem preenchidos e o campo \`preferences\` ainda não foi alterado, pergunte de forma aberta: "Ótimo. Para finalizar, você tem alguma outra preferência importante que eu deva saber? Isso pode incluir estética (como iluminação RGB), tamanho específico do gabinete (compacto, grande), nível de ruído (silencioso), ou necessidade de Wi-Fi/Bluetooth." Se o usuário disser 'não' ou pular, prossiga para a validação.

6.  **Validação Final e Conclusão**:
    Quando os campos CRÍTICOS (machineType, purpose/workField, orcamento/orcamentoRange) estiverem preenchidos, resuma brevemente:
    "Ok, coletei as informações principais: [Liste 2-3 pontos chave]. Está tudo correto para eu gerar uma recomendação de build?"

REGRAS DE INTERAÇÃO:
- Faça UMA pergunta por vez. Seja direto e conciso.
- EVITE fazer perguntas sobre detalhes que podem ser inferidos (como tamanho do gabinete ou nível de ruído), a menos que o usuário os mencione. Pergunte sobre eles de forma opcional na etapa 5.
- Se o usuário fornecer múltiplas informações, processe-as e faça a PRÓXIMA pergunta lógica no fluxo.
- Responda APENAS com sua próxima pergunta ou a validação final.
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

    if (lastAiQuestionText.includes("que tipo de máquina")) {
        const typeMap: Record<string, MachineType> = {
            'servidor': 'Servidor', 'server': 'Servidor',
            'workstation': 'Estação de Trabalho', 'trabalho pesado': 'Estação de Trabalho',
            'mineração': 'Máquina para Mineração', 'minerar': 'Máquina para Mineração',
            'pessoal': 'Computador Pessoal', 'pc': 'Computador Pessoal', 'desktop': 'Computador Pessoal',
            'streaming': 'PC para Streaming', 'streamar': 'PC para Streaming',
        };
        const purposeMap: Record<string, PurposeType> = {
            'jogo': 'Jogos', 'jogos': 'Jogos', 'game': 'Jogos',
            'trabalho': 'Trabalho/Produtividade', 'produtividade': 'Trabalho/Produtividade', 'estudo': 'Trabalho/Produtividade', 'escritório': 'Trabalho/Produtividade',
            'edição': 'Edição Criativa', 'edicao': 'Edição Criativa', 'editar': 'Edição Criativa', 'design': 'Edição Criativa',
            'geral': 'Uso Geral', 'básico': 'Uso Geral', 'dia a dia': 'Uso Geral', 'navegar': 'Uso Geral',
            'htpc': 'HTPC', 'sala': 'HTPC', 'filmes': 'HTPC', 'mídia': 'HTPC',
            'outro': 'Outro'
        };

        const parsedType = parseGenericOptions(lowerInput, typeMap) as MachineType;
        const parsedPurpose = parseGenericOptions(lowerInput, purposeMap) as PurposeType;

        if (parsedType) {
            updatedPreferencias.perfilPC.machineType = parsedType;
        }
        if (parsedPurpose) {
            updatedPreferencias.perfilPC.purpose = parsedPurpose;
            if (!updatedPreferencias.perfilPC.machineType) {
                updatedPreferencias.perfilPC.machineType = 'Computador Pessoal';
            }
        }
    } else if (lastAiQuestionText.includes("uso principal")) {
        const purposeMap: Record<string, PurposeType> = {
            'jogo': 'Jogos', 'jogos': 'Jogos', 'game': 'Jogos',
            'trabalho': 'Trabalho/Produtividade', 'produtividade': 'Trabalho/Produtividade', 'estudo': 'Trabalho/Produtividade', 'escritório': 'Trabalho/Produtividade',
            'edição': 'Edição Criativa', 'edicao': 'Edição Criativa', 'editar': 'Edição Criativa',
            'geral': 'Uso Geral', 'básico': 'Uso Geral', 'dia a dia': 'Uso Geral', 'navegar': 'Uso Geral',
            'htpc': 'HTPC', 'sala': 'HTPC', 'filmes': 'HTPC', 'mídia': 'HTPC',
            'outro': 'Outro'
        };
        updatedPreferencias.perfilPC.purpose = parseGenericOptions(lowerInput, purposeMap) as PurposeType;
    } else if (lastAiQuestionText.includes("tipo de jogos")) {
        const gameTypeMap: Record<string, GamingType> = {
            'competitivo': 'Competitivos/eSports', 'esports': 'Competitivos/eSports', 'fps': 'Competitivos/eSports', 'valorant': 'Competitivos/eSports', 'cs': 'Competitivos/eSports',
            'aaa': 'AAA/High-End', 'high-end': 'AAA/High-End', 'lançamentos': 'AAA/High-End', 'single-player': 'AAA/High-End', 'pesados': 'AAA/High-End',
            'vr': 'VR', 'realidade virtual': 'VR',
            'casual': 'Casual', 'indie': 'Casual', 'leve': 'Casual',
            'outro': 'Outro', 'variados': 'Outro', 'todos': 'Outro'
        };
        updatedPreferencias.perfilPC.gamingType = parseGenericOptions(lowerInput, gameTypeMap) as GamingType;
    } else if (lastAiQuestionText.includes("área de trabalho")) {
        const workFieldMap: Record<string, WorkField> = {
            'desenvolvimento': 'Desenvolvimento', 'programação': 'Desenvolvimento', 'dev': 'Desenvolvimento',
            'design': 'Design Gráfico', 'gráfico': 'Design Gráfico',
            'engenharia': 'Engenharia/3D', '3d': 'Engenharia/3D', 'cad': 'Engenharia/3D', 'arquitetura': 'Engenharia/3D',
            'escritório': 'Escritório', 'office': 'Escritório',
            'dados': 'Ciência de Dados', 'data science': 'Ciência de Dados', 'análise': 'Ciência de Dados',
            'outro': 'Outro',
        };
        updatedPreferencias.perfilPC.workField = parseGenericOptions(lowerInput, workFieldMap) as WorkField;
    } else if (lastAiQuestionText.includes("orçamento")) {
      const budgetRangesMap: Record<string, { range: PreferenciaUsuarioInput['orcamentoRange'], value?: number }> = {
          'econômico': { range: 'Econômico [R$2-4k]', value: 3000 }, 
          'economico': { range: 'Econômico [R$2-4k]', value: 3000 }, 
          'medio': { range: 'Médio [R$4-8k]', value: 6000 }, 
          'médio': { range: 'Médio [R$4-8k]', value: 6000 }, 
          'high-end': { range: 'High-End [R$8k+]', value: 10000 }, 
          'alto': { range: 'High-End [R$8k+]', value: 10000 }, 
      };
      const numMatch = userInput.match(/(\d[\d.,]*\d|\d+)/g);
      const parsedRange = parseGenericOptions(lowerInput, Object.keys(budgetRangesMap).reduce((acc, key) => ({...acc, [key]: budgetRangesMap[key].range}), {}));
      
      if(parsedRange) {
        updatedPreferencias.orcamentoRange = parsedRange as PreferenciaUsuarioInput['orcamentoRange'];
        updatedPreferencias.orcamento = budgetRangesMap[Object.keys(budgetRangesMap).find(k => lowerInput.includes(k))!].value;
      }
      
      if (numMatch) {
          const cleanedNumber = parseFloat(numMatch[0].replace(/\./g, '').replace(',', '.'));
          if (!isNaN(cleanedNumber)) {
               updatedPreferencias.orcamento = cleanedNumber;
               if(!updatedPreferencias.orcamentoRange) updatedPreferencias.orcamentoRange = 'Personalizar'; 
          }
      }
    } else if (lastAiQuestionText.includes("outra preferência")) {
        if (!updatedPreferencias.preferences) updatedPreferencias.preferences = userInput;
    }


    return { aiResponse: aiText, updatedPreferencias };

  } catch (error) {
    console.error("Erro ao chamar API Gemini (getChatbotResponse):", error);
    const typedError = error as any;
    if (typedError?.error?.code === 429 || String(typedError).includes('429')) {
      return { 
        aiResponse: "Estou recebendo muitas solicitações no momento. Por favor, aguarde alguns instantes antes de tentar novamente.", 
        updatedPreferencias: currentPreferencias 
      };
    }
    return { aiResponse: "Desculpe, ocorreu um erro ao processar sua solicitação.", updatedPreferencias: currentPreferencias };
  }
};

export const preFilterComponents = (components: Componente[], budget?: number): Componente[] => {
    const COMPONENT_COUNT_PER_CATEGORY = 15;

    if (!budget || budget <= 0) {
        const maxComponents = COMPONENT_COUNT_PER_CATEGORY * 8; // ~120 components
        if (components.length <= maxComponents) return components;
        const shuffled = [...components].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, maxComponents);
    }

    const budgetDistribution: Record<string, number> = {
        'Processadores': 0.20,
        'Placas de Vídeo': 0.35,
        'Placas-Mãe': 0.12,
        'Memória RAM': 0.08,
        'SSD': 0.08,
        'Fonte': 0.07,
        'Gabinete': 0.05,
        'Cooler': 0.05,
    };

    const finalFilteredComponents = new Map<string, Componente>();
    const allCategories = [...new Set(components.map(c => c.Categoria))];

    allCategories.forEach(category => {
        const categoryComponents = components.filter(c => c.Categoria === category);
        if (categoryComponents.length === 0) return;
        
        const targetPrice = budget * (budgetDistribution[category] || 0.05);

        const sortedComponents = [...categoryComponents].sort((a, b) => {
            const diffA = Math.abs(a.Preco - targetPrice);
            const diffB = Math.abs(b.Preco - targetPrice);
            return diffA - diffB;
        });
        
        const topN = sortedComponents.slice(0, COMPONENT_COUNT_PER_CATEGORY);
        topN.forEach(comp => {
            if (!finalFilteredComponents.has(comp.id)) {
                finalFilteredComponents.set(comp.id, comp);
            }
        });
    });

    console.log(`Pre-filtering reduced components from ${components.length} to ${finalFilteredComponents.size}`);
    return Array.from(finalFilteredComponents.values());
};


export const getBuildRecommendation = async (
  requisitos: PreferenciaUsuarioInput,
  availableComponents: Componente[]
): Promise<AIRecommendation | null> => {
  if (!API_KEY) {
    console.error("API Key do Gemini não configurada para getBuildRecommendation");
    return null;
  }
  
  const smartFilteredComponents = preFilterComponents(availableComponents, requisitos.orcamento);

  const componentSummary = smartFilteredComponents.map(c => ({
    id: c.id,
    Produto: c.Produto,
    Preco: c.Preco,
    Categoria: c.Categoria,
  }));

  const prompt = `
Você é um especialista em montagem de PCs. Sua tarefa é recomendar uma build otimizada com base nos seguintes requisitos e na lista de componentes disponíveis.

Requisitos do Usuário (PreferenciaUsuarioInput):
- Orçamento:
  - Faixa Escolhida: ${requisitos.orcamentoRange || 'Não especificado'}
  - Valor Numérico (BRL): ${requisitos.orcamento ? requisitos.orcamento.toFixed(2) : 'Não especificado, otimizar custo-benefício'}
- Perfil do PC:
  - Tipo de Máquina: ${requisitos.perfilPC.machineType || 'Não especificado'}
  - Propósito Principal: ${requisitos.perfilPC.purpose || 'Não especificado'}
  - Detalhes (Jogos/Trabalho/etc.): ${requisitos.perfilPC.gamingType || requisitos.perfilPC.workField || requisitos.perfilPC.creativeEditingType || 'N/A'}
  - Softwares Principais: ${requisitos.perfilPC.softwareUsed || 'N/A'}
- Ambiente:
  - Cidade (Clima): ${requisitos.ambiente.cidade ? `${requisitos.ambiente.cidade}, Temp. Média: ${requisitos.ambiente.temperaturaMediaCidade}°C` : 'Não informado'}
  - Local Específico do PC: Ventilação: ${requisitos.ambiente.ventilacaoLocalPC || 'Não informado'}, Poeira: ${requisitos.ambiente.nivelPoeiraLocalPC || 'Não informado'}
- Preferências Gerais Adicionais:
  - Experiência de Montagem: ${requisitos.buildExperience || 'Não especificado'}
  - Preferência de Marcas: ${requisitos.brandPreference || 'Nenhuma'}
  - Importância da Estética: ${requisitos.aestheticsImportance || 'Não especificada'}
  - Tamanho do Gabinete: ${requisitos.caseSize || 'Não especificado'}
  - Nível de Ruído: ${requisitos.noiseLevel || 'Indiferente'}
  - Outras Preferências (texto livre): ${requisitos.preferences || 'Nenhuma'}

Componentes Disponíveis (ID, Nome do Produto, Preço, Categoria):
${JSON.stringify(componentSummary, null, 2)}

Instruções CRÍTICAS e OBRIGATÓRIAS:
1.  **ANÁLISE E SELEÇÃO:** Sua tarefa é analisar a lista de "Componentes Disponíveis". Cada componente já possui um campo 'Categoria' definido. Você DEVE usar este campo para a seleção.
    a.  **Use a Categoria Fornecida:** NÃO tente inferir a categoria do nome do produto. O campo 'Categoria' é a fonte da verdade.
    b.  **Analise o 'Produto':** Dentro de cada categoria, analise o nome do 'Produto' para entender as especificações (ex: "Core i5-14600K", "DDR5", "RTX 4060") e garantir a compatibilidade.

2.  **REGRAS DE SELEÇÃO DE COMPONENTES:** Monte uma build completa e compatível.
    -   **Essenciais (SEMPRE inclua UM de cada):** 'Processadores', 'Placas-Mãe', 'Memória RAM', 'SSD', 'Fonte', 'Gabinete'. Use as categorias exatas fornecidas.
    -   **Placa de Vídeo:** É OBRIGATÓRIA, a menos que o propósito seja um servidor simples ou um PC de escritório muito básico E o processador escolhido tenha vídeo integrado (inferido do nome, ex: 'Ryzen 5 5600G').
    -   **Cooler:** É ALTAMENTE RECOMENDADO, especialmente para processadores de alto desempenho (inferido do nome, ex: 'Core i7', 'Ryzen 7', ou sufixos 'K', 'X'). Se o orçamento for muito apertado, pode ser omitido se o processador incluir um cooler padrão (ex: 'Ryzen 5 5600').
    -   **HD:** É OPCIONAL. Inclua apenas se o usuário precisar de muito armazenamento e o orçamento permitir, em adição ao SSD.

3.  **COMPATIBILIDADE É REI (REGRA MAIS IMPORTANTE):** A principal prioridade é garantir 100% de compatibilidade. Verifique CUIDADOSAMENTE:
    - **Soquete CPU vs Placa-mãe:** Ex: Um 'Processador Intel LGA1700' DEVE ser pareado com uma 'Placa-Mãe LGA1700'. Um 'Processador AMD AM5' DEVE ser pareado com uma 'Placa-Mãe AM5'.
    - **Tipo de RAM:** Se a Placa-Mãe suporta 'DDR5', a 'Memória RAM' DEVE ser 'DDR5'. Se suporta 'DDR4', a RAM deve ser 'DDR4'. Verifique isso nos nomes dos produtos.
    - **Tamanho (Form Factor):** Uma 'Placa-Mãe ATX' precisa de um 'Gabinete' que suporte ATX (Mid Tower, Full Tower). Uma 'Placa-Mãe Micro-ATX' cabe em gabinetes Micro-ATX ou maiores.
    - **Potência da Fonte:** A 'Fonte' deve ter potência suficiente para todos os componentes, especialmente a Placa de Vídeo e o Processador. Para builds de alto desempenho, prefira fontes de 750W ou mais.

4.  **FOCO NO ORÇAMENTO:** Tente montar a melhor build possível DENTRO do orçamento fornecido. Se não for possível, monte a build mais próxima e explique a situação no campo 'budgetNotes'.

5.  **SAÍDA EM JSON (OBRIGATÓRIO):** Sua resposta DEVE ser um único bloco de código JSON válido, sem nenhum texto, markdown, ou explicações antes ou depois. Não inclua NENHUM comentário ou pensamento dentro do próprio bloco de código JSON. O JSON deve ser estritamente aderente ao formato especificado abaixo:
{
  "recommendedComponentIds": ["id_do_processador", "id_da_placa_mae", ...],
  "justification": "Explicação concisa das suas escolhas, focando em como elas atendem às necessidades e orçamento do usuário e como a compatibilidade foi garantida.",
  "estimatedTotalPrice": 1234.56,
  "budgetNotes": "Se a build exceder o orçamento ou for muito abaixo, explique o porquê aqui. Se o orçamento for adequado, diga 'O orçamento foi bem utilizado'.",
  "compatibilityWarnings": ["Se houver alguma pequena dúvida ou observação sobre compatibilidade (ex: 'Pode ser necessário atualizar a BIOS da placa-mãe'), liste aqui. Se não houver, deixe um array vazio []."]
}
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
    const typedError = error as any;
    if (typedError?.error?.code === 429 || String(typedError).includes('429')) {
        throw new Error("O limite de solicitações da IA foi atingido. Por favor, aguarde um momento e tente gerar a recomendação novamente.");
    }
    
    // @ts-ignore
    if (error.response && error.response.text) {
       // @ts-ignore
      console.error("Resposta de Erro do Gemini:", await error.response.text());
    }
    return null;
  }
};