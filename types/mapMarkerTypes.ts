export interface IMapMarker {
  id: number;
  map_id: number;
  layer_id: number;
  icon_id: number;
  title: string;
  description: string;
  x: number; // pixels in layer coordinate space
  y: number; // pixels in layer coordinate space
  rotation: number;
  visible: boolean;
  meta: string | null;
}

