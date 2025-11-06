"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Button,
  Divider,
  FileInput,
  Group,
  Input,
  NumberInput,
  Paper,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import axios from "axios";
import { notifications } from "@mantine/notifications";

export default function MapIconAdd() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm({
    initialValues: {
      key: "",
      sprite_url: "",
      size_w: 64,
      size_h: 64,
    },
  });

  const apiImgBase = useMemo(
    () => (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/+$/, ""),
    []
  );

  function buildPreviewUrl(raw: string) {
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith("/")) return `${apiImgBase}${raw}`;
    return `${apiImgBase}/${raw}`;
  }

  const imgPreviewUrl = useMemo(() => {
    return buildPreviewUrl(form.values.sprite_url || "");
  }, [form.values.sprite_url, apiImgBase]);

  const loadImageSize = (src: string) =>
    new Promise<{ w: number; h: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () =>
        resolve({
          w: (img as any).naturalWidth || (img as any).width || 0,
          h: (img as any).naturalHeight || (img as any).height || 0,
        });
      img.onerror = () => reject(new Error("Не удалось получить размеры изображения"));
      img.src = src;
    });

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
      form.setFieldValue("sprite_url", url);
      // Try to determine dimensions from the uploaded image URL
      try {
        const abs = buildPreviewUrl(url);
        const { w, h } = await loadImageSize(abs);
        if (w && h) {
          form.setFieldValue("size_w", w);
          form.setFieldValue("size_h", h);
        }
      } catch {}
      notifications.show({
        color: "green",
        title: "Успешно",
        message: "Картинка загружена",
      });
    } catch (e: any) {
      const message =
        e?.response?.data?.detail || e?.message || "Ошибка загрузки";
      notifications.show({ color: "red", title: "Ошибка", message });
    } finally {
      setUploading(false);
    }
  };

  // When user selects a file (before upload), try to read its natural size
  const handleFileChange = async (f: File | null) => {
    setFile(f);
    if (!f) return;
    try {
      const objectUrl = URL.createObjectURL(f);
      try {
        const { w, h } = await loadImageSize(objectUrl);
        if (w && h) {
          form.setFieldValue("size_w", w);
          form.setFieldValue("size_h", h);
        }
      } finally {
        URL.revokeObjectURL(objectUrl);
      }
    } catch {}
  };

  const handleSave = async () => {
    const key = form.values.key.trim();
    if (!key) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: "Введите ключ (название) иконки",
      });
      return;
    }
    const spriteUrl = (form.values.sprite_url || "").trim();
    if (!spriteUrl) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: "Загрузите или укажите ссылку на картинку",
      });
      return;
    }

    try {
      const payload = {
        key,
        sprite_url: spriteUrl,
        size_w: Number(form.values.size_w) || 64,
        size_h: Number(form.values.size_h) || 64,
      };
      const resp = await axios.post(`/api/map-icons/create`, payload, {
        headers: { "Content-Type": "application/json" },
      });
      if (resp.status >= 200 && resp.status < 300) {
        notifications.show({
          color: "green",
          title: "Успешно",
          message: "Иконка создана",
        });
        router.push(`/dashboard/map-icons`);
        router.refresh();
      } else {
        const detail = resp?.data?.detail || "Не удалось создать иконку";
        throw new Error(detail);
      }
    } catch (e: any) {
      const message =
        e?.response?.data?.detail || e?.message || "Ошибка создания иконки";
      notifications.show({ color: "red", title: "Ошибка", message });
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="lg:col-span-2">
        <Group justify="space-between" align="center">
          <div>
            <Title order={3}>Добавить иконку</Title>
          </div>
        </Group>
        <Divider my="sm" />
      </div>

      <Paper withBorder p="md" radius="md" className="lg:col-span-1">
        <Input.Wrapper label="Ключ (название)" withAsterisk size="md" className="mb-4">
          <Input
            placeholder="Введите ключ иконки (например, marker_12)"
            value={form.values.key}
            onChange={(e) => form.setFieldValue("key", e.currentTarget.value)}
          />
        </Input.Wrapper>

        <Input.Wrapper label="Ссылка на картинку" withAsterisk size="md" className="mb-2">
          <Input
            placeholder="Загрузите файл или вставьте ссылку"
            value={form.values.sprite_url}
            onChange={(e) =>
              form.setFieldValue("sprite_url", e.currentTarget.value)
            }
          />
        </Input.Wrapper>

        <Group align="end" gap="sm" className="mb-6">
          <FileInput
            label="Загрузка картинки"
            placeholder="Выберите файл"
            accept="image/*"
            value={file}
            onChange={handleFileChange}
            className="grow"
          />
          <Button variant="light" onClick={handleUpload} disabled={!file} loading={uploading}>
            Загрузить
          </Button>
        </Group>

        <Group grow>
          <NumberInput
            label="Ширина иконки (px)"
            value={form.values.size_w}
            onChange={(v: any) => form.setFieldValue("size_w", Number(v) || 64)}
            size="md"
            min={1}
          />
          <NumberInput
            label="Высота иконки (px)"
            value={form.values.size_h}
            onChange={(v: any) => form.setFieldValue("size_h", Number(v) || 64)}
            size="md"
            min={1}
          />
        </Group>

        <Button size="md" className="mt-6" onClick={handleSave}>
          Сохранить
        </Button>
      </Paper>

      <Paper withBorder p="md" radius="md" className="lg:col-span-1">
        <Title order={5} className="mb-3">
          Превью иконки
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
                alt="Превью иконки"
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
