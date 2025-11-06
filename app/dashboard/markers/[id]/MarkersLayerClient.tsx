"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ILayers } from "../../../../types/mapsTypes";
import { IMapIcons } from "../../../../types/mapsIconTypes";
import { IMapMarker } from "../../../../types/mapMarkerTypes";
import {
  Button,
  Group,
  Input,
  Paper,
  Select,
  Textarea,
  Title,
} from "@mantine/core";
import axios from "axios";
import { notifications } from "@mantine/notifications";

interface Props {
  layer: ILayers | null;
  icons: IMapIcons[] | [];
  markers: IMapMarker[] | [];
}

export default function MarkersLayerClient({ layer, icons, markers }: Props) {
  const [selectedIconId, setSelectedIconId] = useState<number | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [posPx, setPosPx] = useState<{ x: number; y: number } | null>(null);
  const [saving, setSaving] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [zoom, setZoom] = useState(1);
  const [markersState, setMarkersState] = useState<IMapMarker[]>(markers || []);
  // Перетаскивание отключено — только клик/выбор/редактирование
  const [selectedMarkerId, setSelectedMarkerId] = useState<number | null>(null);
  const [inlineSaving, setInlineSaving] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createStep, setCreateStep] = useState<"icon" | "form">("icon");

  useEffect(() => {
    setMarkersState(markers || []);
  }, [markers, layer?.id]);

  // База для картинок и спрайтов.
  // Если в env указан внешний API и это не localhost/127.0.0.1 — используем его.
  // Иначе на клиенте используем текущее origin (например, https://tarkovguide.ru).
  const apiImgBase = useMemo(() => {
    const envBase = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/+$/, "");
    const isLocal = /^(?:https?:\/\/)?(?:localhost|127\.0\.0\.1)(?::\d+)?$/i.test(envBase);
    if (typeof window !== "undefined") {
      const origin = window.location.origin.replace(/\/+$/, "");
      return envBase && !isLocal ? envBase : origin;
    }
    return envBase || "";
  }, []);
  const imageUrl = useMemo(() => {
    const raw = layer?.image_url || "";
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith("/")) return `${apiImgBase}${raw}`;
    return `${apiImgBase}/${raw}`;
  }, [layer?.image_url, apiImgBase]);

  // Используем фактический размер изображения (naturalWidth/Height),
  // чтобы координаты совпадали с фронтом; иначе берём width_px/height_px
  const [naturalSize, setNaturalSize] = useState<{
    w: number;
    h: number;
  } | null>(null);
  const baseW = naturalSize?.w || layer?.width_px || 1;
  const baseH = naturalSize?.h || layer?.height_px || 1;

  const selectedIcon = useMemo(() => {
    if (selectedIconId == null) return null;
    return (icons || []).find((i) => i.id === selectedIconId) || null;
  }, [icons, selectedIconId]);

  // Клик по карте: начинаем создание маркера в пиксельной позиции клика
  const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!imgRef.current || !layer) return;
    // Берём смещения внутри изображения в CSS-пикселях
    const offX = (e.nativeEvent as any).offsetX as number;
    const offY = (e.nativeEvent as any).offsetY as number;
    const imgW = imgRef.current.clientWidth || 1;
    const imgH = imgRef.current.clientHeight || 1;
    // Пересчёт в пиксели слоя (natural/base размеры)
    const x_px = Math.round(offX * (baseW / imgW));
    const y_px = Math.round(offY * (baseH / imgH));
    const clampedX = Math.max(0, Math.min(baseW, x_px));
    const clampedY = Math.max(0, Math.min(baseH, y_px));
    setPosPx({ x: clampedX, y: clampedY });
    // Очистить выделение и открыть пошаговое создание
    setSelectedMarkerId(null);
    setSelectedIconId(null);
    setTitle("");
    setDescription("");
    setCreateOpen(true);
    setCreateStep("icon");
  };

  // Стили предпросмотра нового маркера: центр иконки под курсором
  const markerStyle = useMemo(() => {
    if (!posPx || !selectedIcon || !layer)
      return { display: "none" } as React.CSSProperties;
    const w = selectedIcon.size_w || 0;
    const h = selectedIcon.size_h || 0;
    // переводим из координаты центра в координату левого-верхнего угла
    const leftPx = Math.max(0, Math.min(baseW - w, Math.round(posPx.x - w / 2)));
    const topPx = Math.max(0, Math.min(baseH - h, Math.round(posPx.y - h / 2)));
    const leftPct = (leftPx / baseW) * 100;
    const topPct = (topPx / baseH) * 100;
    const wPct = (w / baseW) * 100;
    const hPct = (h / baseH) * 100;
    return {
      position: "absolute" as const,
      left: `${leftPct}%`,
      top: `${topPct}%`,
      width: `${wPct}%`,
      height: `${hPct}%`,
      pointerEvents: "none" as const,
    };
  }, [posPx, selectedIcon, layer, baseW, baseH]);

  const iconOptions = useMemo(
    () =>
      (icons || []).map((i) => ({
        value: String(i.id),
        label: `${i.id} — ${i.key}`,
      })),
    [icons]
  );

  // Преобразуем относительные URL в абсолютные от API
  const resolveIconUrl = (raw: string) => {
    if (!raw) return "";
    if (/^https?:\/\//i.test(raw)) return raw;
    if (raw.startsWith("/")) return `${apiImgBase}${raw}`;
    return `${apiImgBase}/${raw}`;
  };

  // Логика перетаскивания удалена по требованию

  const handleSave = async () => {
    if (!layer) return;
    if (!posPx) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: "Выберите позицию на карте",
      });
      return;
    }
    if (!selectedIconId) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: "Выберите иконку",
      });
      return;
    }
    const t = title.trim();
    const d = description.trim();
    if (!t) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: "Введите title",
      });
      return;
    }

    // Сохраняем в пикселях слоя, но как левый-верхний угол (центр -> левый-верх)
    const iconW = selectedIcon?.size_w || 0;
    const iconH = selectedIcon?.size_h || 0;
    let x_px = Math.round(posPx.x - iconW / 2);
    let y_px = Math.round(posPx.y - iconH / 2);
    x_px = Math.max(0, Math.min(baseW - iconW, x_px));
    y_px = Math.max(0, Math.min(baseH - iconH, y_px));

    try {
      setSaving(true);
      const payload: any = {
        map_id: layer.map_id,
        layer_id: Number(layer.id) || layer.id,
        icon_id: selectedIconId,
        title: t,
        description: d,
        x: x_px,
        y: y_px,
        rotation: 0,
        visible: true,
        meta: "",
      };
      const resp = await axios.post("/api/maps/markers/create", payload, {
        headers: { "Content-Type": "application/json" },
      });
      if (resp.status >= 200 && resp.status < 300) {
        notifications.show({
          color: "green",
          title: "Успешно",
          message: "Маркер сохранён",
        });
        const data: any = resp.data || {};
        const newId = data?.id ?? data?.marker?.id ?? data?.data?.id;
        if (newId != null) {
          const newMarker: IMapMarker = {
            id: Number(newId),
            map_id: layer.map_id,
            layer_id: Number(layer.id) || (layer.id as any),
            icon_id: selectedIconId,
            title: t,
            description: d,
            x: x_px,
            y: y_px,
            rotation: 0,
            visible: true,
            meta: "",
          } as IMapMarker;
          setMarkersState((prev) => [...prev, newMarker]);
        }
        // Сбрасываем состояние UI создания
        setCreateOpen(false);
        setCreateStep("icon");
        setPosPx(null);
        setSelectedIconId(null);
        setTitle("");
        setDescription("");
      } else {
        const detail = resp?.data?.detail || "Не удалось создать маркер";
        throw new Error(detail);
      }
    } catch (e: any) {
      notifications.show({
        color: "red",
        title: "Ошибка",
        message: e?.response?.data?.detail || e?.message || "Ошибка сохранения",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-3">
        <Title order={4} className="mb-2">
          Слой: {layer?.name || layer?.id}
        </Title>
        <Group gap="xs" className="mb-2">
          <Button
            variant="light"
            onClick={() =>
              setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)))
            }>
            -
          </Button>
          <div className="text-sm w-16 text-center">
            {Math.round(zoom * 100)}%
          </div>
          <Button variant="light" onClick={() => setZoom(1)}>
            100%
          </Button>
          <Button
            variant="light"
            onClick={() => setZoom((z) => Math.min(8, +(z + 0.25).toFixed(2)))}>
            +
          </Button>
        </Group>
        <div
          className="relative border rounded bg-black/5 overflow-auto"
          style={{ width: "100%" }}>
          {imageUrl && layer ? (
            <div
              ref={containerRef}
              style={{
                position: "relative",
                width: baseW * zoom,
                height: baseH * zoom,
              }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                ref={imgRef}
                src={imageUrl}
                alt="Layer"
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "contain",
                }}
                onClick={handleImageClick}
                onLoad={() => {
                  const el = imgRef.current;
                  if (el && el.naturalWidth && el.naturalHeight) {
                    setNaturalSize({ w: el.naturalWidth, h: el.naturalHeight });
                  }
                }}
              />
              {/* Existing markers */}
              {(markersState || [])
                .filter((m) => m.visible !== false)
                .map((m) => {
                  const icon = (icons || []).find((i) => i.id === m.icon_id);
                  if (!icon) return null;
                  const leftPct = (m.x / baseW) * 100;
                  const topPct = (m.y / baseH) * 100;
                  const wPct = (icon.size_w / baseW) * 100;
                  const hPct = (icon.size_h / baseH) * 100;
                  const style: React.CSSProperties = {
                    position: "absolute",
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    width: `${wPct}%`,
                    height: `${hPct}%`,
                    pointerEvents: "auto",
                    cursor: "pointer",
                    outline:
                      selectedMarkerId === m.id
                        ? "2px solid rgba(59,130,246,0.8)"
                        : "none",
                  };
                  return (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={m.id}
                      src={resolveIconUrl(icon.sprite_url)}
                      alt={m.title}
                      style={{ ...style, userSelect: "none" }}
                      draggable={false}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedMarkerId(m.id);
                        setSelectedIconId(m.icon_id);
                        setTitle(m.title || "");
                        setDescription(m.description || "");
                        setPosPx({ x: m.x, y: m.y });
                      }}
                    />
                  );
                })}
              {/* Инлайн-редактор выбранного маркера */}
              {selectedMarkerId != null &&
                (() => {
                  const sm = markersState.find(
                    (it) => it.id === selectedMarkerId
                  );
                  if (!sm) return null;
                  const leftPct = (sm.x / baseW) * 100;
                  const topPct = (sm.y / baseH) * 100;
                  const boxStyle: React.CSSProperties = {
                    position: "absolute",
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    transform: "translate(-50%, 8px)",
                    zIndex: 10,
                  };
                  return (
                    <div style={boxStyle} onClick={(e) => e.stopPropagation()}>
                      <Paper
                        shadow="sm"
                        withBorder
                        p="sm"
                        radius="md"
                        style={{ width: 260, background: "white" }}>
                        <div className="text-xs text-gray-500 mb-2">
                          Редактирование маркера #{sm.id}
                        </div>
                        <Select
                          label="Иконка"
                          placeholder="Выберите иконку"
                          searchable
                          data={iconOptions}
                          value={
                            selectedIconId != null
                              ? String(selectedIconId)
                              : String(sm.icon_id)
                          }
                          onChange={(v) =>
                            setSelectedIconId(v ? Number(v) : null)
                          }
                          size="sm"
                        />
                        <Input.Wrapper label="Title" size="sm" withAsterisk>
                          <Input
                            size="sm"
                            value={title}
                            onChange={(e) => setTitle(e.currentTarget.value)}
                          />
                        </Input.Wrapper>
                        <Textarea
                          label="Description"
                          size="sm"
                          minRows={2}
                          className="mt-2"
                          value={description}
                          onChange={(e) =>
                            setDescription(e.currentTarget.value)
                          }
                        />
                        <Group justify="end" gap="xs" className="mt-2">
                          <Button
                            size="xs"
                            variant="subtle"
                            onClick={() => setSelectedMarkerId(null)}>
                            Отмена
                          </Button>
                          <Button
                            size="xs"
                            color="red"
                            loading={inlineSaving}
                            onClick={async () => {
                              // delete existing marker
                              const m = sm;
                              try {
                                setInlineSaving(true);
                                const resp = await axios.delete(
                                  `/api/maps/markers/${m.id}`
                                );
                                if (resp.status >= 200 && resp.status < 300) {
                                  setMarkersState((prev) =>
                                    prev.filter((it) => it.id !== m.id)
                                  );
                                  notifications.show({
                                    color: "green",
                                    title: "Готово",
                                    message: "Маркер удалён",
                                  });
                                  // Сбрасываем выделение и формы
                                  setSelectedMarkerId(null);
                                  setSelectedIconId(null);
                                  setTitle("");
                                  setDescription("");
                                  setPosPx(null);
                                  setCreateOpen(false);
                                } else {
                                  const detail =
                                    (resp as any)?.data?.detail ||
                                    "Не удалось удалить маркер";
                                  throw new Error(detail);
                                }
                              } catch (e: any) {
                                notifications.show({
                                  color: "red",
                                  title: "Ошибка",
                                  message:
                                    e?.response?.data?.detail ||
                                    e?.message ||
                                    "Ошибка удаления",
                                });
                              } finally {
                                setInlineSaving(false);
                              }
                            }}>
                            Удалить
                          </Button>
                          <Button
                            size="xs"
                            loading={inlineSaving}
                            onClick={async () => {
                              // update existing marker fields
                              const m = sm;
                              try {
                                setInlineSaving(true);
                                const payload = {
                                  id: m.id,
                                  map_id: m.map_id,
                                  layer_id: m.layer_id,
                                  icon_id: selectedIconId ?? m.icon_id,
                                  title: title.trim(),
                                  description: description.trim(),
                                  x: m.x,
                                  y: m.y,
                                  rotation: m.rotation ?? 0,
                                  visible: m.visible ?? true,
                                  meta: m.meta ?? "",
                                };
                                const resp = await axios.put(
                                  `/api/maps/markers/${m.id}`,
                                  payload,
                                  {
                                    headers: {
                                      "Content-Type": "application/json",
                                    },
                                  }
                                );
                                if (resp.status >= 200 && resp.status < 300) {
                                  setMarkersState((prev) =>
                                    prev.map((it) =>
                                      it.id === m.id
                                        ? {
                                            ...it,
                                            icon_id: payload.icon_id,
                                            title: payload.title,
                                            description: payload.description,
                                          }
                                        : it
                                    )
                                  );
                                  notifications.show({
                                    color: "green",
                                    title: "Готово",
                                    message: "Маркер обновлён",
                                  });
                                  setSelectedMarkerId(null);
                                } else {
                                  const detail =
                                    (resp as any)?.data?.detail ||
                                    "Не удалось обновить маркер";
                                  throw new Error(detail);
                                }
                              } catch (e: any) {
                                notifications.show({
                                  color: "red",
                                  title: "Ошибка",
                                  message:
                                    e?.response?.data?.detail ||
                                    e?.message ||
                                    "Ошибка обновления",
                                });
                              } finally {
                                setInlineSaving(false);
                              }
                            }}>
                            Обновить
                          </Button>
                        </Group>
                      </Paper>
                    </div>
                  );
                })()}
              {/* New marker preview */}
              {posPx && selectedIcon && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={resolveIconUrl(selectedIcon.sprite_url)}
                  alt="Marker preview"
                  style={markerStyle}
                />
              )}
              {/* Создание нового маркера: шаг 1 — выбор иконки, шаг 2 — поля */}
              {createOpen &&
                posPx &&
                selectedMarkerId == null &&
                (() => {
                  const leftPct = (posPx.x / baseW) * 100;
                  const topPct = (posPx.y / baseH) * 100;
                  const boxStyle: React.CSSProperties = {
                    position: "absolute",
                    left: `${leftPct}%`,
                    top: `${topPct}%`,
                    transform: "translate(-50%, 8px)",
                    zIndex: 12,
                  };
                  return (
                    <div style={boxStyle} onClick={(e) => e.stopPropagation()}>
                      <Paper
                        shadow="sm"
                        withBorder
                        p="sm"
                        radius="md"
                        style={{ width: 280, background: "white" }}>
                        {createStep === "icon" ? (
                          <>
                            <div className="text-xs text-gray-500 mb-2">
                              Выберите иконку
                            </div>
                            <Select
                              placeholder="Иконка"
                              searchable
                              data={iconOptions}
                              value={
                                selectedIconId != null
                                  ? String(selectedIconId)
                                  : null
                              }
                              onChange={(v) => {
                                setSelectedIconId(v ? Number(v) : null);
                                if (v) setCreateStep("form");
                              }}
                            />
                            <Group justify="end" gap="xs" className="mt-2">
                              <Button
                                size="xs"
                                variant="subtle"
                                onClick={() => {
                                  setCreateOpen(false);
                                  setPosPx(null);
                                }}>
                                Отмена
                              </Button>
                            </Group>
                          </>
                        ) : (
                          <>
                            <div className="text-xs text-gray-500 mb-2">
                              Новый маркер
                            </div>
                            <Input.Wrapper label="Title" size="sm" withAsterisk>
                              <Input
                                size="sm"
                                value={title}
                                onChange={(e) =>
                                  setTitle(e.currentTarget.value)
                                }
                              />
                            </Input.Wrapper>
                            <Textarea
                              label="Description"
                              size="sm"
                              minRows={2}
                              className="mt-2"
                              value={description}
                              onChange={(e) =>
                                setDescription(e.currentTarget.value)
                              }
                            />
                            <Group justify="end" gap="xs" className="mt-2">
                              <Button
                                size="xs"
                                variant="subtle"
                                onClick={() => {
                                  setCreateOpen(false);
                                  setPosPx(null);
                                  setSelectedIconId(null);
                                }}>
                                Отмена
                              </Button>
                              <Button
                                size="xs"
                                onClick={handleSave}
                                disabled={!selectedIconId || !title.trim()}>
                                Сохранить
                              </Button>
                            </Group>
                          </>
                        )}
                      </Paper>
                    </div>
                  );
                })()}
            </div>
          ) : (
            <div className="p-8 text-sm text-gray-500">
              Нет изображения слоя
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
