import { getMapById } from "../../../../action/getMaps";
import MapsClientId from "./MapsClientId";

interface MapsPageIdProps {
  params: {
    id: string;
  };
}

export default async function MapsPageId({ params }: MapsPageIdProps) {
  const { id } = await params;
  const map = await getMapById(id);
  return <MapsClientId map={map} />;
}
