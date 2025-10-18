import axios from 'axios';
import { ITrader } from '../types/traderTypes';
import { IMaps } from '../types/mapsTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getMaps(page: number = 1, size: number = 100): Promise<IMaps[] | []> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/maps/`, {
      params: {
        page,
        size
      }
    });

    return response.data.maps;
  } catch (error) {
    console.error('Ошибка при получении всех карт:', error);
    return [];
  }
}