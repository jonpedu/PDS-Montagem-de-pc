// Importa o cliente Supabase e o tipo Componente.
import { supabase } from './supabaseClient';
import { Componente } from '../types';

// Variável para armazenar os componentes em cache na memória.
// Isso evita múltiplas buscas ao banco de dados durante a mesma sessão do usuário.
let componentCache: Componente[] | null = null;

// Lista de marcas conhecidas para inferir a marca a partir do nome do produto.
const knownBrands = ["Kingston", "Corsair", "XPG", "Gigabyte", "ASUS", "MSI", "ASRock", "WD", "Western Digital", "Seagate", "XFX", "Sapphire", "Galax", "Palit", "PCYes", "PowerColor", "Rise Mode", "Noctua", "Deepcool", "Lian Li", "NZXT", "Cooler Master", "Aerocool", "Fortrek", "Redragon", "EVGA", "Zotac", "Inno3D", "Hikvision", "Lexar", "Crucial", "ADATA", "Patriot", "Intel", "AMD", "Dell", "Toshiba", "Samsung", "PNY", "G.Skill"];

/**
 * Busca a lista de todos os componentes de hardware disponíveis.
 * Primeiro, verifica se os componentes já estão em cache. Se não estiverem,
 * busca os dados da tabela 'components' no Supabase, processa-os e os armazena em cache.
 * @returns Uma promessa que resolve para um array de objetos Componente.
 */
export const getComponents = async (): Promise<Componente[]> => {
    // Se o cache já existir, retorna os dados cacheados imediatamente.
    if (componentCache) {
        return componentCache;
    }

    // Busca todos os registros (*) da tabela 'components' no Supabase.
    // A lógica de try/catch foi removida para permitir que os erros se propaguem para o chamador (BuildPage).
    const { data, error } = await supabase
        .from('components')
        .select('*');

    if (error) {
        console.error("Erro ao buscar componentes do Supabase:", error.message || error);
        // Verifica se o erro é de autenticação (comum com a chave errada).
        if (error.message.includes('JWT') || error.message.includes('token') || error.message.includes('API key')) {
            throw new Error("Falha na autenticação com o Supabase. Verifique se a sua Chave Anônima (Anon Key) está correta em services/supabaseClient.ts.");
        }
        // Lança o erro original para outros tipos de falha.
        throw error;
    }

    if (!data) {
        console.warn("Nenhum dado de componente retornado do Supabase.");
        return [];
    }

    // Mapeia os dados brutos do Supabase para o tipo 'Componente' da aplicação.
    // Também infere a marca do componente com base no nome do produto.
    const components: Componente[] = data.map((item: any) => {
        const produto = item.Produto || '';
        // Encontra a primeira marca conhecida que está contida no nome do produto.
        const brand = knownBrands.find(b => produto.toLowerCase().includes(b.toLowerCase()));
        
        return {
            id: String(item.id),
            Categoria: item.Categoria,
            Produto: produto,
            Preco: Number(item.Preco),
            LinkCompra: item.LinkCompra || undefined,
            brand: brand,
        };
    });

    // Armazena os componentes processados no cache.
    componentCache = components;
    console.log(`Carregados ${componentCache.length} componentes do Supabase.`);
    return componentCache;
};
