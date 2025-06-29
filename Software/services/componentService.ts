import { Componente } from '../types';

// Cache components to avoid re-fetching and re-parsing
let componentCache: Componente[] | null = null;

const parseComponentsCSV = (csvText: string): Componente[] => {
    const lines = csvText.trim().split('\n');
    const headerLine = lines.shift()?.trim();
    if (!headerLine) {
        console.error("CSV header not found");
        return [];
    }

    const headers = headerLine.split(',').map(h => h.trim());
    const idIndex = headers.indexOf('id');
    const categoriaIndex = headers.indexOf('Categoria');
    const produtoIndex = headers.indexOf('Produto');
    const precoIndex = headers.indexOf('Preço');
    const linkIndex = headers.indexOf('Link');
    
    if ([idIndex, categoriaIndex, produtoIndex, precoIndex, linkIndex].includes(-1)) {
        console.error("CSV headers are incorrect. Expected 'id,Categoria,Produto,Preço,Link'", headers);
        return [];
    }

    const knownBrands = ["Kingston", "Corsair", "XPG", "Gigabyte", "ASUS", "MSI", "ASRock", "WD", "Western Digital", "Seagate", "XFX", "Sapphire", "Galax", "Palit", "PCYes", "PowerColor", "Rise Mode", "Noctua", "Deepcool", "Lian Li", "NZXT", "Cooler Master", "Aerocool", "Fortrek", "Redragon", "EVGA", "Zotac", "Inno3D", "Hikvision", "Lexar", "Crucial", "ADATA", "Patriot", "Intel", "AMD", "Dell", "Toshiba", "Samsung", "PNY", "G.Skill"];

    return lines.map((line, index) => {
        // Regex to handle commas inside quoted strings
        const values = line.match(/(?:"[^"]*"|[^,]+)/g);
        if (!values || values.length !== headers.length) {
            console.warn(`Skipping malformed CSV line ${index + 2}:`, line);
            return null;
        }

        const cleanedValues = values.map(v => v.replace(/^"|"$/g, '').trim());
        const produto = cleanedValues[produtoIndex] || '';
        const brand = knownBrands.find(b => produto.toLowerCase().includes(b.toLowerCase()));
        
        const preco = parseFloat(cleanedValues[precoIndex]);
        if (isNaN(preco)) {
             console.warn(`Skipping line ${index + 2} due to invalid price:`, line);
             return null;
        }

        return {
            id: cleanedValues[idIndex],
            Categoria: cleanedValues[categoriaIndex],
            Produto: produto,
            Preco: preco,
            LinkCompra: cleanedValues[linkIndex],
            brand: brand
        } as Componente;
    }).filter((c): c is Componente => c !== null);
};

export const getComponents = async (): Promise<Componente[]> => {
    if (componentCache) {
        return componentCache;
    }

    try {
        const response = await fetch('/data/componentes.csv');
        if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.statusText}`);
        }
        const csvText = await response.text();
        componentCache = parseComponentsCSV(csvText);
        console.log(`Loaded ${componentCache.length} components from CSV.`);
        return componentCache;
    } catch (error) {
        console.error("Failed to fetch or parse components from CSV:", error);
        return [];
    }
};
