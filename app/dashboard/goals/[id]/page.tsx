import { getGoals } from "../../../../action/getGoals";
import GoalsClientId from "./GoalsClientId";

interface GoalsPageIdProps {
  params: {
    id: string;
  };
}

export default async function GoalsPageId({ params }: GoalsPageIdProps) {
  const { id } = await params;
  const goals = await getGoals(id);
  return <GoalsClientId goals={goals} questId={id} />;
}
