import { supabase } from './supabaseClient';
import { Componente } from '../types';

// Cache components to avoid re-fetching
let componentCache: Componente[] | null = null;

// This list can be used to infer brands from product names, similar to the old logic.
const knownBrands = ["Kingston", "Corsair", "XPG", "Gigabyte", "ASUS", "MSI", "ASRock", "WD", "Western Digital", "Seagate", "XFX", "Sapphire", "Galax", "Palit", "PCYes", "PowerColor", "Rise Mode", "Noctua", "Deepcool", "Lian Li", "NZXT", "Cooler Master", "Aerocool", "Fortrek", "Redragon", "EVGA", "Zotac", "Inno3D", "Hikvision", "Lexar", "Crucial", "ADATA", "Patriot", "Intel", "AMD", "Dell", "Toshiba", "Samsung", "PNY", "G.Skill"];

export const getComponents = async (): Promise<Componente[]> => {
    if (componentCache) {
        return componentCache;
    }

    try {
        const { data, error } = await supabase
            .from('components')
            .select('*');

        if (error) {
            console.error("Error fetching components from Supabase:", error);
            throw error;
        }

        if (!data) {
            console.warn("No component data returned from Supabase.");
            return [];
        }

        // The data from Supabase should already have the correct column names.
        // Let's map it to our Componente type and infer the brand.
        const components: Componente[] = data.map((item: any) => {
            const produto = item.Produto || '';
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

        componentCache = components;
        console.log(`Loaded ${componentCache.length} components from Supabase.`);
        return componentCache;

    } catch (error) {
        console.error("Failed to fetch or process components from Supabase:", error);
        return [];
    }
};
