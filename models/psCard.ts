
type HtmlString = string
type Url = string

/**
 * Card, as represented on PlaneSculptor.
 */
type PsCard = {
    cardId: number
    sequenceNumber: number
    shape: string
    name: string
    manaCost: HtmlString
    cmc: number
    colors: []

    /** Full type, not base type. E.g. "Enchantment Creature — Elf Druid". */
    types: string
    artUrl: Url

    /** URL with more info on the card. */
    // url: Url
    rulesText: HtmlString
    flavorText: string

    /** Either C, U, R, or M. */
    rarity: string

    /** Either Common, Uncommon, Rare, or Mythic. */
    rarityName: string

    /** Power/toughness. */
    ptString: string

    /** Name of the card illustrator. */
    illustrator: string

    name2?: string
    manacost2?: string
    types2?: string
    rulesText2?: string
    flavorText2?: string
    ptString2?: string
    illustrator2?: string

    setVersionLink: HtmlString
    // bbCode: string
}