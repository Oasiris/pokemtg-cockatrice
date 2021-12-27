import { readFileSync as read, writeFileSync as write } from 'fs'
import { resolve } from 'path'

import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser'
import uniq from 'lodash/fp/uniq'

import { Card, CardProperties, CardSetStatus } from './models/cctCard'
import { PsCard } from './models/psCard'
import cardData from './in/rawData'

// const INPUT_FILEPATH = './in/rawData.ts'

// if (require.main === module) {
//     console.log('Reading...')
    
//     // === Read ===
//     const text = read(resolve(__dirname, INPUT_FILEPATH), 'utf8')
//     console.log('Parsing...')
//     const json = JSON.parse(text)
//     console.log('Parse complete.')
//     console.log(json)
    


//     console.log('Hi')
// }

const MANA_COST_LONG_TO_SHORT = {
    'colorless': 'C',
    'black': 'B',
    'white': 'W',
    'blue': 'U',
    'red': 'R',
    'green': 'G',
    'snow': 'S'
}


export class CardUtil {
    /** 
     * @param fullType A card's full type, eg. "Legendary Creature — Spirit Cleric".
     * @returns The card's main type, eg. "Creature".
     */
    static getBaseType(fullType: string): string {
        fullType = fullType.trim()
        const match: RegExpMatchArray = fullType.match(/^([\w]+\s)?([\w]+\s)?(?<type>\w+)( —.+)?$/)
        if (match === null) {
            throw new Error(`Couldn't parse fulltype '${fullType}' into a base type`)
        }
        const shortType = match.groups.type
        return shortType
    }

    /**
     * @param manaCostHtml A card's mana cost as an HTML string, e.g. 
     *      '<span class="icon-wrapper"><i class="mtg mana-3"></i></span>'.
     * @returns The card's mana cost, eg "1UW".
     */
    static getManaCost(manaCostHtml: string): string {
        if (manaCostHtml === '') {
            return ''
        }
        const matches: RegExpMatchArray = manaCostHtml.match(/(?<c1>i class="mtg [\w-]+")/g)
        if (matches === null) {
            throw new Error(`Couldn't parse manaCostHtml '${manaCostHtml}' into a mana cost`)
        }
        let manaCost: string = ""
        for (let item of matches) {
            item = item.replace(/"/g, '').replace(/i class=mtg /, '')
            if (item.startsWith("mana")) {
                manaCost += item[item.length - 1].toUpperCase()
            } else if (item.startsWith("hybrid")) {
                const left = item[item.length - 2]
                const right = item[item.length - 1]
                manaCost += `{${left.toUpperCase()}/${right.toUpperCase()}}`
            } else {
                const newLetter = MANA_COST_LONG_TO_SHORT[item]
                if (newLetter === undefined) {
                    throw new Error(`Can't parse item '${item}'`)
                }
                manaCost += newLetter
            }
        }
        return manaCost
    }

    /**
     * @returns 0 for lands, 2 for creatures, 3 for non-permanents (instants + sorceries), and 1 for everything else.
     */
    static getTableRow(baseType: string): 0 | 1 | 2 | 3 {
        baseType = baseType.toLowerCase()
        if (baseType === 'land') {
            return 0
        }
        if (baseType === 'creature') {
            return 2
        }
        if (['instant', 'sorcery'].includes(baseType)) {
            return 3
        }
        return 1
    }
}



const SET_NAME = 'PMTG_82'

if (require.main === module) {

    const cctCards: Card[] = []

    // === Step 1 ===
    // Process the JSON.

    for (const i in cardData) {
        // Take the PlaneSculptors card.
        const psCard: PsCard = cardData[i] as PsCard
        // Parse data.
        const baseType = CardUtil.getBaseType(psCard.types)
        const tableRow = CardUtil.getTableRow(baseType)
        const manaCost = CardUtil.getManaCost(psCard.manaCost)
        const hasColors: boolean = psCard.colors.length > 0
        const hasPt: boolean = psCard.ptString.length > 0
        const isToken: boolean = psCard.rarity === 'T'

        // Create intermediate objects.
        const cardSetStatus: CardSetStatus = {
            '#text': SET_NAME,
            '@@picurl': psCard.artUrl,
            '@@num': psCard.sequenceNumber,
            '@@rarity': psCard.rarityName.toLowerCase(),
        }
        let cardProperties: CardProperties = {
            // TODO: Differentiate here.
            layout: 'normal',
            // TODO: Differentiate here.
            side: 'front',
            type: psCard.types,
            maintype: baseType,
            manacost: manaCost,
            cmc: psCard.cmc,
        }
        if (hasColors) {
            cardProperties.colors = psCard.colors.join('')
        }
        if (hasPt) {
            cardProperties.pt = psCard.ptString
        }

        // Create card object.
        let card: Card = {
            name: psCard.name,
            text: psCard.rulesText,
            
            prop: cardProperties,
            set: cardSetStatus,

            tablerow: tableRow,
        }
        if (isToken) {
            card.token = 1
        }

        cctCards.push(card)
    }
    // console.log(cctCards.slice(0, 10))

    // === Step 2 ===
    // Convert to XML using XMLBuilder.
    const mini = cctCards.slice(8, 10)

    const options = {
        arrayNodeName: 'card',
        ignoreAttributes: false,
        attributeNamePrefix: "@@",
        format: true
    }
    const CardsBuilder = new XMLBuilder(options)
    console.log(`Building...`)
    const cardsXmlString: string = CardsBuilder.build(cctCards)
    console.log(`Building finished.`)

    /// === Write ===
    write(resolve(__dirname, `./out/pokemtg.xml`), cardsXmlString, 'utf8')
    console.log(`Writing complete.`)
}
