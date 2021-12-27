import { readFileSync as read } from 'fs'
import { resolve } from 'path'

import uniq from 'lodash/fp/uniq'

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
}




if (require.main === module) {
    let counter = 0
    for (const data of cardData) {
        if (counter++ >= 50) {
            console.log(data.name)
            const manaCost = CardUtil.getManaCost(data.manaCost)
            console.log(manaCost)
        }
        // TODO
    }
}
