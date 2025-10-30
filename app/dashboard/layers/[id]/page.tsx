import LayersClientId from "./LayersClientId";
import { getLayerById } from "../../../../action/getLayers";
import { getMaps } from "../../../../action/getMaps";

interface LayersClientIdProps {
  params: {
    id: string;
  };
}

export default async function LayersPageId({ params }: { params: { id: string } }) {
  const { id } = params
  const [layer, maps] = await Promise.all([
    getLayerById(id),
    getMaps(),
  ])
  return <LayersClientId layer={layer} maps={maps} />;
}
