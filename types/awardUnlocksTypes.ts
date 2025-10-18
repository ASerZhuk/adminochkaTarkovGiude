export interface IAwardUnlocks {
    id: number,
    kind: string,
    item_name: string,
    bsg_id: string,
    extra: {
        loyalty: number,
        barter_items_count: number,
        trader_name_tech: string,
    }
}