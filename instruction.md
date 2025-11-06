Нужно сделать следующее: 1. Переходим на страницу маркеров. Нам показываются все карты с их слоями (
export interface ILayers {
id: string,
map_id: number,
name: string,
image_url: string,
width_px: number,
height_px: number,
min_zoom: number,
max_zoom: number,
default_zoom: number,
order_index: number,
visible_by_default: boolean,
}

        export interface IMaps {
            id: number,
            name: string,
            pmc_range: string,
            raid_time: number,
            seo_link: string,
            img?: string | null,
            layers: ILayers[]
        }
    )

    2. При нажатии на слой мы переходим на страницу добаления маркеров на слой. dnd тыкаем в место на карте появляется выбор маркера(из иконок getIcons), выбираем нужный маркер, вводим его title и description, нажимаем сохранить и он сохраняет маркер.

    Вот маршруты для сохранения маркера:
        Префикс роутера: /maps (api/map_markers.py:14)

        GET /maps/id/{map_id}/markers — маркеры карты с пагинацией (page, size) и флагом all для снятия пагинации; MapMarkerList (api/map_markers.py:18)

        GET /maps/layers/{layer_id}/markers — маркеры слоя с пагинацией и флагом all; MapMarkerList (api/map_markers.py:31)

        GET /maps/markers/{marker_id} — маркер по ID, 404 если не найден; MapMarkerResponse (api/map_markers.py:44)

        POST /maps/markers/create — создать маркер, только админ, 201; MapMarkerResponse (api/map_markers.py:52)

        PUT /maps/markers/{marker_id} — обновить маркер, только админ, 404 если не найден; MapMarkerResponse (api/map_markers.py:64)

        DELETE /maps/markers/{marker_id} — удалить маркер, только админ, 204, 404 если не найден (api/map_markers.py:74)

        Параметры пагинации: page >= 1, size 1..1000, all — bool.

Дальше эта карта будет использоваться на фронте с помощью библиотеки leaflet
