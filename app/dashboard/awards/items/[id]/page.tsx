import { getItems } from "../../../../../action/getItems";
import { getQuestById } from "../../../../../action/getQuest";
import AwardsItemsClientId from "./AwardsItemsClientId";

interface AwardsItemsPageIdProps {
  params: {
    id: string;
  };
}

export default async function AwardsItemsPageId({
  params,
}: AwardsItemsPageIdProps) {
  const { id } = await params;
  const quest = await getQuestById(id);
  const items = await getItems();
  return <AwardsItemsClientId quest={quest} items={items} />;
}
