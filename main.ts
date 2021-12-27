import { readFileSync as read } from 'fs'
import { resolve } from 'path'


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


import cardData from './in/rawData'


if (require.main === module) {
    console.log(cardData)
}
