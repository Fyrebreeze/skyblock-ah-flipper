import { AuctionFlip, BazaarFlip, Rarity, RawAuction } from '../types';

const API_BASE_URL = 'https://api.hypixel.net/v2/skyblock';
const PROFIT_THRESHOLD = 50000; // Minimum profit to be considered a flip
const MIN_PRICE = 100000; // Minimum price for an item to be considered, to filter out junk

// --- START OF MODIFIER MAPPINGS AND PARSING LOGIC ---

// Roman numeral to integer conversion
const ROMAN_TO_INT: { [key: string]: number } = { I: 1, V: 5, X: 10 };

// possible levels go up to X (10), however some enchants only go up to V (5). THis handles both. However, we can use a mapping for faster conversion if needed.

const romanToNumber = (s: string) => {
    let num = 0;
    for (let i = 0; i < s.length; i++) {
        const current = ROMAN_TO_INT[s[i]];
        const next = ROMAN_TO_INT[s[i + 1]];
        if (next > current) {
            num -= current;
        } else {
            num += current;
        }
    }
    return num;
};

// Mappings from lore text to Bazaar product IDs
// Note: Some enchantments are commented out as they are either very low value or not relevant for flips.
// Below are old mappings kept for reference.

/* const ENCHANTMENT_MAP: Record<string, string> = {
    "Sharpness": "SHARPNESS", "Smite": "SMITE", "Bane of Arthropods": "BANE_OF_ARTHROPODS",
    "Protection": "PROTECTION", "Fire Protection": "FIRE_PROTECTION", "Projectile Protection": "PROJECTILE_PROTECTION",
    "Blast Protection": "BLAST_PROTECTION", "Feather Falling": "FEATHER_FALLING", "Thorns": "THORNS",
    "Power": "POWER", "Punch": "PUNCH", "Flame": "FLAME", "Infinite Quiver": "INFINITE_QUIVER",
    "Looting": "LOOTING", "Luck": "LUCK", "Efficiency": "EFFICIENCY", "Silk Touch": "SILK_TOUCH",
    "Fortune": "FORTUNE", "Depth Strider": "DEPTH_STRIDER", "Respiration": "RESPIRATION", "Aqua Affinity": "AQUA_AFFINITY",
    "Vampirism": "VAMPIRISM", "Life Steal": "LIFE_STEAL", "Drain": "SYPHON","Critical": "CRITICAL", "Execute": "EXECUTE",
    "First Strike": "FIRST_STRIKE", "Giant Killer": "GIANT_KILLER", "Growth": "GROWTH", "Cubism": "CUBISM",
    "Ender Slayer": "ENDER_SLAYER", "Impaling": "IMPALING", "Lethality": "LETHALITY", "Scavenger": "SCAVENGER",
    "Syphon": "SYPHON", "Titan Killer": "TITAN_KILLER", "Triple-Strike": "TRIPLE_STRIKE",
    "Venomous": "VENOMOUS", "Vicious": "VICIOUS","Harvesting": "HARVESTING", "Absorb": "ABSORB",
    "Piscary": "PISCARY", "Compact": "COMPACT", "Cultivating": "CULTIVATING", "Expertise": "EXPERTISE", "Toxophilite": "TOXOPHILITE",
    "Champion": "CHAMPION", "Lure": "LURE", "Magnet": "MAGNET", "Spiked Hook": "SPIKED_HOOK", "Telekinesis": "TELEKINESIS", "Gravity": "GRAVITY",
    "Turbo-Mushrooms": "TURBO_MUSHROOM", "Turbo-Wheat": "TURBO_WHEAT", "Turbo-Carrots": "TURBO_CARROTS", "Turbo-Potatoes": "TURBO_POTATOES","Turbo-Warts": "TURBO_WARTS",
    "Turbo-Cane": "TURBO-CANE", "Turbo-Cacti": "TURBO-CACTI","Experience": "EXPERIENCE",
}; */

