/**
 * @file Serviço de Componentes de Hardware (versão sem Supabase).
 * @module services/componentService
 * @description Este módulo fornece a lista de componentes de hardware disponíveis
 * a partir de dados estáticos locais, eliminando a dependência do Supabase.
 */

import { Componente } from '../types';

/**
 * Lista estática de componentes de hardware disponíveis.
 * Baseada nos dados anteriormente armazenados no Supabase.
 */
const COMPONENTS_DATA: Omit<Componente, 'brand'>[] = [
    // Processadores
    { id: "CPU-001", Categoria: "Processadores", Produto: "AMD Ryzen 5 5600X", Preco: 899.00, LinkCompra: "https://example.com" },
    { id: "CPU-002", Categoria: "Processadores", Produto: "Intel Core i5-12400F", Preco: 799.00, LinkCompra: "https://example.com" },
    { id: "CPU-003", Categoria: "Processadores", Produto: "AMD Ryzen 7 5700X", Preco: 1299.00, LinkCompra: "https://example.com" },
    { id: "CPU-004", Categoria: "Processadores", Produto: "Intel Core i7-12700F", Preco: 1599.00, LinkCompra: "https://example.com" },
    { id: "CPU-005", Categoria: "Processadores", Produto: "AMD Ryzen 9 5900X", Preco: 2199.00, LinkCompra: "https://example.com" },

    // Placas-Mãe
    { id: "MB-001", Categoria: "Placas-Mãe", Produto: "ASUS TUF Gaming B450M-PRO S", Preco: 459.00, LinkCompra: "https://example.com" },
    { id: "MB-002", Categoria: "Placas-Mãe", Produto: "MSI B550M PRO-VDH WIFI", Preco: 599.00, LinkCompra: "https://example.com" },
    { id: "MB-003", Categoria: "Placas-Mãe", Produto: "Gigabyte B550 AORUS ELITE", Preco: 799.00, LinkCompra: "https://example.com" },
    { id: "MB-004", Categoria: "Placas-Mãe", Produto: "MSI Z690 PRO A", Preco: 899.00, LinkCompra: "https://example.com" },
    { id: "MB-005", Categoria: "Placas-Mãe", Produto: "ASUS ROG STRIX X570-E", Preco: 1399.00, LinkCompra: "https://example.com" },

    // Memória RAM
    { id: "RAM-001", Categoria: "Memória RAM", Produto: "Kingston Fury Beast 16GB (2x8GB) DDR4-3200", Preco: 299.00, LinkCompra: "https://example.com" },
    { id: "RAM-002", Categoria: "Memória RAM", Produto: "Corsair Vengeance LPX 16GB (2x8GB) DDR4-3600", Preco: 359.00, LinkCompra: "https://example.com" },
    { id: "RAM-003", Categoria: "Memória RAM", Produto: "G.Skill Ripjaws V 32GB (2x16GB) DDR4-3200", Preco: 599.00, LinkCompra: "https://example.com" },
    { id: "RAM-004", Categoria: "Memória RAM", Produto: "Corsair Dominator 32GB (2x16GB) DDR5-5600", Preco: 1299.00, LinkCompra: "https://example.com" },
    { id: "RAM-005", Categoria: "Memória RAM", Produto: "Kingston Fury Beast 32GB (2x16GB) DDR5-4800", Preco: 999.00, LinkCompra: "https://example.com" },

    // Placas de Vídeo
    { id: "GPU-001", Categoria: "Placas de Vídeo", Produto: "NVIDIA GeForce GTX 1660 SUPER", Preco: 1299.00, LinkCompra: "https://example.com" },
    { id: "GPU-002", Categoria: "Placas de Vídeo", Produto: "AMD Radeon RX 6600", Preco: 1499.00, LinkCompra: "https://example.com" },
    { id: "GPU-003", Categoria: "Placas de Vídeo", Produto: "NVIDIA GeForce RTX 3060", Preco: 1899.00, LinkCompra: "https://example.com" },
    { id: "GPU-004", Categoria: "Placas de Vídeo", Produto: "AMD Radeon RX 6700 XT", Preco: 2499.00, LinkCompra: "https://example.com" },
    { id: "GPU-005", Categoria: "Placas de Vídeo", Produto: "NVIDIA GeForce RTX 4070", Preco: 3299.00, LinkCompra: "https://example.com" },
    { id: "GPU-006", Categoria: "Placas de Vídeo", Produto: "NVIDIA GeForce RTX 4080", Preco: 5999.00, LinkCompra: "https://example.com" },

    // SSD
    { id: "SSD-001", Categoria: "SSD", Produto: "Kingston NV2 500GB NVMe", Preco: 199.00, LinkCompra: "https://example.com" },
    { id: "SSD-002", Categoria: "SSD", Produto: "Western Digital Blue 1TB NVMe", Preco: 399.00, LinkCompra: "https://example.com" },
    { id: "SSD-003", Categoria: "SSD", Produto: "Samsung 980 1TB NVMe", Preco: 499.00, LinkCompra: "https://example.com" },
    { id: "SSD-004", Categoria: "SSD", Produto: "Crucial MX4 2TB SATA", Preco: 699.00, LinkCompra: "https://example.com" },
    { id: "SSD-005", Categoria: "SSD", Produto: "Samsung 980 PRO 2TB NVMe", Preco: 1199.00, LinkCompra: "https://example.com" },

    // Fonte
    { id: "PSU-001", Categoria: "Fonte", Produto: "Corsair CV550 550W 80+ Bronze", Preco: 299.00, LinkCompra: "https://example.com" },
    { id: "PSU-002", Categoria: "Fonte", Produto: "EVGA BR 600W 80+ Bronze", Preco: 359.00, LinkCompra: "https://example.com" },
    { id: "PSU-003", Categoria: "Fonte", Produto: "Seasonic Focus GX-650 650W 80+ Gold", Preco: 599.00, LinkCompra: "https://example.com" },
    { id: "PSU-004", Categoria: "Fonte", Produto: "Corsair RM750x 750W 80+ Gold", Preco: 799.00, LinkCompra: "https://example.com" },
    { id: "PSU-005", Categoria: "Fonte", Produto: "EVGA SuperNOVA 850W 80+ Platinum", Preco: 1099.00, LinkCompra: "https://example.com" },

    // Gabinete
    { id: "CASE-001", Categoria: "Gabinete", Produto: "Rise Mode Galaxy Glass", Preco: 199.00, LinkCompra: "https://example.com" },
    { id: "CASE-002", Categoria: "Gabinete", Produto: "Cooler Master MasterBox Q300L", Preco: 299.00, LinkCompra: "https://example.com" },
    { id: "CASE-003", Categoria: "Gabinete", Produto: "NZXT H510", Preco: 499.00, LinkCompra: "https://example.com" },
    { id: "CASE-004", Categoria: "Gabinete", Produto: "Lian Li PC-O11 Dynamic", Preco: 799.00, LinkCompra: "https://example.com" },
    { id: "CASE-005", Categoria: "Gabinete", Produto: "Fractal Design Define 7", Preco: 999.00, LinkCompra: "https://example.com" },

    // Cooler CPU
    { id: "COOLER-001", Categoria: "Cooler CPU", Produto: "Cooler Master Hyper 212", Preco: 119.00, LinkCompra: "https://example.com" },
    { id: "COOLER-002", Categoria: "Cooler CPU", Produto: "Noctua NH-U12S", Preco: 399.00, LinkCompra: "https://example.com" },
    { id: "COOLER-003", Categoria: "Cooler CPU", Produto: "Corsair H100i RGB", Preco: 599.00, LinkCompra: "https://example.com" },
    { id: "COOLER-004", Categoria: "Cooler CPU", Produto: "NZXT Kraken X63", Preco: 899.00, LinkCompra: "https://example.com" },
    { id: "COOLER-005", Categoria: "Cooler CPU", Produto: "be quiet! Dark Rock Pro 4", Preco: 499.00, LinkCompra: "https://example.com" },
];

