import { readFileSync as read, writeFileSync as write } from 'fs'
import { resolve } from 'path'

import { XMLParser, XMLBuilder, XMLValidator } from 'fast-xml-parser'
import uniq from 'lodash/fp/uniq'

import { Card, CardProperties, CardSetStatus } from './models/cctCard'
import { PsCard } from './models/psCard'

import cardData from './in/rawData'

const MANA_COST_LONG_TO_SHORT = {
    colorless: 'C',
    black: 'B',
    white: 'W',
    blue: 'U',
    red: 'R',
    green: 'G',
    snow: 'S',
}

const GITHUB_AUTHOR_AND_REPO_NAME = 'Oasiris/pokemtg-cockatrice'
const IMG_DIR_BRANCH_NAME = 'gh-pages'
const IMAGE_DIR_NAME_A_L = 'assets/img-min'
const IMAGE_DIR_NAME_M_Z = 'assets/img-min2'

export class CardUtil {
    /**
     * @returns The image URL for the card, hosted on github.com.
     */
    static getNewImageUrl(cardName: string, transformType: 'front' | 'back' | 'none'): string {
        let name: string = encodeURIComponent(encodeURIComponent(cardName))
        if (['front', 'back'].includes(transformType)) {
            name += '_' + transformType.toUpperCase()
        }
        const IMAGE_DIR_NAME =
            name[0].toUpperCase() >= 'M' ? IMAGE_DIR_NAME_M_Z : IMAGE_DIR_NAME_A_L
        return (
            `https://raw.githubusercontent.com/` +
            `${GITHUB_AUTHOR_AND_REPO_NAME}/${IMG_DIR_BRANCH_NAME}/${IMAGE_DIR_NAME}/` +
            `${name}.png`
        )
    }