const ENCHANTMENT_MAP: Record<string, string> = {
  // Sword / General Combat Enchants
  "Bane of Arthropods": "BANE_OF_ARTHROPODS",
  "Champion": "CHAMPION",
  "Cleave": "CLEAVE",
  "Critical": "CRITICAL",
  "Cubism": "CUBISM",
  "Divine Gift": "DIVINE_GIFT",
  "Dragon Hunter": "DRAGON_HUNTER",
  "Ender Slayer": "ENDER_SLAYER",
  "Execute": "EXECUTE",
  "Experience": "EXPERIENCE",
  "Fire Aspect": "FIRE_ASPECT",
  "First Strike": "FIRST_STRIKE",
  "Giant Killer": "GIANT_KILLER",
  "Impaling": "IMPALING",
  "Knockback": "KNOCKBACK",
  "Lethality": "LETHALITY",
  "Life Steal": "LIFE_STEAL",
  "Looting": "LOOTING",
  "Luck": "LUCK",
  "Mana Steal": "MANA_STEAL",
  "Prosecute": "PROSECUTE",
  "Scavenger": "SCAVENGER",
  "Sharpness": "SHARPNESS",
  "Smite": "SMITE",
  "Smoldering": "SMOLDERING",
  "DRAIN": "SYPHON", // formerly "Syphon"
  "Tabasco": "TABASCO",
  "Thunderbolt": "THUNDERBOLT",
  "Thunderlord": "THUNDERLORD",
  "Titan Killer": "TITAN_KILLER",
  "Triple-Strike": "TRIPLE_STRIKE",
  "Vampirism": "VAMPIRISM",
  "Venomous": "VENOMOUS",
  "Vicious": "VICIOUS",

  // Bow Enchants
  "Chance": "CHANCE",
  "Dragon Tracer": "DRAGON_TRACER",
  "Flame": "FLAME",
  "Overload": "OVERLOAD",
  "Infinite Quiver": "INFINITE_QUIVER",
  "Piercing": "PIERCING",
  "Power": "POWER",
  "Punch": "PUNCH",
  "Snipe": "SNIPE",
  "Duplex": "DUPLEX",
  "Rend": "REND",

  // Armor & Equipment Enchants
  "Aqua Affinity": "AQUA_AFFINITY",
  "Big Brain": "BIG_BRAIN",
  "Transylvanian": "TRANSYLVANIAN",
  "Blast Protection": "BLAST_PROTECTION",
  "Counter-Strike": "COUNTER_STRIKE",
  "Depth Strider": "DEPTH_STRIDER",
  "Feather Falling": "FEATHER_FALLING",
  "Ferocious Mana": "FEROCIOUS_MANA",
  "Forest Pledge": "FOREST_PLEDGE",
  "Great Spook": "GREAT_SPOOK",
  "Growth": "GROWTH",
  "Hardened Mana": "HARDENED_MANA",
  "Hecatomb": "HECATOMB",
  "Mana Vampire": "MANA_VAMPIRE",
  "Pesterminator": "PESTERMANATOR",
  "Protection": "PROTECTION",
  "Projectile Protection": "PROJECTILE_PROTECTION",
  "Reflection": "REFLECTION",
  "Refrigerate": "REFRIGERATE",
  "Rejuvenate": "REJUVENATE",
  "Respiration": "RESPIRATION",
  "Respite": "RESPITE",
  "Scuba": "SCUBA",
  "Small Brain": "SMALL_BRAIN",
  "Smarty Pants": "SMARTY_PANTS",
  "Stealth": "STEALTH",
  "Strong Mana": "STRONG_MANA",
  "Sugar Rush": "SUGAR_RUSH",
  "Thorns": "THORNS",
  "True Protection": "TRUE_PROTECTION",

  // Tools & Utility Enchants
  "Absorb": "ABSORB",
  "Cultivating": "CULTIVATING",
  "Dedication": "DEDICATION",
  // Equipment-specific (e.g. wands, gear)
  "Cayenne": "CAYENNE",
  
  // new update enchants are not included here yet
};


