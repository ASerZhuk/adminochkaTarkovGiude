"use client";

import { useRouter } from "next/navigation";
import { IMaps } from "../../../types/mapsTypes";
import { Button, Table } from "@mantine/core";

interface LayersClientProps {
  mapsData: IMaps[] | [];
}

export default function LayersClient({ mapsData }: LayersClientProps) {
  const router = useRouter();

  const rows = mapsData.flatMap((map) =>
    (map.layers || []).map((layer) => {
      const href = `/dashboard/layers/${layer.id}`;
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
      <div className="flex justify-end">
        <Button onClick={() => router.push("/dashboard/layers/add_layer")}>
          Добавить слой
        </Button>
      </div>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Название карты</Table.Th>
            <Table.Th>Название слоя</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </div>
  );
}
