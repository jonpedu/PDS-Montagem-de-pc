// Importações de React, hooks, tipos, componentes de UI e serviços.
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PreferenciaUsuarioInput, Build, Componente, AIRecommendation, Ambiente, PerfilPCDetalhado } from '../types';
import ChatbotAnamnesis from '../components/build/ChatbotAnamnesis';
import BuildSummary from '../components/build/BuildSummary';
import LoadingSpinner from '../components/core/LoadingSpinner';
import Button from '../components/core/Button';
import { useAuth } from '../contexts/AuthContext';
import Modal from '../components/core/Modal';
import { supabase } from '../services/supabaseClient';
import { getComponents } from '../services/componentService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

// Chaves usadas para armazenar dados temporários na sessionStorage.
const SESSION_PENDING_BUILD_KEY = 'pendingBuild';
const SESSION_PROCEEDED_ANONYMOUSLY_KEY = 'proceededAnonymously';
const SESSION_PENDING_PREFERENCIAS_KEY = 'pendingPreferencias';


// Componente principal que orquestra todo o fluxo de montagem de PC.
export const BuildPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  // Estados principais da página
  const [preferencias, setPreferencias] = useState<PreferenciaUsuarioInput | null>(null);
  const [currentBuild, setCurrentBuild] = useState<Build | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Inicia como true para carregar componentes
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isViewingSavedBuild, setIsViewingSavedBuild] = useState<boolean>(false);
  const [availableComponents, setAvailableComponents] = useState<Componente[] | null>(null);
  const [pageInitialized, setPageInitialized] = useState<boolean>(false);

  // Estados para gerenciar o fluxo de autenticação para usuários anônimos.
  const [isAuthInfoModalOpen, setIsAuthInfoModalOpen] = useState<boolean>(false);
  const [pendingActionForAuth, setPendingActionForAuth] = useState<'save' | 'export' | null>(null);
  const hasProceededAnonymously = useRef<boolean>(sessionStorage.getItem(SESSION_PROCEEDED_ANONYMOUSLY_KEY) === 'true');

  // Efeito para carregar a lista de componentes disponíveis na montagem do componente.
  useEffect(() => {
    const fetchComponents = async () => {
        setIsLoading(true);
        try {
            const components = await getComponents();
            if (components.length > 0) {
                setAvailableComponents(components);
            } else {
                setError("Não foi possível carregar os componentes disponíveis. A montagem IA está desabilitada.");
            }
        } catch (e: any) {
             setError(`Erro ao carregar componentes: ${e.message}`);
        } finally {
            setIsLoading(false);
        }
    };
    fetchComponents();
  }, []);
  
  // Retorna a string de notas da IA (justificativa + avisos) para exibição.
  const getNotesFromBuild = (build: Build | null): string | undefined => {
      if (!build) return undefined;
      // A justificativa agora contém a visão geral e os avisos.
      return build.justificativa;
  };

  // Função para resetar todo o estado da página, iniciando uma nova montagem.
  const resetBuildState = useCallback(() => {
    setPreferencias(null);
    setCurrentBuild(null);
    setError(null);
    setIsViewingSavedBuild(false);
    setPageInitialized(false);
    sessionStorage.removeItem(SESSION_PENDING_BUILD_KEY);
    sessionStorage.removeItem(SESSION_PENDING_PREFERENCIAS_KEY);
    setPendingActionForAuth(null);
    // Para forçar a recriação do componente Chatbot
    navigate('/build', { replace: true, state: { newBuild: true, timestamp: Date.now() } });
  }, [navigate]);

  // Função que executa a lógica de salvar a build no Supabase.
  const executeActualSaveBuild = useCallback(async (buildToSave: Build) => {
    if (!currentUser) {
      toast.error("Erro: Usuário não está logado para salvar.");
      return;
    }
    
    setIsSaving(true);
    setError(null);
    try {
        const { error: rpcError } = await supabase.rpc('upsert_build_with_components', {
            p_build_id: buildToSave.id,
            p_nome: buildToSave.nome,
            p_orcamento: buildToSave.orcamento,
            p_data_criacao: buildToSave.dataCriacao,
            p_requisitos: buildToSave.requisitos || null,
            p_avisos_compatibilidade: buildToSave.avisos_compatibilidade || [],
            p_component_ids: buildToSave.componentes.map(c => c.id)
        });

        if (rpcError) {
            throw rpcError;
        }

        toast.success(`Build "${buildToSave.nome}" salva com sucesso!`);
        setCurrentBuild(buildToSave);
        setIsViewingSavedBuild(true);
        navigate(`/build/${buildToSave.id}`, { replace: true });

    } catch (error: any) {
        console.error("Save build raw error object:", error);
        
        let fullMessage;
        if (error && typeof error === 'object' && error.message) {
            const message = error.message;
            const details = error.details ? `\nDetalhes: ${error.details}` : '';
            const hint = error.hint ? `\nDica: ${error.hint}` : '';
            fullMessage = `Falha ao salvar a build: ${message}${details}${hint}`;
        } else {
            // Fallback for non-standard errors
            let technicalDetails = '';
            try {
                // Attempt to stringify for more info, avoiding useless empty objects.
                const detailsString = JSON.stringify(error);
                if (detailsString !== '{}') {
                    technicalDetails = `Detalhes técnicos: ${detailsString}`;
                }
            } catch (e) {
                // If stringify fails, use a generic message.
                technicalDetails = 'Não foi possível obter os detalhes do erro.';
            }
            fullMessage = `Ocorreu um erro inesperado ao salvar. ${technicalDetails}`.trim();
        }
        setError(fullMessage);
    } finally {
        setIsSaving(false);
    }
  }, [currentUser, navigate]);

  // Função que executa a exportação da build para um arquivo PDF.
  const executeActualExportBuild = useCallback((buildToExport: Build) => {
    const doc = new jsPDF();
    const notesForExport = getNotesFromBuild(buildToExport);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(`Resumo da Build: ${buildToExport.nome}`, 14, 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(12);
    doc.text(`Data: ${new Date(buildToExport.dataCriacao).toLocaleDateString()}`, 14, 30);
    doc.text(`Preço Total Estimado: R$ ${buildToExport.orcamento.toFixed(2)}`, 14, 36);
    
    let startY = 45;
    if (notesForExport) {
        const splitNotes = doc.splitTextToSize(notesForExport, 180);
        doc.text(splitNotes, 14, startY);
        startY += (splitNotes.length * 5) + 5;
    }

    const head = [['Produto', 'Preço', 'Oferta']];
    const body = buildToExport.componentes.map(c => [
        c.Produto,
        `R$ ${c.Preco.toFixed(2)}`,
        c.LinkCompra ? 'Ver Oferta' : 'N/A'
    ]);

    autoTable(doc, {
        head,
        body,
        startY,
        headStyles: { fillColor: [13, 27, 42] },
        willDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 2) {
                const component = buildToExport.componentes[data.row.index];
                if (component && component.LinkCompra) {
                    data.cell.styles.textColor = [65, 234, 212];
                }
            }
        },
        didDrawCell: (data) => {
            if (data.section === 'body' && data.column.index === 2) {
                const component = buildToExport.componentes[data.row.index];
                if (component && component.LinkCompra) {
                    doc.link(data.cell.x, data.cell.y, data.cell.width, data.cell.height, { url: component.LinkCompra });
                }
            }
        }
    });

    doc.save(`${buildToExport.nome.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
  }, []); 

  // Efeito para lidar com a navegação e o carregamento de builds salvas.
  useEffect(() => {
    const pathParts = location.pathname.split('/');
    const buildId = pathParts.length > 2 && pathParts[1] === 'build' ? pathParts[2] : null;

    if (location.state?.newBuild && !pageInitialized) {
        resetBuildState();
        setPageInitialized(true);
        return;
    }
    
    if (buildId) {
        if ((isViewingSavedBuild && currentBuild?.id === buildId)) return;
      
        setIsLoading(true);
        const fetchSavedBuild = async () => {
            const allComponents = await getComponents();
            if(!allComponents?.length) {
                setError("Não foi possível carregar os componentes para exibir a build salva.");
                setIsLoading(false);
                return;
            }
            
            const { data, error: fetchError } = await supabase.from('builds').select('*, build_components(component_id)').eq('id', buildId).single();
            if (fetchError) {
                setError(`A build com o ID '${buildId}' não foi encontrada.`);
                resetBuildState();
            } else if (data) {
                const componentMap = new Map(allComponents.map(c => [c.id, c]));
                const components = (data.build_components as any[]).map(bc => componentMap.get(String(bc.component_id))).filter(Boolean);
                
                const warnings = data.avisos_compatibilidade || [];
                const justificationFromDb = warnings.length > 0
                    ? `Avisos de Compatibilidade:\n${warnings.map(w => `- ${w}`).join('\n')}`
                    : undefined;

                const formattedBuild: Build = {
                    id: data.id, nome: data.nome, orcamento: data.orcamento, dataCriacao: data.data_criacao,
                    justificativa: justificationFromDb,
                    avisos_compatibilidade: warnings,
                    requisitos: data.requisitos as PreferenciaUsuarioInput || undefined,
                    componentes: components as Componente[], userId: data.user_id,
                };
                setCurrentBuild(formattedBuild);
                setPreferencias(formattedBuild.requisitos || { perfilPC: {} as PerfilPCDetalhado, ambiente: {} as Ambiente });
                setIsViewingSavedBuild(true);
            }
            setIsLoading(false);
        };
        if(availableComponents) fetchSavedBuild();
    }
  }, [location.pathname, location.state, currentBuild?.id, isViewingSavedBuild, resetBuildState, navigate, availableComponents, pageInitialized]);

  // Efeito para gerenciar a lógica de autenticação pós-ação.
  useEffect(() => {
    if (!currentUser && !location.pathname.includes('/build/') && !hasProceededAnonymously.current && !currentBuild && !isLoading && availableComponents) {
      setIsAuthInfoModalOpen(true);
    }
    if (currentUser && location.state?.fromLogin && location.state?.action) {
      const action = location.state.action as 'save' | 'export';
      const storedBuildJSON = sessionStorage.getItem(SESSION_PENDING_BUILD_KEY);

      if (storedBuildJSON) {
        const buildToProcess: Build = JSON.parse(storedBuildJSON);
        const storedPreferenciasJSON = sessionStorage.getItem(SESSION_PENDING_PREFERENCIAS_KEY);

        setCurrentBuild(buildToProcess);
        if(storedPreferenciasJSON) setPreferencias(JSON.parse(storedPreferenciasJSON));
        
        const timerId = setTimeout(() => {
            if (action === 'save') executeActualSaveBuild(buildToProcess);
            else if (action === 'export') executeActualExportBuild(buildToProcess);
        }, 100);

        sessionStorage.removeItem(SESSION_PENDING_BUILD_KEY);
        sessionStorage.removeItem(SESSION_PENDING_PREFERENCIAS_KEY);
        setPendingActionForAuth(null);
        navigate(location.pathname, { state: {}, replace: true }); 
        return () => clearTimeout(timerId);
      }
    }
  }, [currentUser, location, navigate, currentBuild, isLoading, executeActualSaveBuild, executeActualExportBuild, availableComponents]);

  const handleLoginForBuild = () => {
    setIsAuthInfoModalOpen(false);
    navigate('/login', { state: { from: location, pendingAction: pendingActionForAuth } });
  };
  const handleContinueAnonymously = () => {
    setIsAuthInfoModalOpen(false);
    hasProceededAnonymously.current = true;
    sessionStorage.setItem(SESSION_PROCEEDED_ANONYMOUSLY_KEY, 'true');
  };
  
  // Callback para o chatbot atualizar a build em tempo real.
  const handleBuildUpdate = useCallback((build: Build, finalPreferences: PreferenciaUsuarioInput) => {
     const justificationText = build.justificativa || '';
     const warningsRegex = /Avisos de Compatibilidade:([\s\S]*)/i;
     const warningsMatch = justificationText.match(warningsRegex);
     const warningsText = warningsMatch ? warningsMatch[1].trim() : '';
     const warnings = warningsText ? warningsText.split('\n').map(w => w.replace(/^- /, '').trim()).filter(Boolean) : [];

    const buildWithWarnings: Build = {
        ...build,
        avisos_compatibilidade: warnings,
    };

    setCurrentBuild(buildWithWarnings);
    setPreferencias(finalPreferences);
  }, []);

  const triggerAuthenticatedAction = (action: 'save' | 'export') => {
    if (!currentBuild || !preferencias) return;
    if (!currentUser) {
      sessionStorage.setItem(SESSION_PENDING_BUILD_KEY, JSON.stringify(currentBuild));
      sessionStorage.setItem(SESSION_PENDING_PREFERENCIAS_KEY, JSON.stringify(preferencias));
      setPendingActionForAuth(action);
      setIsAuthInfoModalOpen(true);
    } else {
      if (action === 'save') executeActualSaveBuild(currentBuild);
      if (action === 'export') executeActualExportBuild(currentBuild);
    }
  };
  
  const triggerSaveBuild = () => triggerAuthenticatedAction('save');
  const triggerExportBuild = () => triggerAuthenticatedAction('export');

  const aiNotesToDisplay = getNotesFromBuild(currentBuild);

  const renderContent = () => {
    if (isLoading && !availableComponents) {
       return <div className="text-center py-10"><LoadingSpinner size="lg" text={'Carregando componentes...'} /></div>;
    }
    if (error) {
      return (
        <div className="my-6 p-6 bg-red-800/90 text-red-100 rounded-lg text-center">
          <h3 className="text-2xl font-semibold mb-3">Oops! Algo deu errado.</h3>
          <p className="mb-4 whitespace-pre-wrap">{error}</p>
          <Button onClick={resetBuildState} variant="secondary" size="lg">Tentar Novamente</Button>
        </div>
      );
    }
    if (isViewingSavedBuild) {
        return (
             <>
              <BuildSummary build={currentBuild} onSaveBuild={triggerSaveBuild} isSaving={isSaving} onExportBuild={triggerExportBuild} aiRecommendationNotes={aiNotesToDisplay} />
              <div className="mt-6 text-center">
                <Button onClick={resetBuildState} variant="secondary" size="lg">
                    Iniciar Nova Montagem com IA
                </Button>
              </div>
            </>
        );
    }

    // Layout principal da página interativa
    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
            <ChatbotAnamnesis 
              key={location.state?.timestamp || 'chat-init'} // Força recriação ao resetar
              onBuildUpdate={handleBuildUpdate}
              availableComponents={availableComponents}
              initialAnamnesisData={preferencias || { perfilPC: {} as PerfilPCDetalhado, ambiente: {} as Ambiente }}
            />
        </div>
        <div className="lg:col-span-2 mt-8 lg:mt-0">
            <div className="sticky top-24">
              <BuildSummary 
                  build={currentBuild} 
                  isLoading={false} // Loading é gerenciado pelo texto do chatbot
                  onSaveBuild={currentBuild ? triggerSaveBuild : undefined}
                  isSaving={isSaving}
                  onExportBuild={currentBuild ? triggerExportBuild : undefined}
                  aiRecommendationNotes={aiNotesToDisplay}
              />
            </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      {isAuthInfoModalOpen && (
        <Modal
          isOpen={isAuthInfoModalOpen}
          onClose={pendingActionForAuth ? () => setIsAuthInfoModalOpen(false) : handleContinueAnonymously}
          title={pendingActionForAuth ? "Login Necessário" : "Aviso: Montagem Anônima"}
        >
          {pendingActionForAuth ? (
            <div>
              <p className="text-neutral-dark mb-6">
                Você precisa estar logado para {pendingActionForAuth === 'save' ? 'salvar' : 'exportar'} sua build.
              </p>
              <div className="flex justify-end gap-3">
                <Button variant="secondary" onClick={() => setIsAuthInfoModalOpen(false)}>Cancelar</Button>
                <Button variant="primary" onClick={handleLoginForBuild}>Fazer Login</Button>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-neutral-dark mb-6">
                Para salvar seu progresso, recomendamos criar uma conta ou fazer login.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="secondary" onClick={handleContinueAnonymously} className="flex-1">Continuar como Visitante</Button>
                <Button variant="primary" onClick={handleLoginForBuild} className="flex-1">Login / Cadastrar</Button>
              </div>
            </div>
          )}
        </Modal>
      )}
      {renderContent()}
    </div>
  );
};