const ULTIMATE_ENCHANT_MAP: Record<string, string> = {
  "Bank": "BANK",
  "Bobbin' Time": "BOBBIN_TIME",
  "Chimera": "CHIMERA",
  "Combo": "COMBO",
  "Duplex": "DUPLEX",
  "Fatal Tempo": "FATAL_TEMPO",
  "First Impression": "FIRST_IMPRESSION",
  "Flash": "FLASH",
  "Habanero Tactics": "HABANERO_TACTICS",
  "Inferno": "INFERNO",
  "Last Stand": "LAST_STAND",
  "Legion": "LEGION",
  "Missile": "MISSILE",
  "No Pain No Gain": "NO_PAIN_NO_GAIN",
  "One For All": "ONE_FOR_ALL",
  "Rend": "REND",
  "Swarm": "SWARM",
  "Soul Eater": "SOUL_EATER",
  "The One": "THE_ONE",
  "Ultimate Jerry": "ULTIMATE_JERRY",
  "Ultimate Wise": "ULTIMATE_WISE",
  "Wisdom": "WISDOM",
};

const GEMSTONE_TIER_MAP: Record<string, string> = { "Rough": "ROUGH", "Flawed": "FLAWED", "Fine": "FINE", "Flawless": "FLAWLESS", "Perfect": "PERFECT" };
const GEMSTONE_TYPE_MAP: Record<string, string> = { "Jasper": "JASPER", "Ruby": "RUBY", "Amber": "AMBER", "Sapphire": "SAPPHIRE", "Jade": "JADE", "Amethyst": "AMETHYST", "Topaz": "TOPAZ", "Opal": "OPAL" };

const STATIC_MODIFIER_MAP: Record<string, string> = {
    "Art of War": "ART_OF_WAR", "Book of Stats": "BOOK_OF_STATS", "Hot Potato Book": "HOT_POTATO_BOOK",
    "Fuming Potato Book": "FUMING_POTATO_BOOK", "Recombobulator": "RECOMBOBULATOR_3000",
};

/**
 * Parses item lore to extract Bazaar-equivalent modifiers.
 * @param lore The item's lore string.
 * @returns An array of Bazaar product IDs for all found modifiers.
 */
const getBazaarModifiersFromLore = (lore: string): string[] => {
    if (!lore) return [];
    const modifiers: string[] = [];
    const cleanedLore = lore.replace(/§[a-f09k-or]/g, '');
    const lines = cleanedLore.split('\n');

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // Ultimate Enchants (e.g., Ultimate Wise V)
        for (const [name, id] of Object.entries(ULTIMATE_ENCHANT_MAP)) {
            const regex = new RegExp(`^${name} (I|II|III|IV|V)$`);
            const match = trimmed.match(regex);
            if (match) {
                const level = romanToNumber(match[1]);
                modifiers.push(`${id}_${level}_BOOK`);
                continue;
            }
        }

        // Regular Enchants (e.g., Sharpness VII)
        for (const [name, id] of Object.entries(ENCHANTMENT_MAP)) {
            const regex = new RegExp(`^${name} (I|II|III|IV|V|VI|VII|VIII|IX|X)$`);
            const match = trimmed.match(regex);
            if (match) {
                const level = romanToNumber(match[1]);
                modifiers.push(`ENCHANTMENT_${id}_${level}`);
                continue;
            }
        }

        // Gemstones (e.g., [❂ Perfect Jasper])
        if (trimmed.includes('❂')) {
            const gemParts = trimmed.replace(/[\[\]❂]/g, '').trim().split(' ');
            if (gemParts.length === 2) {
                const [tier, type] = gemParts;
                if (GEMSTONE_TIER_MAP[tier] && GEMSTONE_TYPE_MAP[type]) {
                    modifiers.push(`${GEMSTONE_TIER_MAP[tier]}_${GEMSTONE_TYPE_MAP[type]}_GEM`);
                }
            }
        }
        
        // Static modifiers (e.g., Art of War)
        for(const [name, id] of Object.entries(STATIC_MODIFIER_MAP)) {
            if(trimmed.includes(name)) {
                modifiers.push(id);
            }
        }
    }
    return modifiers;
};


