// services/geoService.ts

// Define a estrutura dos dados retornados pela API GeoJS.
export interface GeoLocation {
  ip: string;
  city: string;
  region: string;
  country: string;
  country_code3: string;
  latitude: string; // A API retorna coordenadas como strings.
  longitude: string;
  timezone: string;
  organization_name?: string;
  asn?: string;
  organization?: string;
  continent_code?: string;
  accuracy?: number;
}

/**
 * Obtém a geolocalização do usuário com base em seu endereço IP.
 * Utiliza a API pública e gratuita GeoJS.
 * @returns Um objeto GeoLocation com os dados do usuário ou nulo em caso de erro.
 */
export const getUserLocation = async (): Promise<GeoLocation | null> => {
  try {
    // GeoJS infere a localização com base no IP que faz a requisição, sem necessidade de chave de API.
    const response = await fetch('https://get.geojs.io/v1/ip/geo.json');
    
    // Verifica se a requisição foi bem-sucedida.
    if (!response.ok) {
      console.error('GeoJS API request failed:', response.status, response.statusText);
      return null;
    }
    
    // Analisa a resposta JSON e a tipa como GeoLocation.
    const data: GeoLocation = await response.json();
    return data;
  } catch (error) {
    // Captura erros de rede ou outros problemas durante a requisição.
    console.error('Error fetching user location from GeoJS:', error);
    return null;
  }
};
