/**
 * A card, as modelled in Cockatrice.
 */
export type Card = {
    /** The card's name. */
    name: string
    /** The card' description and oracle text (including actions, effects, etc..) */
    text: string

    prop: CardProperties

    /** For each set this card appears in, add a correspondent `set` tag. */
    set: CardSetStatus

    /**
     * Place the corresponding number, as found below, to allow the card to appear in the correct row in-game:
     *
     *   0 -> lands
     *   1 -> non-creature, non-land permanents (Planeswalkers, Enchantments, and Artifacts)
     *  2 -> creatures (including Enchantment Creatures, Artifact Creatures, etc)
     *  3 -> non-permanent cards (Instants, Sorceries)
     */
    tablerow: number

    /** If the card is a token (thus can't be directly played from topdeck), place a 1 here. If not, then you must remove this tag. */
    token?: 1
    /** If this card comes into play tapped, place a 1 here. If not, then you must remove this tag. */
    cipt?: 1

    /** If this card's picture must be shown upside down (eg. flip cards), place a 1 here. If not, then you must remove this tag. */
    upsidedown?: 1

    /** If the card can create or transform itself into another card (eg. create a token or flip), add one or more related tags. The card's name goes in the tag. */
    related?: CardRelation[]

    /** Instead, if the card can be created by another card (eg. this card is a token that can be created by another card), you can add one or more reverse-related tags. The card's name goes in the tag. */
    'reverse-related'?: CardRelation[]
}

export type CardRelation = {
    /** The name of the card in question. */
    cardname: string

    /** Optional. The number of cards that will be created; eg. for a card that creates three equal tokens, set it to 3 . */
    count?: number | string

    /** If the created card must be attached to the original card, set it to attach. */
    attach?: boolean
}

export type CardProperties = {
    /** The card layout, eg. normal, split, transform. */
    layout?: string

    /** For normal cards this property defaults to front. Set it to back to specify that this card is the back side of another card. */
    side: 'front' | 'back'

    /** The full type of the card, eg. Legendary Creature — Spirit Cleric. */
    type: string

    /**  The main type of the card, eg. Creature. */
    maintype: string

    /** Card mana cost, eg. 1WU. */
    manacost?: string

    /** Card converted mana cost, eg. 3. */
    cmc: number | string

    /** Card colors, eg. UW. If your card is colorless, then you may safely omit this tag. */
    colors?: string

    /** Card color identity, eg. WU. If your card is colorless, then you may safely omit this tag. */
    coloridentity?: string

    /** Card's power/toughness. If the card doesn't have a p/t, you may safely omit this tag. */
    pt?: string

    /** Card's starting loyalty total. If the card doesn't have a starting loyalty, you may safely omit this tag. */
    loyalty?: number

    'format-standard'?: 'legal'
    'format-commander'?: 'legal'
    'format-modern'?: 'legal'
    'format-pauper'?: 'legal'
}

/** (Any string is OK here.) */
// export type CardRarity = 'common' | 'uncommon' | 'rare' | 'mythic'
export type CardRarity = string

export type CardSetStatus = {
    /** The name (ID) of the set. */
    '#text': string

    /** The complete URL (including the protocol prefix, eg. http://) to a picture of this card. This url will be used to download the card picture. */
    '@@picurl': string

    /** Optional. The card's collector number in the set. */
    '@@num'?: number | string

    /** Optional. Card rarity. */
    '@@rarity'?: CardRarity

    /** Optional. UUID of the card in this set; must be unique for every single card. */
    '@@uuid'?: number | string

    /** Optional. The card's multiverse ID. This is a special code assigned to each card in a specific game (MTG). */
    '@@muid'?: number | string
}
