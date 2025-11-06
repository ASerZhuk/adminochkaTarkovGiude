"use client";

import { useRouter } from "next/navigation";
import { IMaps } from "../../../types/mapsTypes";
import { Table } from "@mantine/core";

interface MarkersClientProps {
  mapsData: IMaps[] | [];
}

export default function MarkersClient({ mapsData }: MarkersClientProps) {
  const router = useRouter();
  const rows = (mapsData || []).flatMap((map) =>
    (map.layers || []).map((layer) => {
      const href = `/dashboard/markers/${layer.id}`;
      const onRowClick = () => router.push(href);
      const onRowKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          router.push(href);
        }
      };
      return (
        <Table.Tr
          key={`${map.id}-${layer.id}`}
          onClick={onRowClick}
          onKeyDown={onRowKeyDown}
          role="link"
          tabIndex={0}
          style={{ cursor: "pointer" }}
          data-href={href}>
          <Table.Td>{layer.id}</Table.Td>
          <Table.Td>{map.name}</Table.Td>
          <Table.Td>{layer.name}</Table.Td>
        </Table.Tr>
      );
    })
  );

  return (
    <div className="grid gap-4">
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Layer ID</Table.Th>
            <Table.Th>Карта</Table.Th>
            <Table.Th>Слой</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </div>
  );
}