/**
 * Lista de marcas conhecidas para inferir a marca a partir do nome do produto.
 * @private
 */
const knownBrands = [
    "Kingston", "Corsair", "XPG", "Gigabyte", "ASUS", "MSI", "ASRock",
    "WD", "Western Digital", "Seagate", "XFX", "Sapphire", "Galax",
    "Palit", "PCYes", "PowerColor", "Rise Mode", "Noctua", "Deepcool",
    "Lian Li", "NZXT", "Cooler Master", "Aerocool", "Fortrek", "Redragon",
    "EVGA", "Zotac", "Inno3D", "Hikvision", "Lexar", "Crucial", "ADATA",
    "Patriot", "Intel", "AMD", "Dell", "Toshiba", "Samsung", "PNY",
    "G.Skill", "Seasonic", "Fractal Design", "be quiet!"
];

/**
 * Variável para armazenar os componentes processados em cache na memória.
 * @type {Componente[] | null}
 * @private
 */
let componentCache: Componente[] | null = null;

/**
 * Busca a lista de todos os componentes de hardware disponíveis.
 * Processa os dados estáticos, inferindo a marca de cada produto.
 * @returns {Promise<Componente[]>} Uma promessa que resolve para um array de objetos `Componente`.
 * @example
 * ```ts
 * const components = await getComponents();
 * console.log(`Foram encontrados ${components.length} componentes.`);
 * ```
 */
export const getComponents = async (): Promise<Componente[]> => {
    // Se já processamos os dados, retorna do cache
    if (componentCache) {
        return componentCache;
    }

    // Processa os dados, inferindo a marca de cada produto
    const components: Componente[] = COMPONENTS_DATA.map((item) => {
        const produto = item.Produto || '';
        const brand = knownBrands.find(b => produto.toLowerCase().includes(b.toLowerCase()));

        return {
            ...item,
            brand: brand,
        };
    });

    componentCache = components;
    console.log(`Carregados ${componentCache.length} componentes dos dados locais.`);
    return componentCache;
};

/**
 * Limpa o cache de componentes.
 * Útil para testes ou para forçar um reload dos dados.
 */
export const clearComponentsCache = (): void => {
    componentCache = null;
};
