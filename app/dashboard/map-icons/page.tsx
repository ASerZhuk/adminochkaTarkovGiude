import { getIcons } from "../../../action/getIcons";
import MapIconsClient from "./MapIconsClient";

export default async function MapIconsPage() {
  const icons = await getIcons();
  return <MapIconsClient icons={icons} />;
}
