import { getLayerById } from "../../../../action/getLayers";
import { getIcons } from "../../../../action/getIcons";
import { getLayerMarkers } from "../../../../action/getLayerMarkers";
import MarkersLayerClient from "./MarkersLayerClient";

export default async function MarkersLayerPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [layer, icons] = await Promise.all([
    getLayerById(id),
    getIcons(),
  ]);
  const markers = layer ? await getLayerMarkers(id, { all: true }) : [];
  return <MarkersLayerClient layer={layer} icons={icons} markers={markers} />;
}

export const dynamic = "force-dynamic";
export const revalidate = 0;
