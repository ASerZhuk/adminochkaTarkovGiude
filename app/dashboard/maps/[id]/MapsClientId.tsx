"use client";

import {
  Button,
  Divider,
  Group,
  Input,
  NumberInput,
  Paper,
  Title,
} from "@mantine/core";
import { IMaps } from "../../../../types/mapsTypes";
import { useForm } from "@mantine/form";
import { useRouter } from "next/navigation";
import { useMemo } from "react";
import axios from "axios";
import { notifications } from "@mantine/notifications";

interface MapsClientIdProps {
  map: IMaps | null;
}

export default function MapsClientId({ map }: MapsClientIdProps) {
  const router = useRouter();
  const form = useForm({
    initialValues: {
      name: map?.name ?? "",
      seo_link: map?.seo_link ?? "",
      pmc_range: map?.pmc_range ?? "",
      raid_time: (map?.raid_time as number | undefined) ?? undefined,
      img: map?.img ?? "",
    },
  });
  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, ""),
    []
  );
  const imgPreviewUrl = useMemo(() => {
    const raw = form.values.img || "";
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    if (!apiBase) return raw.replace(/^\/+/, "/");
    return `${apiBase}/${raw.replace(/^\/+/, "")}`;
  }, [form.values.img, apiBase]);
  const slugify = (s: string) =>
    (s || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9\-_.~А-Яа-яЁё]/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");

  const handleSave = async () => {
    if (!map) return;
    const name = form.values.name.trim();
    if (!name) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: "Введите название карты",
      });
      return;
    }
    const seoLink = (form.values.seo_link || "").trim() || slugify(name);
    if (seoLink !== form.values.seo_link)
      form.setFieldValue("seo_link", seoLink);

    try {
      const imgValueRaw = (form.values.img || "").trim();
      const payload: any = {
        id: map.id,
        name,
        seo_link: seoLink,
        pmc_range: (form.values.pmc_range || "").trim(),
        raid_time:
          typeof form.values.raid_time === "number"
            ? form.values.raid_time
            : undefined,
        ...(imgValueRaw === "" ? { img: null } : { img: imgValueRaw }),
      };
      await axios.put(`/api/maps/${map.id}`, payload);
      notifications.show({
        color: "green",
        title: "Сохранено",
        message: "Карта обновлена",
      });
      router.push("/dashboard/maps");
      router.refresh();
    } catch (e: any) {
      const data = e?.response?.data;
      const detail = data?.detail;
      let message = "Ошибка сохранения";
      if (typeof detail === "string") message = detail;
      else if (Array.isArray(detail))
        message = detail
          .map((d: any) =>
            typeof d === "string" ? d : d?.msg || JSON.stringify(d)
          )
          .join("; ");
      else if (typeof data === "string") message = data;
      else if (e?.message) message = String(e.message);
      notifications.show({ color: "red", title: "Ошибка", message });
    }
  };
  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="lg:col-span-2">
        <Group justify="space-between" align="center">
          <div>
            <Title order={3}>Редактирование карты: {map?.name}</Title>
          </div>
        </Group>
        <Divider my="sm" />
      </div>

      <Paper withBorder p="md" radius="md" className="lg:col-span-1">
        <Input.Wrapper
          label="Название карты"
          withAsterisk
          size="md"
          className="mb-8">
          <Input
            placeholder="Введите название карты"
            value={form.values.name}
            onChange={(e) => {
              const v = e.currentTarget.value;
              form.setFieldValue("name", v);
            }}
          />
        </Input.Wrapper>
        <Input.Wrapper
          label="Название карты для seo"
          withAsterisk
          size="md"
          className="mb-8">
          <Input
            placeholder="Введите название карты для seo"
            value={form.values.seo_link}
            onChange={(e) => {
              const v = e.currentTarget.value;
              form.setFieldValue("seo_link", v);
            }}
          />
        </Input.Wrapper>
        <Input.Wrapper label="Диапазон ПМЦ" size="md" className="mb-8">
          <Input
            placeholder="Например: 10-13"
            value={form.values.pmc_range}
            onChange={(e) =>
              form.setFieldValue("pmc_range", e.currentTarget.value)
            }
          />
        </Input.Wrapper>
        <NumberInput
          value={form.values.raid_time}
          size="md"
          label="Время рейда (мин)"
          placeholder="Введите время рейда"
          onChange={(val: any) => {
            const n = typeof val === "number" ? val : Number(val);
            form.setFieldValue("raid_time", Number.isNaN(n) ? undefined : n);
          }}
          className="mb-8"
        />

        <Button size="md" onClick={handleSave}>
          Сохранить
        </Button>
      </Paper>
    </section>
  );
}
