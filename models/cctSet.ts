/**
 * A card set, as modelled in Cockatrice.
 */
export type Set = {
    /** Set code. Set codes are usually 3-4 character short IDs. */
    name: string

    /** Set longer name. */
    longname: string

    /** State the set type, eg. Core, Expansion, Promo, Planesculptors, etc. */
    settype: string

    /** Place the set release date between the releasedate tags; ensure it is in the yyyy-mm-dd format. */
    releasedate: string
}
