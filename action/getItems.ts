import axios from 'axios';
import { IItem } from '../types/itemTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Получить предмет по его bsg_id
export async function getItemByBsg(bsg_id: string): Promise<IItem | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/items/bsg/${bsg_id}`);
    const data: any = response.data;
    if (data && typeof data === 'object') {
      if (data?.bsg_id && data?.name) return data as IItem;
      if (data?.item && data.item?.bsg_id) return data.item as IItem;
      if (data?.data && data.data?.bsg_id) return data.data as IItem;
    }
    return null;
  } catch (error) {
    console.error('Ошибка при получении предмета:', error);
    return null;
  }
}

export async function getItems(): Promise<IItem[] | []> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/items`, {
      params: { all: true },
    });
    const data: any = response.data;
    if (Array.isArray(data)) return data as IItem[];
    if (Array.isArray(data?.items)) return data.items as IItem[];
    if (Array.isArray(data?.data)) return data.data as IItem[];
    if (Array.isArray(data?.quests)) return data.quests as IItem[]; // fallback
    return [];
  } catch (error) {
    console.error(`Ошибка при получении предметов:`, error);
    return []
  }
}
