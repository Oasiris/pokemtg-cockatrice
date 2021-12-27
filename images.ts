/*
 * The goal of this file is to scrape every image off
 * the PlaneSculptors website, download them all, and then
 * convert them all to JPGs.
 */

import fs from 'fs'
import { resolve } from 'path'

import axios from 'axios'
import * as Jimp from 'jimp'
import uniq from 'lodash/fp/uniq'

import cardData from './in/rawData'

const IMG_FOLDER_BASE = './assets/img/'

// ——————————————

async function downloadImage(url: string, imagePath: string): Promise<void> {
    const fetchPromise = axios(url, { responseType: 'stream' })
    const fetchResponse = await fetchPromise

    const savePromise = new Promise((resolve, reject) => {
        fetchResponse.data
            .pipe(fs.createWriteStream(imagePath))
            .on('finish', () => resolve(null))
            .on('error', (e) => reject(e))
    })
    await savePromise
}

// ————————————————————————————————————
// Download images in order.
async function main() {
    // Get all image URLs.
    const cards = cardData.map((psCard) => ({
        url: psCard.artUrl,
        name: psCard.name,
        nameUri: encodeURIComponent(psCard.name),
        id: psCard.cardId,
    }))
    const imagePaths = cards.map(({ nameUri }) =>
        resolve(__dirname, IMG_FOLDER_BASE, `${nameUri}.png`),
    )

    console.log(cards)

    // Ensure that every card's name is unique.
    const cardNames = cards.map(({ name }) => name)
    const numCards = cardNames.length
    const numUniqNames = uniq(cardNames).length
    if (numCards !== numUniqNames) {
        throw Error(`Ununique card names (${numCards} vs ${numUniqNames})`)
    }

    // === Download ===
    let existingImagePaths: string[] = []

    // Start downloading images from PlaneSculptor.
    for (const i in cards) {
        const card = cards[i]
        const imagePath = imagePaths[i]

        // Skip if the file was already saved to our disk.
        if (fs.existsSync(imagePath)) {
            console.log(`${Number(i) + 1}/${numCards}: Skipped!`)
            existingImagePaths.push(imagePath)
        } else {
            // Save the file.
            await downloadImage(card.url, imagePath)
            console.log(`${Number(i) + 1}/${numCards}: Downloaded.`)
            existingImagePaths.push(imagePath)
        }
    }

    // === Post-Process ===
    // Double-faced cards should be split into their front and back PNGs.
    for (const i in existingImagePaths) {
        const imagePath = existingImagePaths[i]
        const img: Jimp = await Jimp.read(imagePath)
        // If the image is wider than it is tall, it's a double-faced card.
        const isWide = img.bitmap.width > img.bitmap.height
        if (isWide) {
            console.log(`Writing for ${imagePath}...`)
            // Prepare to write left and right halves.
            const left = img.clone()
            const right = img.clone()
            const halfWidth = Math.ceil(img.bitmap.width / 2)
            left.crop(0, 0, halfWidth, img.bitmap.height)
            right.crop(img.bitmap.width - halfWidth, 0, halfWidth, img.bitmap.height)
            left.writeAsync(imagePath.slice(0, imagePath.length - 4) + '_FRONT.png')
            right.writeAsync(imagePath.slice(0, imagePath.length - 4) + '_BACK.png')
        }
    }

    // Done!
    console.log('Complete.')
}

if (require.main === module) {
    main()
}
