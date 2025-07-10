// Importa os tipos necessários.
import { CityWeatherData } from '../types';

// URL da API de arquivo histórico do Open-Meteo.
const OPEN_METEO_ARCHIVE_API_URL = 'https://archive-api.open-meteo.com/v1/archive';

// Interface para a estrutura da resposta da API Open-Meteo.
interface OpenMeteoArchiveResponse {
  latitude: number;
  longitude: number;
  daily: {
    time: string[]; // Array de datas no formato "YYYY-MM-DD".
    temperature_2m_max: (number | null)[];
    temperature_2m_min: (number | null)[];
    temperature_2m_mean: (number | null)[];
  };
}

/**
 * Gera o intervalo de datas para o último ano a partir da data atual.
 * @returns Um objeto com as datas de início e fim no formato "YYYY-MM-DD".
 */
const getPastYearDateRange = (): { startDate: string; endDate: string } => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setFullYear(startDate.getFullYear() - 1);

    // Função auxiliar para formatar a data.
    const formatDate = (date: Date) => date.toISOString().split('T')[0];

    return {
        startDate: formatDate(startDate),
        endDate: formatDate(endDate),
    };
};

/**
 * Busca os dados climáticos históricos de uma cidade com base em suas coordenadas.
 * Utiliza a API Open-Meteo para obter as temperaturas média, máxima e mínima do último ano.
 * @param latitude A latitude da cidade.
 * @param longitude A longitude da cidade.
 * @returns Um objeto CityWeatherData ou nulo em caso de erro.
 */
export const getCityWeather = async (latitude: string, longitude: string): Promise<CityWeatherData | null> => {
  const { startDate, endDate } = getPastYearDateRange();
  
  // Monta os parâmetros da query para a API.
  const queryParams = new URLSearchParams({
    latitude: latitude,
    longitude: longitude,
    start_date: startDate,
    end_date: endDate,
    daily: 'temperature_2m_max,temperature_2m_min,temperature_2m_mean',
    timezone: 'auto',
  });

  try {
    const response = await fetch(`${OPEN_METEO_ARCHIVE_API_URL}?${queryParams.toString()}`);
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Falha ao buscar dados da Open-Meteo Archive API:', response.status, errorData?.reason || response.statusText);
      return null;
    }

    const data: OpenMeteoArchiveResponse = await response.json();

    // Validação básica da resposta.
    if (!data.daily || !data.daily.time || data.daily.time.length === 0) {
      console.error('Resposta da Open-Meteo Archive API incompleta:', data);
      return null;
    }
    
    // Filtra valores nulos que a API pode retornar.
    const validMeans = data.daily.temperature_2m_mean.filter((t): t is number => t !== null);
    const validMaxs = data.daily.temperature_2m_max.filter((t): t is number => t !== null);
    const validMins = data.daily.temperature_2m_min.filter((t): t is number => t !== null);

    if (validMeans.length === 0 || validMaxs.length === 0 || validMins.length === 0) {
        console.error('Dados de temperatura anuais insuficientes.');
        return null;
    }
    
    // Calcula as médias e os extremos.
    const avgTemp = validMeans.reduce((sum, temp) => sum + temp, 0) / validMeans.length;
    const maxTemp = Math.max(...validMaxs);
    const minTemp = Math.min(...validMins);

    // Retorna os dados formatados e arredondados.
    return {
      avgTemp: Math.round(avgTemp),
      maxTemp: Math.round(maxTemp),
      minTemp: Math.round(minTemp),
    };

  } catch (error) {
    console.error('Erro ao conectar com a API Open-Meteo:', error);
    return null;
  }
};
