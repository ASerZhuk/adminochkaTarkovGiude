import axios from 'axios';
import { IGoals } from '../types/goalsTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getGoals(quest_id: string): Promise<IGoals[] | []> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/quests/${quest_id}/goals`, {

    });

    return response.data;
  } catch (error) {
    console.error('Ошибка при получении задания:', error);
    return [];
  }
}