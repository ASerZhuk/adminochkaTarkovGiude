import axios from 'axios';
import { ITrader } from '../types/traderTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getTraders(page: number = 1, size: number = 100): Promise<ITrader[] | []> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/traders/`, {
      params: {
        page,
        size
      }
    });

    return response.data.traders;
  } catch (error) {
    console.error('Ошибка при получении всех торговцев:', error);
    return [];
  }
}