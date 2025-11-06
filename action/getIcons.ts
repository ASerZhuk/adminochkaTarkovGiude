import axios from 'axios';
import { IMapIcons } from '../types/mapsIconTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getIcons(): Promise<IMapIcons[] | []> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/map-icons`, {

    });

    return response.data.icons;
  } catch (error) {
    console.error('Ошибка при получении всех иконок:', error);
    return []
  }
}