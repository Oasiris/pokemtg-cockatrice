
import uniq from 'lodash/fp/uniq'

import cardData from './in/rawData'
import { CardUtil } from './main'

it('getBaseTypes works', () => {
    // Call getBaseType on every card in cardData.
    const representedTypes: Set<string> = new Set()
    for (const data of cardData) {
        const shortType = CardUtil.getBaseType(data.types)
        representedTypes.add(shortType)
    }
    const actualTypes: string[] = Array.from(representedTypes)
    actualTypes.sort()

    const expectedTypes = [
        'Emblem',
        'Creature',
        'Enchantment',
        'Sorcery',
        'Artifact',
        'Instant',
        'Planeswalker',
        'Land'
    ]
    expectedTypes.sort()

    expect(actualTypes).toEqual(expectedTypes)
    
    
})