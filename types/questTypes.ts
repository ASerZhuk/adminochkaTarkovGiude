import { IAwardItems } from "./awardItemsType"
import { IAwardRaw } from "./awardRawTypes"
import { IAwardUnlocks } from "./awardUnlocksTypes"
import { IGoals } from "./goalsTypes"
import { ITrader } from "./traderTypes"

export interface IParentQuests {
    seo_link: string,
    name: string,
}

export interface INextQuests {
    seo_link: string,
    name: string,
}

export interface IQuest {
    id: number,
    is_unlocked_over_time: boolean,
    level_req: number,
    kappa_req: boolean,
    guides: string,
    trader_id: number,
    seo_link: string,
    name: string,
    name_tech: string,
    trader_req: string[],
    goals: IGoals[],
    trader: ITrader,
    parent_quests: IParentQuests[],
    next_quests: INextQuests[],
    award_raw: IAwardRaw,
    award_items: IAwardItems[],
    award_unlocks: IAwardUnlocks[]

}