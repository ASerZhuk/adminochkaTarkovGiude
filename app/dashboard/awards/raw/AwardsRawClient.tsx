"use client";

import { Input, Table } from "@mantine/core";
import { useMemo, useState } from "react";
import type { IQuest } from "../../../../types/questTypes";

interface AwardsRawClientProps {
  quests: IQuest[];
}

export default function AwardsRawClient({ quests }: AwardsRawClientProps) {
  const [qFilter, setQFilter] = useState("");
  const filtered = useMemo(
    () => (quests ?? []).filter((q) => q.name.toLowerCase().includes(qFilter.toLowerCase())),
    [quests, qFilter]
  );

  const rows = filtered.map((q) => {
    const rewardStrings: string[] = q?.award_raw?.data?.reward_strings ?? [];
    const text = rewardStrings.length > 0 ? rewardStrings.join("\n") : "-";
    return (
      <Table.Tr key={`q-${q.id}`}>
        <Table.Td>{q.id}</Table.Td>
        <Table.Td>{q.name}</Table.Td>
        <Table.Td style={{ whiteSpace: "pre-wrap" }}>{text}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <div className="grid gap-4">
      <Input
        placeholder="Поиск по названию квеста"
        value={qFilter}
        onChange={(e) => setQFilter(e.currentTarget.value)}
      />
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID квеста</Table.Th>
            <Table.Th>Название квеста</Table.Th>
            <Table.Th>Reward Strings</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </div>
  );
}
