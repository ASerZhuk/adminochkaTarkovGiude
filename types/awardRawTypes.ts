import { IItemReward } from "./itemRewardsType"

export interface IAwardRaw {
    id: number,
    seo_link: string,
    data: {
        reward_strings: string[]
        penalties: string[]
        item_rewards: IItemReward[]
        starting_items: IItemReward[],

    }
    quest_unlocks: string[]
   
}