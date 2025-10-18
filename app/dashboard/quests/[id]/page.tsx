import { getMaps } from "../../../../action/getMaps";
import { getQuestById, getQuests } from "../../../../action/getQuest";
import { getTraders } from "../../../../action/getTraders";
import QuestClientId from "./QuestClientId";

interface QuestPageIdProps {
  params: {
    id: string;
  };
}

export default async function QuestPageId({ params }: QuestPageIdProps) {
  const { id } = await params;
  const quest = await getQuestById(id);
  const traders = await getTraders();
  const quests = await getQuests();
  const maps = await getMaps();

  return (
    <QuestClientId
      quest={quest}
      traders={traders}
      quests={quests}
      maps={maps}
    />
  );
}
