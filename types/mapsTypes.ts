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
    layers: ILayers[]
}


