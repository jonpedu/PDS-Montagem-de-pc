/**
 * @file Página de Montagem (BuildPage) - Versão Simplificada.
 * @module pages/BuildPage
 * @description Versão simplificada da página de montagem de PC, sem autenticação,
 * focada apenas na experiência de montagem com IA e download direto do PDF.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { PreferenciaUsuarioInput, Build, Componente, Ambiente, PerfilPCDetalhado } from '../types';
import ChatbotAnamnesis from '../components/build/ChatbotAnamnesis';
import BuildSummary from '../components/build/BuildSummary';
import LoadingSpinner from '../components/core/LoadingSpinner';
import Button from '../components/core/Button';
import { getComponents } from '../services/componentService';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import toast from 'react-hot-toast';

/**
 * @component BuildPage
 * @description Página principal para montagem de PC com IA.
 * Versão simplificada sem autenticação, permitindo download direto do PDF.
 * @returns {React.ReactElement} A página de montagem de PC interativa.
 */
export const BuildPage: React.FC = () => {
  const location = useLocation();

  // Estados principais da página
  const [preferencias, setPreferencias] = useState<PreferenciaUsuarioInput | null>(null);
  const [currentBuild, setCurrentBuild] = useState<Build | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [availableComponents, setAvailableComponents] = useState<Componente[] | null>(null);
  const [isBuildComplete, setIsBuildComplete] = useState<boolean>(false);

  // Efeito para carregar a lista de componentes disponíveis
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

  /**
   * Extrai a string de notas (justificativa e avisos) da build para exibição.
   */
  const getNotesFromBuild = (build: Build | null): string | undefined => {
    if (!build) return undefined;
    return build.justificativa;
  };

  /**
   * Reseta todo o estado da página para iniciar uma nova montagem do zero.
   */
  const resetBuildState = useCallback(() => {
    setCurrentBuild(null);
    setPreferencias(null);
    setError(null);
    setIsBuildComplete(false);
    window.location.hash = '/build';
  }, []);

  /**
   * Gera e faz o download de um arquivo PDF com o resumo da build.
   */
  const exportBuildToPDF = useCallback((buildToExport: Build) => {
    try {
      const doc = new jsPDF();
      const notesForExport = getNotesFromBuild(buildToExport);

      // Cabeçalho do PDF
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text(`Resumo da Build: ${buildToExport.nome}`, 14, 22);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(12);
      doc.text(`Data: ${new Date(buildToExport.dataCriacao).toLocaleDateString()}`, 14, 30);
      doc.text(`Preço Total Estimado: R$ ${buildToExport.orcamento.toFixed(2)}`, 14, 36);

      // Notas e avisos da IA
      let startY = 45;
      if (notesForExport) {
        const splitNotes = doc.splitTextToSize(notesForExport, 180);
        doc.text(splitNotes, 14, startY);
        startY += (splitNotes.length * 5) + 5;
      }

      // Tabela de componentes
      const head = [['Produto', 'Preço', 'Categoria']];
      const body = buildToExport.componentes.map(c => [
        c.Produto,
        `R$ ${c.Preco.toFixed(2)}`,
        c.Categoria
      ]);

      autoTable(doc, {
        head,
        body,
        startY,
        headStyles: { fillColor: [13, 27, 42] },
      });

      // Download do arquivo
      const filename = `${buildToExport.nome.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`;
      doc.save(filename);
      toast.success(`Build exportada como ${filename}`);

    } catch (error: any) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao gerar o PDF. Tente novamente.');
    }
  }, []);

  /**
   * Callback para receber atualizações da build.
   */
  const handleBuildUpdate = useCallback((buildUpdate: Partial<Build>, finalPreferences: PreferenciaUsuarioInput) => {
    setCurrentBuild(prevBuild => {
      const baseBuild = prevBuild || {
        id: crypto.randomUUID(),
        dataCriacao: new Date().toISOString(),
        nome: 'Minha Build PC',
        componentes: [],
        orcamento: 0,
      };

      const justificationText = buildUpdate.justificativa || baseBuild.justificativa || '';
      const warningsRegex = /Avisos de Compatibilidade:([\s\S]*)/i;
      const warningsMatch = justificationText.match(warningsRegex);
      const warningsText = warningsMatch ? warningsMatch[1].trim() : '';
      const warnings = warningsText ? warningsText.split('\n').map(w => w.replace(/^- /, '').trim()).filter(Boolean) : [];

      const updatedBuild: Build = {
        ...baseBuild,
        ...buildUpdate,
        requisitos: finalPreferences,
        avisos_compatibilidade: warnings,
      };

      setIsBuildComplete(!!updatedBuild.componentes && updatedBuild.componentes.length > 0);
      return updatedBuild;
    });
    setPreferencias(finalPreferences);
  }, []);

  /**
   * Função para exportar a build atual
   */
  const handleExportBuild = () => {
    if (currentBuild) {
      exportBuildToPDF(currentBuild);
    }
  };

  const aiNotesToDisplay = getNotesFromBuild(currentBuild);

  /**
   * Renderiza o conteúdo principal da página
   */
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

    return (
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <ChatbotAnamnesis
            key={location.state?.timestamp || 'chat-init'}
            onBuildUpdate={handleBuildUpdate}
            availableComponents={availableComponents}
            initialAnamnesisData={preferencias || { perfilPC: {} as PerfilPCDetalhado, ambiente: {} as Ambiente }}
          />
        </div>
        <div className="lg:col-span-2 mt-8 lg:mt-0">
          <div className="sticky top-24">
            <BuildSummary
              build={currentBuild}
              isLoading={false}
              onExportBuild={isBuildComplete && currentBuild ? handleExportBuild : undefined}
              aiRecommendationNotes={aiNotesToDisplay}
            />
            {isBuildComplete && currentBuild && (
              <div className="mt-4 text-center">
                <Button onClick={resetBuildState} variant="secondary" size="md">
                  Nova Montagem
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4">
      {renderContent()}
    </div>
  );
};