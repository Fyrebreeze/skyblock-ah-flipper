
export enum Rarity {
  COMMON = "COMMON",
  UNCOMMON = "UNCOMMON",
  RARE = "RARE",
  EPIC = "EPIC",
  LEGENDARY = "LEGENDARY",
  MYTHIC = "MYTHIC",
  SPECIAL = "SPECIAL",
  VERY_SPECIAL = "VERY_SPECIAL",
}

export interface AuctionFlip {
  id: string; // uuid of the auction
  itemName: string;
  rarity: Rarity;
  lore: string;
  lowestBin: number;
  marketPrice: number; // The 2nd lowest BIN price, used as the estimated market value
  profit: number;
  estimatedWorth?: number;
  worthProfit?: number;
}

export interface BazaarFlip {
  id:string; // product_id
  itemName: string;
  buyPrice: number;
  sellPrice: number;
  profit: number;
  buyVolume: number;
  sellVolume: number;
}

export type SortableAuctionKeys = keyof Omit<AuctionFlip, 'id' | 'rarity' | 'itemName' | 'lore'>;
export type SortableBazaarKeys = keyof Omit<BazaarFlip, 'id' | 'itemName'>;


export interface SortConfig<T> {
  key: T;
  direction: 'ascending' | 'descending';
}

// Raw types from Hypixel API to help with processing
export interface RawAuction {
  uuid: string;
  item_name: string;
  tier: Rarity;
  starting_bid: number;
  bin: boolean;
  claimed: boolean;
  item_lore: string;
  auctioneer: string;
}