// A list of known ultimate enchantments.
const ULTIMATE_ENCHANTS = [
    'Ultimate Wise', 'Ultimate Jerry', 'Soul Eater', 'Chimera', 'Combo', 
    'Duplex', 'Fatal Tempo', 'Inferno', 'One For All', 'Swarm', 'Rend', 'Bank',
    'Last Stand', 'Legion', 'No Pain No Gain', 'Wisdom'
];

// A list of other specific, high-value modifiers found in lore.
const HIGH_VALUE_MODIFIERS = [
    "Fuming Potato Book",
    "Hot Potato Book",
    "Recombobulator",
    "Book of Stats",
];

const extractKeyModifiersFromLore = (lore: string): string[] => {
    if (!lore) return [];
    const modifiers: Set<string> = new Set();
    const cleanedLore = lore.replace(/§[a-f0-9k-or]/g, '');
    const loreLines = cleanedLore.split('\n');
    for (const line of loreLines) {
        const trimmedLine = line.trim();
        if (!trimmedLine) continue;
        for (const ult of ULTIMATE_ENCHANTS) {
            const regex = new RegExp(`^${ult} (I|II|III|IV|V)$`);
            if (regex.test(trimmedLine)) {
                modifiers.add(trimmedLine);
                break;
            }
        }
        if (/\s(VI|VII|VIII|IX|X)$/.test(trimmedLine)) {
            const isLowValue = ['Piscary', 'Angler', 'Compact', 'Cultivating', 'Harvesting', 'Expertise'].some(e => trimmedLine.startsWith(e));
            // if (!isLowValue) modifiers.add(trimmedLine);
            // --- IGNORE --- for now we include all enchants for better grouping
        }
        if (trimmedLine.includes('❂')) {
            const gem = trimmedLine.replace(/[\[\]]/g, '').replace('❂', '').trim();
            if (gem) modifiers.add(gem);
        }
        for (const mod of HIGH_VALUE_MODIFIERS) {
            if (trimmedLine.includes(mod)) modifiers.add(mod);
        }
    }
    return Array.from(modifiers).sort();
};

const generateAuctionGroupingKey = (auction: RawAuction): string => {
    const baseName = auction.item_name.replace(/§[a-f0-9k-or]/g, '').trim();
    const loreModifiers = extractKeyModifiersFromLore(auction.item_lore);
    return `${baseName}::${loreModifiers.join('|')}`;
};

const normalizeAuctionName = (name: string): string => {
    return name.replace(/§[a-f0-9k-or]/g, '').trim();
};

