"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { IMaps, ILayers } from "../../../../types/mapsTypes";
import { useForm } from "@mantine/form";
import {
  Button,
  Divider,
  FileInput,
  Group,
  Input,
  NumberInput,
  Paper,
  Select,
  Switch,
  Title,
} from "@mantine/core";
import axios from "axios";
import { notifications } from "@mantine/notifications";

interface LayersClientIdProps {
  layer: ILayers | null;
  maps: IMaps[] | [];
}

export default function LayersClientId({ layer, maps }: LayersClientIdProps) {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm({
    initialValues: {
      map_id: layer?.map_id ?? 0,
      name: layer?.name ?? "",
      image_url: layer?.image_url ?? "",
      width_px: layer?.width_px ?? 4096,
      height_px: layer?.height_px ?? 4096,
      min_zoom: layer?.min_zoom ?? -4,
      max_zoom: layer?.max_zoom ?? 4,
      default_zoom: layer?.default_zoom ?? 2,
      order_index: layer?.order_index ?? 0,
      visible_by_default: layer?.visible_by_default ?? true,
    },
  });

  const apiBase = useMemo(
    () => (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, ""),
    []
  );
  const imgPreviewUrl = useMemo(() => {
    const raw = form.values.image_url || "";
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    if (!apiBase) return raw.replace(/^\/+/, "/");
    return `${apiBase}/${raw.replace(/^\/+/, "")}`;
  }, [form.values.image_url, apiBase]);

  const handleUpload = async () => {
    if (!file) return;
    try {
      setUploading(true);
      const fd = new FormData();
      fd.append("file", file);
      const resp = await axios.post("/api/uploads", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const data: any = resp?.data;
      let url: string | undefined;
      if (typeof data === "string") url = data;
      else if (data && typeof data === "object") {
        url =
          data.url ||
          data.link ||
          data.location ||
          data.path ||
          data.image_url ||
          data.file_url ||
          data?.result?.url ||
          data?.data?.url ||
          data?.image?.url;
      }
      if (!url) throw new Error("Не удалось получить ссылку на изображение");
      form.setFieldValue("image_url", url);
      notifications.show({ color: "green", title: "Успешно", message: "Картинка загружена" });
    } catch (e: any) {
      const message = e?.response?.data?.detail || e?.message || "Ошибка загрузки";
      notifications.show({ color: "red", title: "Ошибка", message });
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!layer) return;
    const name = form.values.name.trim();
    if (!name) {
      notifications.show({ color: "red", title: "Ошибка", message: "Введите название слоя" });
      return;
    }
    const mapId = Number(form.values.map_id);
    if (!Number.isFinite(mapId) || mapId <= 0) {
      notifications.show({ color: "red", title: "Ошибка", message: "Укажите корректный ID карты" });
      return;
    }
    const imageUrl = (form.values.image_url || "").trim();
    if (!imageUrl) {
      notifications.show({ color: "red", title: "Ошибка", message: "Загрузите или укажите ссылку на картинку" });
      return;
    }

    try {
      const payload = {
        map_id: mapId,
        name,
        image_url: imageUrl,
        width_px: Number(form.values.width_px) || 4096,
        height_px: Number(form.values.height_px) || 4096,
        min_zoom: Number(form.values.min_zoom) ?? -4,
        max_zoom: Number(form.values.max_zoom) ?? 4,
        default_zoom: Number(form.values.default_zoom) ?? 2,
        order_index: Number(form.values.order_index) || 0,
        visible_by_default: Boolean(form.values.visible_by_default),
      };
      await axios.put(`/api/maps/layers/${layer.id}`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      notifications.show({ color: "green", title: "Сохранено", message: "Слой обновлён" });
      router.push(`/dashboard/layers`);
      router.refresh();
    } catch (e: any) {
      const message = e?.response?.data?.detail || e?.message || "Ошибка сохранения";
      notifications.show({ color: "red", title: "Ошибка", message });
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="lg:col-span-2">
        <Group justify="space-between" align="center">
          <div>
            <Title order={3}>Редактирование слоя: {layer?.name}</Title>
          </div>
        </Group>
        <Divider my="sm" />
      </div>

      <Paper withBorder p="md" radius="md" className="lg:col-span-1">
        <Select
          label="Карта"
          placeholder="Выберите карту"
          data={(maps || []).map((m) => ({ value: String(m.id), label: `${m.id} — ${m.name}` }))}
          value={form.values.map_id ? String(form.values.map_id) : null}
          onChange={(v) => form.setFieldValue("map_id", v ? Number(v) : 0)}
          searchable
          nothingFoundMessage="Нет данных"
          size="md"
          className="mb-4"
        />

        <Input.Wrapper label="Название слоя" withAsterisk size="md" className="mb-4">
          <Input
            placeholder="Введите название слоя"
            value={form.values.name}
            onChange={(e) => form.setFieldValue("name", e.currentTarget.value)}
          />
        </Input.Wrapper>

        <Input.Wrapper label="Ссылка на картинку" withAsterisk size="md" className="mb-2">
          <Input
            placeholder="Загрузите файл или вставьте ссылку"
            value={form.values.image_url}
            onChange={(e) => form.setFieldValue("image_url", e.currentTarget.value)}
          />
        </Input.Wrapper>

        <Group align="end" gap="sm" className="mb-6">
          <FileInput
            label="Загрузка картинки"
            placeholder="Выберите файл"
            accept="image/*"
            value={file}
            onChange={setFile}
            className="grow"
          />
          <Button variant="light" onClick={handleUpload} disabled={!file} loading={uploading}>
            Загрузить
          </Button>
        </Group>

        <Group grow>
          <NumberInput
            label="Ширина (px)"
            value={form.values.width_px}
            onChange={(v: any) => form.setFieldValue("width_px", Number(v) || 4096)}
            size="md"
          />
          <NumberInput
            label="Высота (px)"
            value={form.values.height_px}
            onChange={(v: any) => form.setFieldValue("height_px", Number(v) || 4096)}
            size="md"
          />
        </Group>

        <Group grow className="mt-4">
          <NumberInput
            label="Min zoom"
            value={form.values.min_zoom}
            onChange={(v: any) => form.setFieldValue("min_zoom", Number(v))}
            size="md"
          />
          <NumberInput
            label="Max zoom"
            value={form.values.max_zoom}
            onChange={(v: any) => form.setFieldValue("max_zoom", Number(v))}
            size="md"
          />
          <NumberInput
            label="Default zoom"
            value={form.values.default_zoom}
            onChange={(v: any) => form.setFieldValue("default_zoom", Number(v))}
            size="md"
          />
        </Group>

        <Group align="center" className="mt-4">
          <NumberInput
            label="Порядок"
            value={form.values.order_index}
            onChange={(v: any) => form.setFieldValue("order_index", Number(v) || 0)}
            size="md"
            className="grow"
          />
          <Switch
            label="Виден по умолчанию"
            checked={form.values.visible_by_default}
            onChange={(e) => form.setFieldValue("visible_by_default", e.currentTarget.checked)}
          />
        </Group>

        <Button size="md" className="mt-6" onClick={handleSave}>
          Сохранить
        </Button>
      </Paper>

      <Paper withBorder p="md" radius="md" className="lg:col-span-1">
        <Title order={5} className="mb-3">
          Превью картинки
        </Title>
        {imgPreviewUrl ? (
          <div className="space-y-2">
            <a
              href={imgPreviewUrl}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 hover:underline break-words">
              {imgPreviewUrl}
            </a>
            <div className="border rounded p-2 bg-white">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgPreviewUrl}
                alt="Превью слоя"
                className="w-full max-h-[480px] object-contain"
              />
            </div>
          </div>
        ) : (
          <div className="text-sm text-gray-500">Картинка не задана</div>
        )}
      </Paper>
    </section>
  );
}
