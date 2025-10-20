import { getQuestById } from "../../../../../action/getQuest";
import AwardsRawClientId from "./AwardsRawClientId";

interface AwardsRawPageIdProps {
  params: {
    id: string;
  };
}

export default async function AwardsRawPageId({
  params,
}: AwardsRawPageIdProps) {
  const { id } = await params;
  const quest = await getQuestById(id);
  return <AwardsRawClientId quest={quest} />;
}