const formatItemName = (name: string): string => {
  return name
    .replace(/_/g, ' ')
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const calculateSalesTax = (price: number): number => {
  if (price >= 1_000_000) return price * 0.02;
  return price * 0.01;
};

const calculateListingFee = (price: number): number => {
  if (price <= 10_000_000) return price * 0.01;
  else if (price <=99_999_999) return price * 0.02;
  else return price * 0.025;
};

// --- BAZAAR LOGIC ---
export const fetchBazaarFlips = async (): Promise<BazaarFlip[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bazaar`);
    if (!response.ok) throw new Error('Failed to fetch Bazaar data');
    const data = await response.json();
    if (!data.success) throw new Error(data.cause || 'Bazaar API call failed');

    const flips: BazaarFlip[] = [];

    for (const productId in data.products) {
        const product = data.products[productId];
        const status = product.quick_status;
        if (status && status.sellPrice > 0 && status.buyPrice > 0) {
            const buyFor = status.sellPrice;
            const sellFor = status.buyPrice;
            const profit = sellFor - buyFor;
            if (profit > 100 && status.buyMovingWeek > 100) {
                flips.push({
                    id: productId,
                    itemName: formatItemName(product.product_id),
                    buyPrice: buyFor,
                    sellPrice: sellFor,
                    profit,
                    buyVolume: status.buyMovingWeek,
                    sellVolume: status.sellMovingWeek,
                });
            }
        }
    }
    return flips;
  } catch (error) {
    console.error("Error fetching bazaar flips:", error);
    throw error;
  }
};

const getBazaarPrices = async (): Promise<Map<string, number>> => {
    const response = await fetch(`${API_BASE_URL}/bazaar`);
    const data = await response.json();
    if (!data.success) throw new Error('Bazaar API call failed');
    const priceMap = new Map<string, number>();
    for (const productId in data.products) {
        const buyPrice = data.products[productId]?.quick_status?.buyPrice;
        if (buyPrice > 0) {
            priceMap.set(productId, buyPrice);
        }
    }
    return priceMap;
}

// --- AUCTION FLIP LOGIC ---

const findMarketPriceAuction = (sortedAuctions: RawAuction[]): RawAuction | null => {
    const marketCandidates = sortedAuctions.slice(1);
    if (marketCandidates.length < 2) return null;

    const firstCandidatePrice = marketCandidates[0].starting_bid;
    if (marketCandidates.length < 5) {
        const secondCandidatePrice = marketCandidates[1].starting_bid;
        if ((secondCandidatePrice - firstCandidatePrice) / firstCandidatePrice > 0.20) return null;
        return marketCandidates[0];
    }

    const reasonableCandidates = marketCandidates.filter(a => a.starting_bid < firstCandidatePrice * 10);
    if (reasonableCandidates.length < 2) return marketCandidates[0];

    const prices = reasonableCandidates.map(a => a.starting_bid);
    const q1 = prices[Math.floor(prices.length / 4)];
    const q3 = prices[Math.floor(prices.length * 3 / 4)];
    const iqr = q3 - q1;
    const upperBound = q3 + 1.5 * iqr;
    const filteredCandidates = reasonableCandidates.filter(a => a.starting_bid <= upperBound);
    if (filteredCandidates.length < 2) return reasonableCandidates[0];

    const n = filteredCandidates.length;
    const windowSize = Math.max(3, Math.floor(n * 0.2));
    if (n < windowSize) return filteredCandidates[0];

    let bestClusterStartIndex = 0;
    let minCombinedScore = Infinity;

    for (let i = 0; i <= n - windowSize; i++) {
        const window = filteredCandidates.slice(i, i + windowSize);
        const startPrice = window[0].starting_bid;
        const endPrice = window[windowSize - 1].starting_bid;
        if (startPrice > 0) {
            const relativeSpread = (endPrice - startPrice) / startPrice;
            const sellers = new Set(window.map(a => a.auctioneer));
            const diversityScore = sellers.size / windowSize;
            const diversityPenalty = Math.pow(1 - diversityScore, 2);
            const combinedScore = relativeSpread + diversityPenalty;
            if (combinedScore < minCombinedScore) {
                minCombinedScore = combinedScore;
                bestClusterStartIndex = i;
            }
        }
    }
    return filteredCandidates[bestClusterStartIndex];
};


export const fetchAuctionFlips = async (): Promise<AuctionFlip[]> => {
  const [allAuctions, bazaarPrices] = await Promise.all([fetchAllAuctionPages(), getBazaarPrices()]);

  const activeBins = allAuctions.filter(auc => auc.bin && !auc.claimed);
  const groupedAuctions = new Map<string, RawAuction[]>();
  const cleanItemPrices = new Map<string, number>();

  activeBins.forEach(auction => {
    if(!auction.auctioneer) return;
    const groupingKey = generateAuctionGroupingKey(auction);
    if (!groupedAuctions.has(groupingKey)) groupedAuctions.set(groupingKey, []);
    groupedAuctions.get(groupingKey)!.push(auction);
  });

  // Pre-calculate lowest BIN for "clean" items (no modifiers)
  for (const [key, auctions] of groupedAuctions.entries()) {
      if (key.endsWith("::")) { // This indicates a clean item
          const baseName = key.slice(0, -2);
          const lowestPrice = auctions.sort((a,b) => a.starting_bid - b.starting_bid)[0].starting_bid;
          cleanItemPrices.set(baseName, lowestPrice);
      }
  }

  const flips: AuctionFlip[] = [];
  for (const [groupingKey, auctions] of groupedAuctions.entries()) {
    if (auctions.length < 2) continue;

    const sortedAuctions = auctions.sort((a, b) => a.starting_bid - b.starting_bid);
    const buyAuction = sortedAuctions[0];
    const buyPrice = buyAuction.starting_bid;

    if (buyPrice < MIN_PRICE) continue;

    const marketPriceAuction = findMarketPriceAuction(sortedAuctions);
    if (!marketPriceAuction) continue;

    const marketPrice = marketPriceAuction.starting_bid;
    if (marketPrice <= buyPrice) continue;

    const sellPrice = marketPrice - 1;
    const salesTax = calculateSalesTax(sellPrice);
    const listingFee = calculateListingFee(sellPrice);
    const totalFees = salesTax + listingFee;
    const profit = sellPrice - buyPrice - totalFees;

    if (profit > PROFIT_THRESHOLD) {
      // START: Sum-of-parts worth calculation
      let estimatedWorth: number | undefined = undefined;
      let worthProfit: number | undefined = undefined;
      
      const baseName = groupingKey.split("::")[0];
      const cleanPrice = cleanItemPrices.get(baseName);

      if (cleanPrice) {
          const isRecombobulated = buyAuction.item_lore.includes('§k');
          const bazaarModifiers = getBazaarModifiersFromLore(buyAuction.item_lore);
          
          let totalModifierCost = 0;
          if (isRecombobulated) {
              totalModifierCost += bazaarPrices.get('RECOMBOBULATOR_3000') || 0;
          }
          for (const modId of bazaarModifiers) {
              totalModifierCost += bazaarPrices.get(modId) || 0;
          }

          if (totalModifierCost > 0) {
              estimatedWorth = cleanPrice + totalModifierCost;
              worthProfit = estimatedWorth - buyPrice;
          }
      }
      // END: Sum-of-parts worth calculation

      flips.push({
        id: buyAuction.uuid,
        itemName: normalizeAuctionName(buyAuction.item_name),
        rarity: buyAuction.tier,
        lore: buyAuction.item_lore,
        lowestBin: buyPrice,
        marketPrice: marketPrice,
        profit: Math.round(profit),
        estimatedWorth: estimatedWorth ? Math.round(estimatedWorth) : undefined,
        worthProfit: worthProfit ? Math.round(worthProfit) : undefined,
      });
    }
  }

  return flips;
};

// --- HELPER for fetching all auction pages ---
const fetchAllAuctionPages = async (maxPages: number = 35): Promise<RawAuction[]> => {
    const firstPageResponse = await fetch(`${API_BASE_URL}/auctions?page=0`);
    if (!firstPageResponse.ok) throw new Error(`Hypixel API error: ${firstPageResponse.statusText}`);
    const firstPageData = await firstPageResponse.json();
    if (!firstPageData.success) throw new Error(firstPageData.cause || 'Failed to fetch auctions.');

    let allAuctions: RawAuction[] = firstPageData.auctions;
    const totalPages = Math.min(firstPageData.totalPages, maxPages);

    const chunkSize = 5;
    for (let i = 1; i < totalPages; i += chunkSize) {
        const pagePromises = [];
        const end = Math.min(i + chunkSize, totalPages);
        for (let j = i; j < end; j++) {
            pagePromises.push(
                fetch(`${API_BASE_URL}/auctions?page=${j}`)
                .then(res => res.json())
                .catch(e => {
                    console.warn(`Failed to fetch auction page ${j}:`, e);
                    return null;
                })
            );
        }

        const pagesData = await Promise.all(pagePromises);
        pagesData.forEach(page => {
          if (page && page.success) {
            allAuctions = allAuctions.concat(page.auctions);
          }
        });
    }

    return allAuctions;
}