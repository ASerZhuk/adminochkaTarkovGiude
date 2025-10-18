import axios from "axios";
import { IQuest } from "../types/questTypes";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";


export async function getQuests(): Promise<IQuest[] | []> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/quests`, {
      params: { all: true },
    });
    return response.data.quests;
  } catch (error) {
    console.error(`Ошибка при получении квестов:`, error);
    return []
  }

}


export async function getQuestById(questId: string): Promise<IQuest | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/quests/id/${questId}`);
    return response.data;
  } catch (error) {
    console.error(`Ошибка при получении квеста с id ${questId}:`, error);
    return null;
  }
}