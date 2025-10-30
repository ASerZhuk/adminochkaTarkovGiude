"use client";

import { Input, Table } from "@mantine/core";
import { IQuest } from "../../../types/questTypes";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

interface QuestsClientProps {
  quests: IQuest[] | [];
}

export default function QuestsClient({ quests }: QuestsClientProps) {
  const router = useRouter();
  const [qFilter, setQFilter] = useState("");
  const filtered = useMemo(
    () =>
      (quests ?? []).filter((q) =>
        q.name.toLowerCase().includes(qFilter.toLowerCase())
      ),
    [quests, qFilter]
  );

  const rows = filtered.map((quest) => {
    const href = `/dashboard/quests/${quest.id}`;
    const onRowClick = () => router.push(href);
    const onRowKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        router.push(href);
      }
    };

    return (
      <Table.Tr
        key={quest.id}
        onClick={onRowClick}
        onKeyDown={onRowKeyDown}
        role="link"
        tabIndex={0}
        style={{ cursor: "pointer" }}
        data-href={href}>
        <Table.Td>{quest.id}</Table.Td>
        <Table.Td>{quest.name}</Table.Td>
        <Table.Td>{quest.seo_link}</Table.Td>
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
            <Table.Th>ID</Table.Th>
            <Table.Th>Название квеста</Table.Th>
            <Table.Th>SEO</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </div>
  );
}
