import axios from 'axios';
import { ILayers } from '../types/mapsTypes';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function getLayers(): Promise<ILayers[] | []> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/maps/layers`, {

    });

    return response.data.layers;
  } catch (error) {
    console.error('Ошибка при получении всех карт:', error);
    return []
  }
}


export async function getLayersByMapId(id: string): Promise<ILayers | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/maps/id/${id}/layers`, {

    });

    return response.data;
  } catch (error) {
    console.error('Ошибка при получении всех карт:', error);
    return null
  }
}

export async function getLayerById(id: string): Promise<ILayers | null> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/maps/layers/${id}`, {})
    return response.data
  } catch (error) {
    console.error('Ошибка при получении слоя:', error)
    return null
  }
}
