import { getIcons } from "../../../action/getIcons";
import MapIconsClient from "./MapIconsClient";

export default async function MapIconsPage() {
  const icons = await getIcons();
  return <MapIconsClient icons={icons} />;
}

// Всегда получать свежий список иконок без кеша
export const dynamic = "force-dynamic";
export const revalidate = 0;
