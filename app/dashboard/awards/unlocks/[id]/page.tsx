import { getItems } from "../../../../../action/getItems";
import { getQuestById } from "../../../../../action/getQuest";
import { getTraders } from "../../../../../action/getTraders";
import AwardsUnlocksClientId from "./AwardsUnlocksClientId";

interface AwardsUnlocksPageIdProps {
  params: {
    id: string;
  };
}

export default async function AwardsUnlocksPageId({
  params,
}: AwardsUnlocksPageIdProps) {
  const { id } = await params;
  const quest = await getQuestById(id);
  const items = await getItems();
  const traders = await getTraders();
  return (
    <AwardsUnlocksClientId quest={quest} items={items} traders={traders} />
  );
}
