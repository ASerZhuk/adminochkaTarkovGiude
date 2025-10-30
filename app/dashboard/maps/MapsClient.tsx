"use client";

import { useRouter } from "next/navigation";
import { IMaps } from "../../../types/mapsTypes";
import { Table } from "@mantine/core";

interface MapsClientProps {
  mapsData: IMaps[] | [];
}

export default function MapsClient({ mapsData }: MapsClientProps) {
  const router = useRouter();
  const rows = mapsData.map((map) => {
    const href = `/dashboard/maps/${map.id}`;
    const onRowClick = () => router.push(href);
    const onRowKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        router.push(href);
      }
    };
    return (
      <Table.Tr
        key={map.id}
        onClick={onRowClick}
        onKeyDown={onRowKeyDown}
        role="link"
        tabIndex={0}
        style={{ cursor: "pointer" }}
        data-href={href}>
        <Table.Td>{map.id}</Table.Td>
        <Table.Td>{map.name}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <div className="grid gap-4">
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Название квеста</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </div>
  );
}
