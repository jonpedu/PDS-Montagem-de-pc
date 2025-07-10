// Importações necessárias do React e tipos locais.
import React from 'react';
import { Build, Componente, PreferenciaUsuarioInput } from '../../types'; // Tipos atualizados
import Button from '../core/Button';
import Icon from '../core/Icon'; // Importa o novo componente de Ícone.
import LoadingSpinner from '../core/LoadingSpinner';

// Define as propriedades que o componente BuildSummary pode receber.
interface BuildSummaryProps {
  build: Build | null; // O objeto da build a ser exibido.
  isLoading?: boolean; // Indica se a build está sendo gerada.
  isSaving?: boolean; // Indica se a build está sendo salva no momento.
  onSaveBuild?: (build: Build) => void; // Callback para salvar a build.
  onExportBuild?: (build: Build) => void; // Callback para exportar a build.
  aiRecommendationNotes?: string; // Notas adicionais da IA.
}

// Componente para exibir um único item da lista de componentes.
const ComponentItem: React.FC<{ component: Componente }> = ({ component }) => (
    <li className="flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 px-3 bg-primary rounded-lg hover:bg-primary/80 transition-colors duration-150">
      <div className="flex items-center mb-2 sm:mb-0 flex-1 min-w-0 mr-4">
        {/* O componente Icon exibe um ícone SVG com base na categoria do componente. */}
        <Icon category={component.Categoria} className="w-10 h-10 text-accent mr-3 flex-shrink-0" />
        <div>
          <h4 className="font-semibold text-accent text-sm md:text-base" title={component.Produto}>{component.Produto}</h4>
          <p className="text-xs text-neutral-dark">{component.Categoria || 'Componente'}</p>
        </div>
      </div>
      <div className="flex items-center gap-x-4 self-end sm:self-center mt-2 sm:mt-0 flex-shrink-0">
        <p className="font-medium text-neutral text-sm sm:text-base whitespace-nowrap">R$ {component.Preco.toFixed(2)}</p>
        {/* Exibe o botão "Ver Oferta" apenas se houver um link de compra. */}
        {component.LinkCompra && (
          <a href={component.LinkCompra} target="_blank" rel="noopener noreferrer" aria-label={`Ver oferta para ${component.Produto}`}>
            <Button variant="ghost" size="sm" className="whitespace-nowrap !py-1 !px-2 text-xs">
              Ver Oferta
            </Button>
          </a>
        )}
      </div>
    </li>
  );

// Componente principal que exibe o resumo da build gerada.
const BuildSummary: React.FC<BuildSummaryProps> = ({ build, isLoading, isSaving, onSaveBuild, onExportBuild, aiRecommendationNotes }) => {
  // Estado de carregamento ou quando nenhuma build está disponível.
  if (isLoading || !build || build.componentes.length === 0) {
    return (
      <div className="bg-secondary p-6 rounded-lg shadow-xl text-center h-full flex flex-col justify-center">
        {isLoading ? (
            <LoadingSpinner text="Gerando sua build..." />
        ) : (
            <>
                <Icon category="Gabinete" className="w-24 h-24 mx-auto text-neutral-dark opacity-50" />
                <h3 className="text-xl font-semibold text-neutral-dark mt-4">Sua build aparecerá aqui.</h3>
                <p className="text-sm text-neutral-dark mt-2">Comece a conversar com nosso assistente para montar seu PC em tempo real.</p>
            </>
        )}
      </div>
    );
  }
  
  const detailedComponents = build.componentes;

  return (
    <div className="bg-secondary p-4 sm:p-6 rounded-lg shadow-xl">
      <h3 className="text-2xl font-bold text-accent mb-4 pb-3 border-b border-neutral-dark/30">
        Sua Build Atual
      </h3>
      
      {aiRecommendationNotes && (
        <div className="mb-4 p-3 bg-primary/70 border border-accent/30 rounded-lg">
          <h4 className="font-semibold text-accent text-sm mb-1">Notas da IA:</h4>
          <p className="text-xs text-neutral whitespace-pre-wrap">{aiRecommendationNotes}</p>
        </div>
      )}

      <ul className="space-y-2 mb-4 max-h-[50vh] overflow-y-auto pr-2">
        {detailedComponents.map((component) => (
          <ComponentItem key={component.id} component={component} />
        ))}
      </ul>

      <div className="mt-4 pt-4 border-t border-neutral-dark/30">
        <div className="flex justify-between items-center mb-4">
          <p className="text-xl font-semibold text-neutral">Total Estimado:</p>
          <p className="text-2xl font-bold text-accent">R$ {build.orcamento.toFixed(2)}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          {onSaveBuild && (
            <Button onClick={() => onSaveBuild(build)} variant="primary" size="md" className="flex-1" isLoading={isSaving}>
              Salvar Build
            </Button>
          )}
          {onExportBuild && (
            <Button onClick={() => onExportBuild(build)} variant="secondary" size="md" className="flex-1">
              Exportar PDF
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default BuildSummary;