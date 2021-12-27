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
}




if (require.main === module) {
    const representedTypes: Set<string> = new Set()
    for (const data of cardData) {
        const shortType = CardUtil.getBaseType(data.types)
        representedTypes.add(shortType)
    }
    const actualTypes: string[] = Array.from(representedTypes)
    actualTypes.sort()

    console.log(actualTypes)
}