    /**
     * @param fullType A card's full type, eg. "Legendary Creature — Spirit Cleric".
     * @returns The card's main type, eg. "Creature".
     */
    static getBaseType(fullType: string): string {
        fullType = fullType.trim()
        if (fullType === '') {
            console.log('FullType empty')
            return ''
        }
        const match: RegExpMatchArray = fullType.match(/^([\w]+\s)?([\w]+\s)?(?<type>\w+)( —?.+)?/)
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
        manaCostHtml = manaCostHtml.trim()
        if (manaCostHtml === '') {
            return ''
        }
        const matches: RegExpMatchArray = manaCostHtml.match(/(?<c1>i class="mtg [\w-]+")/g)
        if (matches === null) {
            throw new Error(`Couldn't parse manaCostHtml '${manaCostHtml}' into a mana cost`)
        }
        let manaCost: string = ''
        for (let item of matches) {
            item = item.replace(/"/g, '').replace(/i class=mtg /, '')
            if (item.startsWith('mana')) {
                manaCost += item.slice(item.indexOf('mana') + 5).toUpperCase()
            } else if (item.startsWith('hybrid')) {
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

    static formatRulesText(rulesTextHtml: string): string {
        let out = rulesTextHtml
        out = out.replace(/<span class="icon-wrapper"><i class="mtg tap"><\/i><\/span>/g, '{T}')
        out = out.replace(/<span class="icon-wrapper"><i class="mtg black"><\/i><\/span>/g, '{B}')
        out = out.replace(/<span class="icon-wrapper"><i class="mtg white"><\/i><\/span>/g, '{W}')
        out = out.replace(/<span class="icon-wrapper"><i class="mtg red"><\/i><\/span>/g, '{R}')
        out = out.replace(/<span class="icon-wrapper"><i class="mtg blue"><\/i><\/span>/g, '{U}')
        out = out.replace(/<span class="icon-wrapper"><i class="mtg green"><\/i><\/span>/g, '{G}')
        out = out.replace(
            /<span class="icon-wrapper"><i class="mtg colorless"><\/i><\/span>/g,
            '{C}',
        )
        out = out.replace(/<span class="icon-wrapper"><i class="mtg mana-1"><\/i><\/span>/g, '{1}')
        out = out.replace(/<span class="icon-wrapper"><i class="mtg mana-2"><\/i><\/span>/g, '{2}')
        out = out.replace(/<span class="icon-wrapper"><i class="mtg mana-3"><\/i><\/span>/g, '{3}')
        out = out.replace(/<span class="icon-wrapper"><i class="mtg mana-4"><\/i><\/span>/g, '{4}')
        out = out.replace(/<span class="icon-wrapper"><i class="mtg mana-5"><\/i><\/span>/g, '{5}')
        out = out.replace(/<span class="icon-wrapper"><i class="mtg mana-6"><\/i><\/span>/g, '{6}')

        out = out.replace(/<i>/g, '')
        out = out.replace(/<\/i>/g, '')
        return out
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

        const rarity = psCard.rarityName.toLowerCase() || 'common'

        const urlType = psCard.shape === 'double' ? 'front' : 'none'
        const layout = psCard.shape === 'double' ? 'transform' : 'normal'

        // Create intermediate objects.
        const cardSetStatus: CardSetStatus = {
            '#text': SET_NAME,
            '@@picurl': CardUtil.getNewImageUrl(psCard.name, urlType),
            // '@@num': psCard.sequenceNumber,
            '@@rarity': rarity,
        }
        let cardProperties: CardProperties = {
            layout,
            side: 'front',
            type: psCard.types,
            maintype: baseType,
            cmc: psCard.cmc,
        }
        if (manaCost.length > 0 || baseType !== 'Land') {
            cardProperties.manacost = manaCost
        }
        if (hasColors) {
            cardProperties.colors = psCard.colors.join('')
        }
        if (baseType === 'Land') {
            // For now, pretend every land has a color identity of red.
            console.log(psCard.rulesText)
            cardProperties.coloridentity = 'R'
        }
        if (hasPt) {
            cardProperties.pt = psCard.ptString
        }

        // Create card object.
        let card: Card = {
            name: psCard.name,
            text: CardUtil.formatRulesText(psCard.rulesText),

            prop: cardProperties,
            set: cardSetStatus,

            tablerow: tableRow,
        }
        if (isToken) {
            card.token = 1
        }

        cctCards.push(card)
        // ——————————————————————————
        // Figure out if the card transforms or not.
        if (!['normal', 'double'].includes(psCard.shape)) {
            throw new Error(`Unknown card shape '${psCard.shape}' on card ${psCard.name}`)
        }
        if (psCard.shape === 'double') {
            // Add the transformation card, too.
            // Transformation cards have mana costs and CMC of 0. They share all of the colors
            // of their pre-transformation.
            if (psCard.types2 === undefined || psCard.manaCost2 === undefined) {
                console.log('UNDEFINED', psCard.name2)
            }
            const manaCost2 = CardUtil.getManaCost(psCard.manaCost2)
            const baseType2 = CardUtil.getBaseType(psCard.types2)
            const tableRow2 = CardUtil.getTableRow(baseType2)

            const cardSetStatus2: CardSetStatus = {
                '#text': SET_NAME,
                '@@picurl': CardUtil.getNewImageUrl(psCard.name, 'back'),
                // '@@num': psCard.sequenceNumber,
                '@@rarity': rarity,
            }
            let cardProperties2: CardProperties = {
                layout,
                side: 'back',
                type: psCard.types2,
                maintype: baseType2,
                manacost: manaCost2,
                cmc: 0,
            }
            if (hasColors) {
                cardProperties2.colors = psCard.colors.join('')
            }
            if (hasPt) {
                cardProperties2.pt = psCard.ptString2
            }
            // Create card object.
            let card2: Card = {
                name: psCard.name2,
                text: CardUtil.formatRulesText(psCard.rulesText2),

                prop: cardProperties2,
                set: cardSetStatus2,

                tablerow: tableRow2,
            }
            cctCards.push(card2)
        }
    }
    // console.log(cctCards.slice(0, 10))

    // === Step 2 ===
    // Convert to XML using XMLBuilder.

    const options = {
        arrayNodeName: 'card',
        ignoreAttributes: false,
        attributeNamePrefix: '@@',
        format: true,
    }
    const CardsBuilder = new XMLBuilder(options)
    console.log(`Building...`)
    const cardsXmlString: string = CardsBuilder.build(cctCards)
    console.log(`Building finished.`)

    /// === Write ===
    write(resolve(__dirname, `./out/pokemtg.json`), JSON.stringify(cctCards), 'utf8')
    console.log(`Writing JSON complete.`)
    write(resolve(__dirname, `./out/pokemtg.xml`), cardsXmlString, 'utf8')
    console.log(`Writing XML complete.`)
}
