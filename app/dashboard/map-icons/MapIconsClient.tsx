"use client";

import { useRouter } from "next/navigation";
import { IMapIcons } from "../../../types/mapsIconTypes";
import { Button, Table } from "@mantine/core";

interface MapIconsClientProps {
  icons: IMapIcons[] | [];
}

export default function MapIconsClient({ icons }: MapIconsClientProps) {
  const router = useRouter();
  const rows = icons.map((icon) => {
    const href = `/dashboard/map-icons/${icon.id}`;
    const onRowClick = () => router.push(href);
    const onRowKeyDown = (e: React.KeyboardEvent<HTMLTableRowElement>) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        router.push(href);
      }
    };
    return (
      <Table.Tr
        key={icon.id}
        onClick={onRowClick}
        onKeyDown={onRowKeyDown}
        role="link"
        tabIndex={0}
        style={{ cursor: "pointer" }}
        data-href={href}>
        <Table.Td>{icon.id}</Table.Td>
        <Table.Td>{icon.key}</Table.Td>
        <Table.Td>{icon.sprite_url}</Table.Td>
      </Table.Tr>
    );
  });

  return (
    <div className="grid gap-4">
      <div className="flex justify-end">
        <Button onClick={() => router.push("/dashboard/map-icons/add")}>
          Добавить иконку
        </Button>
      </div>
      <Table striped highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>ID</Table.Th>
            <Table.Th>Название иконки</Table.Th>
            <Table.Th>Ссылка на иконку</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </div>
  );
}
