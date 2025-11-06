import axios from 'axios'
import { IMapMarker } from '../types/mapMarkerTypes'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export async function getLayerMarkers(layerId: string | number, { all = true, page = 1, size = 500 }: { all?: boolean; page?: number; size?: number } = {}): Promise<IMapMarker[] | []> {
  try {
    const response = await axios.get(`${API_BASE_URL}/api/maps/layers/${layerId}/markers`, {
      params: all ? { all: true } : { page, size },
    })
    // Assuming response shape: { markers: [...] } or array directly
    if (Array.isArray(response.data)) return response.data as IMapMarker[]
    if (Array.isArray(response.data?.markers)) return response.data.markers as IMapMarker[]
    return []
  } catch (error) {
    console.error('Ошибка при получении маркеров слоя:', error)
    return []
  }
}

